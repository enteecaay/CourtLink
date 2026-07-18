//
//    THE CONTROLLER LAYER
//
//   Controllers are the "brains" of each endpoint. They:
//     1. Extract data from the request (req.body, req.params)
//     2. Call model functions to interact with the database
//     3. Send back a response (res.json, res.status)
//
//   Controllers should NOT:
//      Validate input (that's the middleware's job)
//      Talk to Prisma directly (that's the model's job)
//      Handle auth checks (that's the auth middleware's job)
//
//    ASYNC ERROR HANDLING IN EXPRESS
//
//   Every async controller MUST have a try/catch block.
//   In the catch, call next(error) to pass the error to the
//   centralized error handler middleware.
//
//   Without try/catch, an unhandled promise rejection will
//   crash your server or hang the request forever.
//

import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findRoleByName,
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

//
//  POST /api/v1/auth/register
//
//  FLOW:
//   1. Joi middleware already validated the body (name, email, password, phoneNumber)
//   2. Check if email already exists
//   3. Hash the password (NEVER store plain text passwords!)
//   4. Find the default "Player" role
//   5. Create the user in the database
//   6. Return the created user (without password)

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, roleId } = req.body;

    //  Step 1: Check for duplicate email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      //  409 Conflict = the request conflicts with existing data
      return res.status(409).json({
        status: "fail",
        message: "Email already exists",
      });
    }

    //  Step 2: Hash the password
    //  bcrypt.hash(password, saltRounds)
    //    Salt = random data added before hashing so identical passwords
    //    produce different hashes. "10" = 2^10 rounds of hashing.
    //    Higher = more secure but slower. 10 is the sweet spot.
    const hashedPassword = await bcrypt.hash(password, 10);

    let finalRoleId = roleId;

    if (!finalRoleId) {
      //  Step 3: Get the default role
      const playerRole = await findRoleByName("Player");
      if (!playerRole) {
        // This shouldn't happen if seeds ran, but defensive coding is important
        return res.status(500).json({
          status: "error",
          message: "Default role not found. Please run database seeds.",
        });
      }
      finalRoleId = playerRole.id;
    }

    //  Step 4: Create the user
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      roleId: finalRoleId,
    });

    //  201 Created = a new resource was successfully created
    //    Convention: return the created resource in the response
    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: { user },
    });
  } catch (error) {
    //  next(error) passes the error to the error handling middleware
    //    (errorMiddleware.js) instead of crashing the server
    next(error);
  }
};

//
//  POST /api/v1/auth/login
//
//  FLOW:
//   1. Find user by email
//   2. Compare password with stored hash
//   3. Generate access token (short-lived JWT)
//   4. Generate refresh token (random string, stored in DB)
//   5. Return both tokens
//
//  SECURITY TIP:
//   NEVER tell the user whether the email or password was wrong.
//   Always say "Invalid email or password" to prevent email enumeration
//   (attackers testing which emails exist in your system).

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //  Step 1: Find the user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password", // Intentionally vague!
      });
    }

    //  Step 2: Compare passwords
    //  bcrypt.compare(plainText, hash)
    //    This is TIMING-SAFE: it takes the same time whether the password
    //    is wrong at char 1 or char 100 (prevents timing attacks).
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password", // Same message as above!
      });
    }

    //  Step 3: Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    //  Step 4: Store refresh token in DB
    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await createRefreshToken(user.id, refreshToken, expiresAt);

    //  Step 5: Send response
    //  200 OK = the standard success response
    res.json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//
//  POST /api/v1/auth/refresh-token
//
//  FLOW:
//   1. Client sends their refresh token
//   2. Look it up in the database
//   3. Check if it's expired
//   4. Delete the old refresh token (one-time use!)
//   5. Generate new access token + new refresh token
//   6. Return the new tokens
//
//  TOKEN ROTATION:
//   Each refresh token can only be used ONCE. After use, we delete
//   it and issue a new one. If an attacker steals a refresh token
//   and uses it, the real user's next refresh will fail — alerting
//   them that something is wrong.

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    //  Step 1: Find the token in DB
    const storedToken = await findRefreshToken(token);
    if (!storedToken) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid refresh token",
      });
    }

    //  Step 2: Check expiration
    if (new Date() > storedToken.expiredAt) {
      // Clean up expired token
      await deleteRefreshToken(token);
      return res.status(401).json({
        status: "fail",
        message: "Refresh token has expired. Please login again.",
      });
    }

    //  Step 3: Delete old token (one-time use)
    await deleteRefreshToken(token);

    //  Step 4: Get user and generate new tokens
    const user = await findUserById(storedToken.userId);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await createRefreshToken(user.id, newRefreshToken, expiresAt);

    res.json({
      status: "success",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

//
//  POST /api/v1/auth/logout
//
//  FLOW:
//   1. Client sends their refresh token
//   2. Delete it from the database → it can never be used again
//
//  NOTE: The access token is still valid until it expires (15 min).
//    You CANNOT "invalidate" a JWT — it's stateless by design.
//    That's why access tokens are kept short-lived.

export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    // Try to delete the token (if it exists)
    const storedToken = await findRefreshToken(token);
    if (storedToken) {
      await deleteRefreshToken(token);
    }

    //  Always return success even if token wasn't found.
    // This prevents attackers from probing which tokens are valid.
    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

//
//  GET /api/v1/auth/me
//
//  THIS IS A PROTECTED ROUTE
//    The auth middleware runs BEFORE this controller.
//    It verifies the JWT and puts the decoded payload on req.user.
//    So by the time we get here, req.user = { id: 1, roleId: 5 }
//
//  Route definition looks like:
//    router.get("/me", protect, getMe)
//                      ^^^^^^^ middleware runs first

export const getMe = async (req, res, next) => {
  try {
    //  req.user was set by the auth middleware
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
