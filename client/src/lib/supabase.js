/**
 * Cliente Supabase — N-14.
 * Solo se inicializa si hay env vars: sin VITE_SUPABASE_URL/ANON_KEY
 * la app corre igual en modo demo (la demo nunca se bloquea por auth).
 */

import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/** `true` cuando el equipo configuró el proyecto Supabase (L-01). */
export const SUPABASE_CONFIGURADO = Boolean(URL && KEY)

/** Cliente real o null en modo demo. */
export const supabase = SUPABASE_CONFIGURADO ? createClient(URL, KEY) : null
