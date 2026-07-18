// 
//    CENTRALIZED ERROR HANDLING IN EXPRESS                    
//                                                               
//   This middleware catches ALL errors from the entire app.     
//   When any controller calls next(error), Express skips all   
//   remaining middleware and jumps straight here.               
//                                                               
//    ERROR MIDDLEWARE SIGNATURE:                               
//     (err, req, res, next)  ← FOUR parameters!                
//                                                               
//   Express identifies error middleware by having exactly 4     
//   parameters. Regular middleware has 3: (req, res, next).     
//   This is why the 4th parameter "next" must be there even    
//   if you don't use it — DO NOT remove it!                    
// 

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (only visible on the server)
  console.error(` [${req.method}] ${req.path} →`, err.message);

  //  Handle specific Prisma errors 
  //  Prisma throws errors with specific codes.
  //    P2002 = unique constraint violation (e.g. duplicate email)
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({
      status: "fail",
      message: `A record with this ${field} already exists`,
    });
  }

  //  Handle known operational errors 
  //  Operational errors = expected things that go wrong
  //    (bad input, not found, unauthorized)
  //    We set err.status in our code before calling next(err)
  if (err.status) {
    return res.status(err.status).json({
      status: "fail",
      message: err.message,
    });
  }

  //  Handle unknown/unexpected errors 
  //  Programming errors = bugs in our code (null reference, etc.)
  //    NEVER expose internal error details to the client.
  //    In production, just say "Internal Server Error".
  const statusCode = 500;
  res.status(statusCode).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message, // Show details only in development
  });
};

export default errorHandler;