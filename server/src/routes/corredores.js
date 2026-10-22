import { Router } from 'express';
import { corredores, depositosFiscales } from '../db/seeds/corredores.js';

const router = Router();

/**
 * GET /api/corredores
 * Devuelve el catálogo de corredores (Pacífico y Atlántico) y depósitos fiscales extraportuarios.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    corredores,
    depositosFiscales
  });
});

export default router;
