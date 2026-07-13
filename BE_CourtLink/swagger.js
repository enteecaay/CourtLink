import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API với Swagger",
      version: "1.0.0",
      description: "Tài liệu hướng dẫn sử dụng các endpoints API",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  // Đường dẫn đến các file chứa mã nguồn API để Swagger quét tài liệu
  apis: ["./server.js", "./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
