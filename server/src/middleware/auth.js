import { supabaseAdmin, getUserClient } from '../db/supabase.js';

/**
 * Middleware para validar el JWT de Supabase Auth.
 * Si AUTH_OPTIONAL está activo (o no se configuró Supabase), permite pasar como usuario demo.
 */
export async function requireAuth(req, res, next) {
  const isAuthOptional = process.env.AUTH_OPTIONAL === 'true' || !process.env.SUPABASE_URL;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isAuthOptional) {
      req.user = {
        id: null,
        email: 'demo@logistica-noa.ar',
        isDemo: true
      };
      return next();
    }
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Acceso no autorizado: Se requiere encabezado Authorization: Bearer <token>'
      }
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data?.user) {
        if (isAuthOptional) {
          req.user = { id: null, email: 'demo@logistica-noa.ar', isDemo: true };
          return next();
        }
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token de autenticación inválido o expirado'
          }
        });
      }
      req.user = data.user;
      req.userClient = getUserClient(token);
      return next();
    } else {
      // Sin Supabase configurado pero con token
      req.user = { id: null, email: 'demo@logistica-noa.ar', isDemo: true };
      return next();
    }
  } catch (err) {
    if (isAuthOptional) {
      req.user = { id: null, email: 'demo@logistica-noa.ar', isDemo: true };
      return next();
    }
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: `Error al verificar token: ${err.message}`
      }
    });
  }
}
