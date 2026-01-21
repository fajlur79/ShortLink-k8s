import express from "express";
import generateKeyRoute from "./token/generate.js";
import getKeyRoute from "./token/getKey.js";
import usageRoute from "./token/usage.js";
import redirectRoute from "./urls/redirect.js";
import shortenRoute from "./urls/shorten.js";

const router = express.Router();
const mode = process.env.APP_MODE;

console.log(`[Router] Initializing in ${mode} mode`);

if (mode === "writer" || mode === "monolith") {
    router.use("/generate-key", generateKeyRoute);
    router.use("/shorten", shortenRoute);
}

if (mode === "reader" || mode === "monolith") {
    router.use("/get-key", getKeyRoute);
    router.use("/usage", usageRoute);
    router.use("/", redirectRoute);
}

export default router;
