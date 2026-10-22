import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { ParseRequestBodySchema } from '../lib/schemas.js';
import { extraerFichaTecnica } from '../services/gemini.js';
import { validarExpediente } from '../services/validation.js';

const router = Router();

/**
 * POST /api/parse
 * Transforma texto informal en FichaTecnica estructurada + Alertas del expediente.
 */
router.post('/', validateBody(ParseRequestBodySchema), async (req, res, next) => {
  try {
    const { texto } = req.validatedBody;
    const { ficha, modo } = await extraerFichaTecnica(texto);
    const { alertas } = validarExpediente(ficha);

    res.status(200).json({
      ficha,
      alertas,
      textoOriginal: texto,
      modo
    });
  } catch (err) {
    next(err);
  }
});

export default router;
