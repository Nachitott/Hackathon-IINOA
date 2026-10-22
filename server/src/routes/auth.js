import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/auth/health
 * Verifica el estado del middleware de autenticación y datos del usuario.
 */
router.get('/health', requireAuth, (req, res) => {
  res.status(200).json({
    status: 'ok',
    user: req.user
  });
});

export default router;
