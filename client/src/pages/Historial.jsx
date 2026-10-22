/**
 * N-15 — Historial de consultas: GET /api/consultas → lista → click
 * repuebla ficha+alertas en el dashboard.
 * Tolerante con el shape del back: `{consultas: []}` o array directo.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getConsultas } from '../lib/api.js'
import { useApp } from '../lib/appContext.js'
import { useAuth } from '../lib/authContext.js'

const fmtFecha = (iso) => {
  try {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function Historial() {
  const { cargarConsulta } = useApp()
  const { token, esDemo } = useAuth()
  const [consultas, setConsultas] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const t = await token()
        const data = await getConsultas({ token: t })
        if (!activo) return
        setConsultas(data?.consultas ?? data ?? [])
      } catch (e) {
        if (activo) setError(e)
      }
    })()
    return () => {
      activo = false
    }
  }, [token])

  const abrir = (c) => {
    cargarConsulta(c)
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-noa-cobre/20 bg-noa-arena px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold text-noa-tierra">Historial de consultas</h1>
          <Link to="/" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
            ← Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {error ? (
          <p role="alert" className="rounded-lg border border-sev-alta/40 bg-sev-alta/10 px-3 py-2 text-sm text-sev-alta">
            <span className="font-semibold">{error.code}:</span> {error.message}
          </p>
        ) : consultas === null ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white/60" />
            ))}
          </ul>
        ) : consultas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
            Todavía no hay consultas guardadas{esDemo ? ' (modo demo: se guardan en el servidor del back)' : ''}.
          </p>
        ) : (
          <ul className="space-y-3">
            {consultas.map((c) => {
              const nAltas = (c.alertas ?? []).filter((a) => a.severidad === 'alta').length
              const carga = c.ficha?.carga?.tipo ?? 'consulta'
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => abrir(c)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-noa-cobre hover:shadow"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold capitalize text-slate-800">
                        {c.ficha?.operacion ?? '—'} · {carga} {c.ficha?.destino?.pais ? `→ ${c.ficha.destino.pais}` : ''}
                      </p>
                      <span className="text-xs text-slate-400">{fmtFecha(c.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm italic text-slate-500">“{c.texto_original}”</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white ${
                        nAltas > 0 ? 'bg-sev-alta' : 'bg-sev-ok'
                      }`}
                    >
                      {nAltas > 0 ? `${nAltas} alerta${nAltas === 1 ? '' : 's'} alta${nAltas === 1 ? '' : 's'}` : 'completa'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
