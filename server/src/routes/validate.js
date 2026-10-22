import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { ValidateRequestBodySchema } from '../lib/schemas.js';
import { validarExpediente } from '../services/validation.js';

const router = Router();

/**
 * POST /api/validate
 * Re-valida una ficha técnica editada por el usuario (sin llamar a Gemini).
 */
router.post('/', validateBody(ValidateRequestBodySchema), (req, res) => {
  const { ficha } = req.validatedBody;
  const resultado = validarExpediente(ficha);
  res.status(200).json(resultado);
});

export default router;
