import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { userRoutes } from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/users", userRoutes);

// Error Handling Middleware
app.use(errorHandler);

export { app };
