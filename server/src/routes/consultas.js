import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { ConsultaCreateBodySchema } from '../lib/schemas.js';
import { supabaseAdmin } from '../db/supabase.js';
import crypto from 'crypto';

const router = Router();

// Almacén en memoria de respaldo para garantizar demo sin base de datos activa
const localConsultasStore = [];

/**
 * POST /api/consultas
 * Guarda una consulta con su texto original, ficha estructurada y alertas.
 */
router.post('/', requireAuth, validateBody(ConsultaCreateBodySchema), async (req, res, next) => {
  try {
    const { textoOriginal, ficha, alertas } = req.validatedBody;
    const userId = req.user?.id || null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('consultas')
        .insert({
          user_id: userId,
          texto_original: textoOriginal,
          ficha,
          alertas
        })
        .select()
        .single();

      if (error) {
        console.error('⚠️ [Supabase DB Error]', error);
        // Fallback a almacenamiento local si la tabla aún no fue creada
        const localRecord = {
          id: crypto.randomUUID(),
          user_id: userId,
          texto_original: textoOriginal,
          ficha,
          alertas,
          created_at: new Date().toISOString()
        };
        localConsultasStore.unshift(localRecord);
        return res.status(201).json(localRecord);
      }

      return res.status(201).json(data);
    } else {
      // Modo local/demo
      const localRecord = {
        id: crypto.randomUUID(),
        user_id: userId,
        texto_original: textoOriginal,
        ficha,
        alertas,
        created_at: new Date().toISOString()
      };
      localConsultasStore.unshift(localRecord);
      return res.status(201).json(localRecord);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/consultas
 * Devuelve el historial de consultas del usuario autenticado (o todas en modo demo).
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || null;

    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from('consultas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('⚠️ [Supabase] Error consultando tabla consultas. Devolviendo almacén local:', error.message);
        return res.status(200).json({ consultas: localConsultasStore });
      }

      return res.status(200).json({ consultas: data || [] });
    } else {
      return res.status(200).json({ consultas: localConsultasStore });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
