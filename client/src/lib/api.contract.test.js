/**
 * Tests de contrato del wrapper api.js — N-19 (preparación del cruce).
 *
 * Cubren las dos caras del wrapper sin necesitar el back real:
 *  1. USE_MOCK=true (stubbed — NO depende del .env local) → shapes exactos
 *     del contrato §2/§3.
 *  2. USE_MOCK=false → apiFetch contra un stub node:http que responde
 *     según el contrato: verifica método, body JSON, Bearer, y la
 *     normalización de errores { error: { code, message } } → ApiError.
 *
 * Cuando el back de Lucas exista, estos mismos asserts se re-corren
 * apuntando VITE_API_URL a :3001.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createServer } from 'node:http'

/* ---------- Stub HTTP que responde según CONTRATO-API ---------- */

const FICHA = {
  contacto: { nombre: null, empresa: null },
  operacion: 'exportacion',
  origen: { ciudad: 'Salta', provincia: 'Salta' },
  destino: { ciudad: null, pais: 'China' },
  carga: { tipo: 'sal', pesoKg: null, volumenM3: null, contenedor: '40ST', cantidad: 2 },
  incoterm: null,
  fechaEstimada: null,
  operativa: { ritmoCargaDiario: null, plazoSobreestadiaDias: null, depositoFiscalVacios: null },
  observaciones: null,
}

const ultimoRequest = { auth: null, body: null, method: null, url: null }

const responder = (req, res) => {
  ultimoRequest.method = req.method
  ultimoRequest.url = req.url
  ultimoRequest.auth = req.headers.authorization ?? null
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    ultimoRequest.body = body ? JSON.parse(body) : null
    const ruta = `${req.method} ${req.url.replace('/api', '')}`
    const json = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify(data))
    }
    switch (ruta) {
      case 'GET /health':
        return json({ status: 'ok' })
      case 'POST /parse':
        return json({ ficha: FICHA, alertas: [{ campo: 'carga.pesoKg', mensaje: 'm', pregunta: 'p', severidad: 'alta' }], textoOriginal: ultimoRequest.body.texto })
      case 'POST /validate':
        return json({ alertas: [], completo: true })
      case 'GET /corredores':
        return json({ corredores: [{ id: 'pacifico', nombre: 'Corredor Bioceánico / Pacífico', pasosFronterizos: ['Paso de Jama'], puertos: [{ nombre: 'Antofagasta', pais: 'CL', lat: -23.65, lng: -70.4 }], tiempoEstimadoDias: 3, pros: [], contras: [], consideraciones: [] }], depositosFiscales: [{ nombre: 'COCEL Salta', ciudad: 'Salta', provincia: 'Salta', nota: 'n' }] })
      case 'POST /rfq':
        return json({ rfq: { asunto: 'RFQ – exportacion sal', texto: 'Estimados...', advertencias: [] } })
      case 'GET /consultas':
        if (!req.headers.authorization) return json({ error: { code: 'UNAUTHORIZED', message: 'Sin token' } }, 401)
        return json({ consultas: [] })
      case 'POST /rfq/pdf':
        res.writeHead(200, { 'Content-Type': 'application/pdf' })
        return res.end(Buffer.from('%PDF-1.4 stub'))
      case 'POST /boom':
        return json({ error: { code: 'VALIDATION_ERROR', message: 'Texto inválido' } }, 400)
      default:
        return json({ error: { code: 'NOT_FOUND', message: 'no existe' } }, 404)
    }
  })
}

let server
let baseUrl
let portMuerto
let apiMock

beforeAll(async () => {
  // El bloque "mocks" corre con USE_MOCK=true stubbed — independiente del
  // .env local (que en integración queda en false).
  vi.stubEnv('VITE_USE_MOCK', 'true')
  vi.resetModules()
  apiMock = await import('./api.js')

  // El stub de VITE_API_URL no afecta al bloque mock, pero hay que limpiarlo
  // para que apiReal() controle el suyo.
  vi.unstubAllEnvs()
  server = createServer(responder)
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  baseUrl = `http://127.0.0.1:${server.address().port}/api`

  // Puerto garantizado cerrado para el test de network error.
  const tmp = createServer()
  await new Promise((r) => tmp.listen(0, '127.0.0.1', r))
  portMuerto = tmp.address().port
  await new Promise((r) => tmp.close(r))
})

afterAll(() => server?.close())

