/**
 * Wrapper fetch contra el contrato (CONTRATO-API §1/§3) — N-03.
 *
 * - Base URL: `VITE_API_URL` (default http://localhost:3001/api)
 * - `VITE_USE_MOCK=true` desvía todas las llamadas a lib/mocks.js sin tocar red
 *   (el back de Lucas aún no existe — la UI se construye entera con mocks).
 * - Errores: normaliza todo al shape `{ code, message }` del contrato vía ApiError.
 */

import { mockFetch } from './mocks.js'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

/** Flag del backlog N-03: con mocks (default true hasta que exista la API real). */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

/** Error estándar del contrato §1: { error: { code, message } } → instancia con .code/.message/.status */
export class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

const toApiError = (e) =>
  e instanceof ApiError
    ? e
    : new ApiError(e?.error?.code ?? 'UNKNOWN', e?.error?.message ?? e?.message ?? 'Error desconocido')

/**
 * @param {string} path ruta relativa, ej. "/parse"
 * @param {{method?: string, body?: any, token?: string, signal?: AbortSignal}} opts
 * @returns {Promise<any>} el JSON de la response (shape del contrato §3)
 * @throws {ApiError}
 */
export async function apiFetch(path, { method = 'GET', body, token, signal } = {}) {
  if (USE_MOCK) {
    try {
      return await mockFetch(path, { method, body })
    } catch (e) {
      throw toApiError(e)
    }
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (e) {
    throw new ApiError('NETWORK_ERROR', `No se pudo conectar con la API (${e.message})`, 0)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok || data?.error) {
    const err = data?.error ?? {}
    throw new ApiError(err.code ?? `HTTP_${res.status}`, err.message ?? `Error ${res.status}`, res.status)
  }
  return data
}

/* ---------- Helpers por endpoint (contrato §3) ---------- */

/** POST /api/parse — texto informal → ficha + alertas. @returns {Promise<ParseResponse>} */
export const parseTexto = (texto, opts) => apiFetch('/parse', { method: 'POST', body: { texto }, ...opts })

/** POST /api/validate — re-valida ficha editada. @returns {Promise<ValidateResponse>} */
export const validarFicha = (ficha, opts) => apiFetch('/validate', { method: 'POST', body: { ficha }, ...opts })

/** GET /api/corredores. @returns {Promise<CorredoresResponse>} */
export const getCorredores = (opts) => apiFetch('/corredores', opts)

/** POST /api/rfq. @returns {Promise<RfqResponse>} */
export const generarRfq = (ficha, corredorId, opts) =>
  apiFetch('/rfq', { method: 'POST', body: { ficha, corredorId }, ...opts })

/** GET /api/health — smoke test pre-demo. */
export const healthCheck = (opts) => apiFetch('/health', opts)

/** GET /api/consultas (auth). */
export const getConsultas = (opts) => apiFetch('/consultas', opts)

/** POST /api/consultas (auth). */
export const guardarConsulta = (consulta, opts) =>
  apiFetch('/consultas', { method: 'POST', body: consulta, ...opts })
