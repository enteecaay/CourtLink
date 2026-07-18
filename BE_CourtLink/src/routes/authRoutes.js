//
//    EXPRESS ROUTER — MODULAR ROUTE DEFINITIONS
//
//   express.Router() creates a mini "sub-application" that
//   you can mount on your main app at a specific path.
//
//   In app.js: app.use("/api/v1/auth", authRoutes)
//   Here:      router.post("/login", ...)
//   Result:    POST /api/v1/auth/login
//              ^^^^^^^^^^^^^^^^ ^^^^^^
//              from app.use     from router.post
//
//    THE MIDDLEWARE CHAIN IN ACTION:
//
//   router.post("/register", validate(registerSchema), register)
//
//                            middleware #1            handler
//                            (validates body)        (creates
//                                                     user)
//
//   Request flow:
//     → express.json() parses body
//     → validate() checks body against Joi schema
//        ↳ If invalid: returns 400, chain STOPS
//        ↳ If valid:   calls next(), chain CONTINUES
//     → register() runs the controller logic
//

import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authController.js";
import validate from "../middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validations/authValidation.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

//
//  PUBLIC ROUTES (no auth required)
//

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new account
 *     description: Create a new user account with name, email, password, and phone number. The account will be assigned the "Player" role by default.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *                 description: Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *                 description: Must be a valid Vietnamese phone number (10 digits, starting with 0)
 *               roleId:
 *                 type: integer
 *                 description: Optional. If provided, must be a valid role ID. Defaults to "Player" role if not provided.
 *                 example: 5
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post("/register", validate(registerSchema), register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to your account
 *     description: Login with email and password. Returns an access token (15 min) and a refresh token (7 days).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Exchange a valid refresh token for a new access token and refresh token. The old refresh token is invalidated (one-time use).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: a1b2c3d4e5f6...
 *     responses:
 *       200:
 *         description: New tokens generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout
 *     description: Revoke the refresh token. The access token remains valid until it expires naturally.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", validate(refreshTokenSchema), logout);

//
//  PROTECTED ROUTES (auth required)
//
//  Notice "protect" middleware comes BEFORE the controller.
//    Express runs middleware left-to-right:
//    protect → getMe
//    If protect fails (no/invalid token), getMe never runs.

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     description: Returns the profile of the currently authenticated user. Requires a valid access token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, getMe);

export { router as authRoutes };
