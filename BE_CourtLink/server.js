import express from "express";

import { swaggerUi, specs } from "./swagger.js";
import dotenv from "dotenv";
import { app } from "./src/app.js";
// require('dotenv').config();
// const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Tích hợp giao diện Swagger tại đường dẫn /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Kiểm tra trạng thái hệ thống
 *     description: Trả về trạng thái hoạt động hiện tại của Express API.
 *     responses:
 *       200:
 *         description: Phản hồi thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Express API is running smoothly
 */
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "Express API is running smoothly",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
