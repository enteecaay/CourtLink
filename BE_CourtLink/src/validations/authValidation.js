// 
//    JOI VALIDATION SCHEMAS                                   
//                                                               
//   Joi lets you define the "shape" of expected data.           
//   Think of it as a contract: "this endpoint expects an        
//   object with these exact fields and these rules."            
//                                                               
//   WHY VALIDATE?                                               
//   1. Security: Prevent SQL injection, XSS, malformed data    
//   2. Clean errors: "email is required" vs a cryptic DB error  
//   3. Data integrity: Ensure data meets your business rules    
//   4. Documentation: Schema = self-documenting API contract    
// 

import Joi from "joi";

//  Register Schema 

export const registerSchema = Joi.object({
  // Joi.string()         → must be a string
  //   .min(2).max(50)    → length constraints
  //   .required()        → field is mandatory
  name: Joi.string().min(2).max(50).required().messages({
    // You can customize error messages per rule:
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  // Password validation with regex for strength:
  //   - At least 8 characters
  //   - At least 1 uppercase, 1 lowercase, 1 number
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
      "any.required": "Password is required",
    }),

  // Vietnamese phone number format
  phoneNumber: Joi.string()
    .pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid Vietnamese phone number",
      "any.required": "Phone number is required",
    }),
  // roleId is optional; if provided, must be a positive integer
  roleId: Joi.number().integer().positive().optional().messages({
    "number.integer": "Role ID must be an integer",
    "number.positive": "Role ID must be a positive number",
  }),
});

//  Login Schema 

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  // For login, we don't enforce password rules —
  // just check it exists. The DB comparison handles the rest.
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

//  Refresh Token Schema 

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});
