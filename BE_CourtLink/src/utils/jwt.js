// 
//    JWT (JSON Web Token) — HOW IT WORKS                      
//                                                               
//   A JWT has 3 parts separated by dots:                        
//     header.payload.signature                                  
//                                                               
//   1. Header:    { alg: "HS256", typ: "JWT" }                  
//   2. Payload:   { id: 1, role: "Player", iat: ..., exp: ... } 
//   3. Signature: HMAC-SHA256(header + payload, SECRET_KEY)     
//                                                               
//   The server signs tokens with a SECRET_KEY.                  
//   When a client sends a token back, the server verifies the   
//   signature to make sure nobody tampered with it.             
//                                                               
//    ACCESS TOKEN vs REFRESH TOKEN                            
//      
//   Access Token:  Short-lived (15 min). Sent with every API    
//                  request in the Authorization header.         
//   Refresh Token: Long-lived (7 days). Stored in DB. Used     
//                  ONLY to get a new access token when the      
//                  current one expires. Can be revoked.         
//                                                               
//   WHY TWO TOKENS?                                             
//   If an access token is stolen, it expires fast (15 min).     
//   Refresh tokens live in the DB so you can revoke them        
//   (e.g. on logout or suspicious activity).                    
// 

import jwt from "jsonwebtoken";
import crypto from "crypto";

//  Access Token 
// Short-lived token that the client sends with every request.
// Contains the user's ID and role so the server doesn't need
// to hit the database on every single request.

export const generateAccessToken = (user) => {
  // jwt.sign(payload, secret, options)
  //   payload: data you want to embed in the token
  //   secret:  the key used to sign (from .env)
  //   expiresIn: when this token becomes invalid
  return jwt.sign(
    { id: user.id, roleId: user.roleId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // 15 minutes — short for security
  );
};

//  Refresh Token 
// Long-lived random string stored in the database.
// NOT a JWT — just a random hex string. We look it up in the DB
// to verify it, which means we can delete it to revoke access.

export const generateRefreshToken = () => {
  // crypto.randomBytes(40) generates 40 random bytes
  // .toString("hex") converts to a 80-character hex string
  return crypto.randomBytes(40).toString("hex");
};

//  Verify Access Token 
// Used by the auth middleware to check if a token is valid.
// Returns the decoded payload (e.g. { id: 1, roleId: 5 })
// or throws an error if the token is invalid/expired.

export const verifyAccessToken = (token) => {
  // jwt.verify() throws specific errors:
  //   - TokenExpiredError: token has expired
  //   - JsonWebTokenError: token is malformed or signature is invalid
  return jwt.verify(token, process.env.JWT_SECRET);
};
