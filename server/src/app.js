import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import parseRouter from './routes/parse.js';
import validateRouter from './routes/validate.js';
import corredoresRouter from './routes/corredores.js';
import rfqRouter from './routes/rfq.js';
import authRouter from './routes/auth.js';
import consultasRouter from './routes/consultas.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());

// Rutas base y módulos core
app.use('/api/health', healthRouter);
app.use('/api/parse', parseRouter);
app.use('/api/validate', validateRouter);
app.use('/api/corredores', corredoresRouter);
app.use('/api/rfq', rfqRouter);
app.use('/api/auth', authRouter);
app.use('/api/consultas', consultasRouter);

// Manejo de 404 y Errores estándar según contrato
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
