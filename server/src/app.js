import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());

// Rutas base
app.use('/api/health', healthRouter);

// Manejo de 404 y Errores estándar según contrato
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
