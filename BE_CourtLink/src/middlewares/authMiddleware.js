// 
//    AUTHENTICATION vs AUTHORIZATION                          
//                                                               
//   Authentication = "WHO are you?" (verify JWT token)          
//   Authorization  = "WHAT can you do?" (check user's role)     
//                                                               
//   This file has TWO middlewares:                               
//     1. protect     → checks if user is logged in (AuthN)      
//     2. authorize   → checks if user has the right role (AuthZ)
//                                                               
//   Usage in routes:                                            
//     // Anyone logged in can access:                            
//     router.get("/me", protect, getMe)                          
//                                                               
//     // Only Admin can access:                                  
//     router.get("/users", protect, authorize("Admin"), getAll)  
//                                                               
//     // Admin OR Manager can access:                            
//     router.delete("/x", protect, authorize("Admin","Manager"))
// 

import { verifyAccessToken } from "../utils/jwt.js";

// 
//  PROTECT MIDDLEWARE — Verify JWT
// 
//  HOW THE CLIENT SENDS THE TOKEN:
//    The client includes the JWT in the "Authorization" header:
//      Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//                     ^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^
//                     prefix  the actual token
//
//    "Bearer" is a convention from the OAuth 2.0 standard.

export const protect = (req, res, next) => {
  //  Step 1: Extract the token from the header 
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "fail",
      message: "Access denied. No token provided.",
    });
  }

  // "Bearer eyJhbGci...".split(" ") → ["Bearer", "eyJhbGci..."]
  const token = authHeader.split(" ")[1];

  try {
    //  Step 2: Verify the token 
    // If valid, returns the payload: { id: 1, roleId: 5, iat: ..., exp: ... }
    // If invalid/expired, throws an error → caught in the catch block
    const decoded = verifyAccessToken(token);

    //  Step 3: Attach user info to the request 
    //  This is the KEY pattern: middleware modifies req, then
    //    the next middleware/controller can read it.
    //    Any middleware after this can access req.user
    req.user = decoded;

    //  Step 4: Pass to the next middleware 
    next();
  } catch (error) {
    //  JWT throws different error types — we give specific messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Token has expired. Please refresh your token.",
      });
    }

    return res.status(401).json({
      status: "fail",
      message: "Invalid token.",
    });
  }
};

// 
//  AUTHORIZE MIDDLEWARE — Check Role
// 
//  This is another middleware factory (like validate.js).
//    It takes a list of allowed roles and returns a middleware.
//
//    authorize("Admin", "Manager") returns (req, res, next) => { ... }
//
//  REST PARAMETER (...roles):
//    The "..." collects all arguments into an array.
//    authorize("Admin", "Manager") → roles = ["Admin", "Manager"]

export const authorize = (...allowedRoleIds) => {
  return (req, res, next) => {
    // req.user was set by the protect middleware (must run first!)
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required",
      });
    }

    // Check if the user's roleId is in the allowed list
    if (!allowedRoleIds.includes(req.user.roleId)) {
      //  403 Forbidden = you're logged in but don't have permission
      //    (vs 401 Unauthorized = you're not logged in at all)
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};