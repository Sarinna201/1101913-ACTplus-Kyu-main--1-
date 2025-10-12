// lib/swagger.ts
import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Next.js API",
      version: "1.0.0",
    },
  },
  // scan ทั้งไฟล์ api ที่มี JSDoc
  apis: ["./pages/api/**/*.ts"], 
};

export const swaggerSpec = swaggerJsdoc(options);
