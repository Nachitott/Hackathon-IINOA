import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let adminClient = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('⚠️ [Supabase] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas en .env. Las funciones de base de datos usarán modo fallback o mock local.');
}

/**
 * Cliente admin de Supabase con permisos de Service Role (ignora RLS).
 * Usar exclusivamente en el servidor.
 */
export const supabaseAdmin = adminClient;

/**
 * Helper para crear un cliente de Supabase scoped al JWT del usuario autenticado.
 * Respeta las políticas de Row Level Security (RLS).
 * @param {string} accessToken - Token JWT de sesión
 */
export function getUserClient(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado (faltan SUPABASE_URL o SUPABASE_ANON_KEY).');
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false
    }
  });
}

export default {
  supabaseAdmin,
  getUserClient
};
