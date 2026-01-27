import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "shopery organic ecommerce API",
      version: "1.0.0",
      description: "API documentation for the shopery organic ecommerce",
    },
    servers: [
      {
        url: "http://localhost:3000/shopery",
        description: "Development server",
      },
      {
        url: "https://shopery-backend.onrender.com/shopery",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token as: **Bearer <token>**",
        },
      },
    },
  },
  // 👇 Paths to your route files for auto docs
  apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
