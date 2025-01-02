const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for your application",
    },
    servers: [
      {
        url: "http://localhost:5500", // Replace with your server URL
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Paths to files with Swagger annotations
};

const specs = swaggerJsdoc(options);
module.exports = specs;
