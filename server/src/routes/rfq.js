import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { RfqRequestBodySchema, RfqPdfRequestBodySchema } from '../lib/schemas.js';
import { generarRFQ } from '../services/rfq-generator.js';
import { generarPdfRfq } from '../services/pdf.js';

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

/**
 * POST /api/rfq/pdf
 * Exporta el cuerpo y asunto del RFQ a un archivo PDF binario descargable.
 */
router.post('/pdf', validateBody(RfqPdfRequestBodySchema), async (req, res, next) => {
  try {
    const { asunto, texto } = req.validatedBody;
    const pdfBuffer = await generarPdfRfq({ asunto, texto });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="solicitud-rfq.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