/** Re-importa api.js con env stubbed (los valores se leen en load). */
const apiReal = async (apiUrl) => {
  vi.stubEnv('VITE_USE_MOCK', 'false')
  vi.stubEnv('VITE_API_URL', apiUrl)
  vi.resetModules()
  return import('./api.js')
}

/* ---------- 1. Modo mock (env stubbed — no depende del .env local) ---------- */

describe('mocks — shapes del contrato', () => {
  it('USE_MOCK=true en el bloque de mocks', () => {
    expect(apiMock.USE_MOCK).toBe(true)
  })

  it('POST /parse → ficha + alertas + textoOriginal', async () => {
    const d = await apiMock.parseTexto('mandar sal a china desde salta, 2 containers de 40 y pico de texto para que no caiga en T-04')
    expect(d.ficha.operacion).toBe('exportacion')
    expect(d.ficha.carga.contenedor).toBe('40ST')
    expect(d.alertas.every((a) => a.campo && a.mensaje && a.pregunta && a.severidad)).toBe(true)
    expect(d.textoOriginal).toContain('sal')
  })

  it('POST /validate → alertas + completo', async () => {
    const d = await apiMock.validarFicha({ contacto: {} })
    expect(Array.isArray(d.alertas)).toBe(true)
    expect(typeof d.completo).toBe('boolean')
  })

  it('GET /corredores → 2 corredores con lat/lng + COCEL', async () => {
    const d = await apiMock.getCorredores()
    expect(d.corredores.map((c) => c.id)).toEqual(['pacifico', 'atlantico'])
    expect(d.corredores[0].puertos[0]).toMatchObject({ lat: expect.any(Number), lng: expect.any(Number) })
    expect(d.depositosFiscales[0].nombre).toBe('COCEL Salta')
  })

  it('POST /rfq → asunto + texto con CONDICIONES + advertencias', async () => {
    const d = await apiMock.generarRfq(FICHA, 'pacifico')
    expect(d.rfq.asunto).toContain('RFQ')
    expect(d.rfq.texto).toContain('CONDICIONES OPERATIVAS')
    expect(d.rfq.texto).toContain('Paso de Jama')
    expect(Array.isArray(d.rfq.advertencias)).toBe(true)
  })

  it('ruta inexistente → ApiError con code', async () => {
    await expect(apiMock.apiFetch('/nope')).rejects.toMatchObject({ name: 'ApiError', code: 'NOT_FOUND' })
  })
})

/* ---------- 2. Modo real — stub HTTP según contrato ---------- */

describe('api real — stub HTTP del contrato', () => {
  it('parseTexto envía POST /api/parse con body JSON y devuelve la response', async () => {
    const api = await apiReal(baseUrl)
    const d = await api.parseTexto('hola, tengo una exportacion')
    expect(ultimoRequest.method).toBe('POST')
    expect(ultimoRequest.url).toBe('/api/parse')
    expect(ultimoRequest.body).toEqual({ texto: 'hola, tengo una exportacion' })
    expect(d.ficha.operacion).toBe('exportacion')
    expect(d.textoOriginal).toBe('hola, tengo una exportacion')
  })

  it('Authorization: Bearer se envía cuando hay token (contrato §1)', async () => {
    const api = await apiReal(baseUrl)
    const d = await api.getConsultas({ token: 'jwt-falso-123' })
    expect(ultimoRequest.auth).toBe('Bearer jwt-falso-123')
    expect(d.consultas).toEqual([])
  })

  it('sin token → 401 { error } normaliza a ApiError', async () => {
    const api = await apiReal(baseUrl)
    await expect(api.getConsultas()).rejects.toMatchObject({ name: 'ApiError', code: 'UNAUTHORIZED', status: 401 })
  })

  it('400 { error: { code, message } } → ApiError con esos datos', async () => {
    const api = await apiReal(baseUrl)
    await expect(api.apiFetch('/boom', { method: 'POST' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Texto inválido',
      status: 400,
    })
  })

  it('descargarRfqPdf devuelve Blob (binario, no JSON)', async () => {
    const api = await apiReal(baseUrl)
    const blob = await api.descargarRfqPdf('texto', 'asunto')
    expect(blob).toBeInstanceOf(Blob)
    expect(await blob.text()).toContain('%PDF')
  })

  it('API caída → ApiError NETWORK_ERROR (degradación limpia en demo)', async () => {
    const api = await apiReal(`http://127.0.0.1:${portMuerto}/api`)
    await expect(api.healthCheck()).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})
