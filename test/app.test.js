import request from "supertest";

const { default: app } = await import("../app.js");
const { default: redisClient } = await import("../services/redisClient.js");

afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("ShortLink Integration Tests", () => {
    it("GET /health should return 200 OK", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toEqual(200);
    });

    it("POST /shorten should save to Redis", async () => {
        const testToken = "test-api-key-123";
        await redisClient.set(`validtoken:${testToken}`, "active");

        const res = await request(app)
            .post("/shorten")
            .set("Cookie", ["deviceId=test-device-123"])
            .set("x-api-key", testToken)
            .send({ url: "https://www.google.com" });

        if (res.statusCode !== 200) {
            console.log("Test Failed Response:", res.body);
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
        const res = await request(app).get("/nonexistent_key");
        expect(res.statusCode).toEqual(404);
    });
});
