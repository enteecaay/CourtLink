// 
//    APP.JS — THE APPLICATION SETUP FILE                     
//                                                               
//   This file configures the Express "app" object.              
//   It's separated from server.js so you can:                   
//   1. Import the app in tests (without starting the server)    
//   2. Keep configuration logic separate from startup logic     
//                                                               
//    MIDDLEWARE EXECUTION ORDER MATTERS!                      
//   Express runs middleware in the order you call app.use().    
//   If you put errorHandler BEFORE routes, it won't catch      
//   route errors. Order must be:                                
//     1. Global middleware (helmet, cors, json parser, logger)  
//     2. Routes (your API endpoints)                            
//     3. Error handler (catches errors from routes)             
// 

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorMiddleware.js";

const app = express();

// 
//  1. GLOBAL MIDDLEWARE — runs on EVERY request
// 

//  helmet() sets security-related HTTP headers (e.g. prevents clickjacking)
app.use(helmet());

//  cors() enables Cross-Origin Resource Sharing.
//    Without it, your frontend (localhost:3001) can't call your
//    backend (localhost:3000) because browsers block cross-origin requests.
app.use(cors());

//  express.json() parses incoming JSON request bodies.
//    After this middleware, req.body contains the parsed JSON object.
//    Without it, req.body would be undefined!
app.use(express.json());

//  morgan("dev") logs HTTP requests to the console:
//    "POST /api/v1/auth/login 200 45.123 ms"
//    Great for debugging during development.
app.use(morgan("dev"));

// 
//  2. ROUTES — your API endpoints
// 
//  app.use(prefix, router) mounts a router at a path prefix.
//    All routes inside authRoutes will be prefixed with /api/v1/auth
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// 
//  3. ERROR HANDLER — MUST be last
// 
//  This catches all errors thrown by routes above.
//    It must be defined AFTER all routes to catch their errors.
app.use(errorHandler);

export { app };
