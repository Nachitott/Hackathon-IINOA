import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { RfqRequestBodySchema } from '../lib/schemas.js';
import { generarRFQ } from '../services/rfq-generator.js';

const router = Router();

/**
 * POST /api/rfq
 * Genera el asunto, cuerpo y advertencias del documento RFQ formal.
 */
router.post('/', validateBody(RfqRequestBodySchema), (req, res) => {
  const { ficha, corredorId } = req.validatedBody;
  const rfq = generarRFQ(ficha, corredorId);
  res.status(200).json({ rfq });
});

export default router;
