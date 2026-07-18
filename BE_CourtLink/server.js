//
//    SERVER.JS — THE ENTRY POINT
//
//   This file only does TWO things:
//   1. Set up Swagger documentation
//   2. Start the HTTP server on a port
//
//   All app configuration (middleware, routes) lives in app.js
//   This separation is important for testing — you can import
//   the app without starting the server.
//

import { swaggerUi, specs } from "./swagger.js";
import dotenv from "dotenv";
import { app } from "./src/app.js";

//  dotenv.config() loads variables from .env file into process.env
//    Must be called early so all modules can access env variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @openapi
 * /api/status:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Returns the current status of the Express API.
 *     responses:
 *       200:
 *         description: API is running.
 */
app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "Express API is running smoothly",
  });
});

// app.listen() starts the HTTP server.
//    The callback runs once the server is ready to accept connections.
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
