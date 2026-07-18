// 
//    EXPRESS MIDDLEWARE — THE #1 CONCEPT TO UNDERSTAND        
//                                                               
//   Middleware = a function that sits BETWEEN the request       
//   arriving and the controller running. It can:                
//     1. Modify the request (e.g. parse JSON body)              
//     2. Reject the request (e.g. validation failed)            
//     3. Pass to the next middleware via next()                  
//                                                               
//   The request flows through a CHAIN of middleware:            
//                                                               
//   Request → express.json() → validate() → controller         
//               ↑                  ↑            ↑               
//           parses body      checks data    does work           
//                                                               
//   Every middleware has the signature: (req, res, next)        
//     - req:  the incoming request object                       
//     - res:  the response object (to send data back)           
//     - next: a function to call the NEXT middleware            
//                                                               
//   If you DON'T call next(), the request stops there.          
//   If you DO call next(), it moves to the next middleware.     
// 

// 
//    HIGHER-ORDER FUNCTIONS (MIDDLEWARE FACTORIES)            
//                                                               
//   validate(schema) doesn't directly handle requests.          
//   It RETURNS a middleware function. This is called a          
//   "higher-order function" or "middleware factory".            
//                                                               
//   Usage in routes:                                            
//     router.post("/login", validate(loginSchema), login)       
//                           ^^^^^^^^^^^^^^^^^^^^^^^^            
//     validate(loginSchema) is called ONCE at startup.          
//     It returns (req, res, next) => { ... } which runs         
//     on every request to this route.                           
// 

const validate = (schema) => {
  // This returned function IS the actual middleware
  return (req, res, next) => {
    // schema.validate() runs the Joi schema against req.body
    // Options:
    //   abortEarly: false → show ALL errors, not just the first one
    //   stripUnknown: true → remove fields not defined in the schema
    //                        (security: prevents clients from injecting extra data)
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Joi provides detailed error messages for each field
      // error.details is an array like:
      //   [{ message: '"email" must be a valid email', path: ['email'] }]
      const messages = error.details.map((detail) => detail.message);

      //  We return a 400 (Bad Request) because the CLIENT sent bad data.
      //    Notice we DON'T call next() — the request STOPS here.
      return res.status(400).json({
        status: "fail",
        message: "Validation error",
        errors: messages,
      });
    }

    //  Replace req.body with the validated & stripped value.
    // This means the controller only sees clean, validated data.
    req.body = value;

    //  Call next() to pass control to the NEXT middleware (the controller)
    next();
  };
};

export default validate;
