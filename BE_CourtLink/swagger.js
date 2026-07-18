import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CourtLink API",
      version: "1.0.0",
      description: "API documentation for the CourtLink badminton court booking platform",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    //  SECURITY SCHEME — tells Swagger how authentication works.
    //    After adding this, Swagger UI shows an "Authorize" button
    //    where you can paste your JWT token. All endpoints marked with
    //    "security: [{ bearerAuth: [] }]" will auto-include the token.
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
    },
  },
  // Scan these files for @openapi JSDoc comments
  apis: ["./server.js", "./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
