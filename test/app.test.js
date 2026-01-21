import { jest } from "@jest/globals";
import request from "supertest";

process.env.APP_MODE = "monolith";
const { default: app } = await import("../app.js");
const { default: redisClient } = await import("../services/redisClient.js");

afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("ShortLink Integration Tests", () => {
    jest.setTimeout(30000);

    it("should verify Redis is connected", async () => {
        await redisClient.set("sanity-check", "alive");
        const val = await redisClient.get("sanity-check");
        expect(val).toEqual("alive");
    });

    it("GET /health should return 200 OK", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toEqual(200);
    });

    it("POST /shorten should save to Redis", async () => {
        const uniqueToken = `test-user-${Date.now()}`;
        await redisClient.set(`validtoken:${uniqueToken}`, "active");

        const res = await request(app)
            .post("/shorten")
            .set("x-api-key", uniqueToken)
            .set("Cookie", ["deviceId=test-device-1"])
            .send({ url: "https://www.google.com/" });

        if (res.statusCode !== 200) {
            console.error("/shorten Failed:", res.body);
        }

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("shortUrl");

        const id = res.body.shortUrl.split("/").pop();
        const storedUrl = await redisClient.get(`short:${id}`);
        expect(storedUrl).toEqual("https://www.google.com/");
    });

    it("GET /:id should redirect correctly", async () => {
        await redisClient.set("short:demo123", "https://www.github.com");

        const res = await request(app).get("/demo123");

        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toEqual("https://www.github.com");
    });

    it("GET /:id should return 404 for missing keys", async () => {
        const res = await request(app).get("/nonexistent-key");
        expect(res.statusCode).toEqual(404);
    });
});
