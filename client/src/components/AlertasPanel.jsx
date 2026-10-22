/**
 * N-10 — Panel de alertas: el momento wow de la demo.
 * Orden altas → medias · icono de severidad · pregunta sugerida para el
 * cliente · click en una alerta linkea visualmente a su campo en la ficha
 * (scroll + flash vía data-campo) · badge verde cuando completo: true.
 */

import { useApp } from '../lib/appContext.js'

const ESTILO = {
  alta: { dot: 'bg-sev-alta', texto: 'text-sev-alta', etiqueta: 'ALTA' },
  media: { dot: 'bg-sev-media', texto: 'text-sev-media', etiqueta: 'MEDIA' },
}

const irAlCampo = (campo) => {
  const el = document.querySelector(`[data-campo="${campo}"]`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('ring-2', 'ring-noa-cobre')
  setTimeout(() => el.classList.remove('ring-2', 'ring-noa-cobre'), 1400)
}

export default function AlertasPanel() {
  const { ficha, alertas, completo, loading } = useApp()

  if (!ficha) {
    if (loading.parse) {
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-busy="true">
          <h2 className="mb-3 text-lg font-semibold text-noa-tierra">Alertas</h2>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        </section>
      )
    }
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-noa-tierra">Alertas</h2>
        <p className="mt-2 text-sm text-slate-500">Las preguntas para completar el expediente aparecen acá.</p>
      </section>
    )
  }

  const ordenadas = [...alertas].sort((a, b) =>
    a.severidad === b.severidad ? 0 : a.severidad === 'alta' ? -1 : 1,
  )
  const nAltas = alertas.filter((a) => a.severidad === 'alta').length

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-noa-tierra">Alertas</h2>
        {completo ? (
          <span className="rounded-full bg-sev-ok px-3 py-1 text-xs font-bold text-white">
            ✔ Expediente completo
          </span>
        ) : (
          <span className="rounded-full bg-sev-alta px-3 py-1 text-xs font-bold text-white">
            {nAltas} alta{nAltas === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {completo ? (
        <p className="text-sm text-slate-600">Sin datos faltantes críticos — lista para generar RFQ.</p>
      ) : (
        <ul className="space-y-2">
          {ordenadas.map((a) => {
            const e = ESTILO[a.severidad] ?? ESTILO.media
            return (
              <li key={a.campo}>
                <button
                  type="button"
                  onClick={() => irAlCampo(a.campo)}
                  className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-noa-cobre hover:shadow-sm"
                  title={`Ir al campo ${a.campo}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${e.dot}`} aria-hidden="true" />
                    <span className={`text-xs font-bold uppercase ${e.texto}`}>{e.etiqueta}</span>
                    <span className="text-sm font-medium text-slate-800">{a.mensaje}</span>
                  </div>
                  <p className="mt-1.5 border-l-2 border-noa-cobre/50 pl-3 text-sm italic text-noa-andes">
                    Preguntar: {a.pregunta}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
