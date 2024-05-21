import { Router } from "express";
import { health } from "./app/controllers/health";

export const router = Router();

// ======================
// Health Checks
// ======================
router.get("/health", health);
router.get("/", (request, response) => response.json({ message: "Hello World" }));

// ======================
// Endpoints
// ======================


