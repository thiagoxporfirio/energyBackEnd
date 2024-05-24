import { Router } from "express";
import { health } from "./app/controllers/health";
import multer from 'multer';
import path from 'path';
import express from 'express';
import { getDashboardData, uploadAndProcessFaturas } from "./app/controllers/UploadFiles";

export const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ======================
// Health Checks
// ======================
router.get("/health", health);
router.get("/", (request, response) => response.json({ message: "Hello World" }));

// ======================
// Endpoints
// ======================
router.post("/upload-faturas", upload.single('file'), uploadAndProcessFaturas);
router.get('/dashboard', getDashboardData);

const uploadsPath = path.join(__dirname, 'uploads');
router.use('/uploads', express.static(uploadsPath));