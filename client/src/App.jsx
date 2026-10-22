import { useEffect, useState } from 'react'
import { getCorredores, USE_MOCK } from './lib/api.js'

const Chip = ({ label, className }) => (
  <span className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white ${className}`}>
    {label}
  </span>
)

/**
 * Shell de humo de la Fase 0 — prueba viva de:
 *  N-02 (tokens de severidad/paleta) · N-03 (apiFetch + USE_MOCK) · N-07 (mocks)
 * Se reemplaza por el layout del dashboard en N-05.
 */
export default function App() {
  const [smoke, setSmoke] = useState('cargando…')

  useEffect(() => {
    getCorredores()
      .then((d) => setSmoke(`OK: ${d.corredores.length} corredores + ${d.depositosFiscales.length} depósito fiscal`))
      .catch((e) => setSmoke(`ERROR ${e.code}: ${e.message}`))
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
      <header>
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-noa-cobre">
          Hackathon INNOA · NOA
        </p>
        <h1 className="text-4xl font-bold text-noa-tierra">Asistente de Estructuración Logística</h1>
        <p className="mt-3 text-slate-600">
          input informal → ficha técnica + alertas → comparador de corredores → RFQ
        </p>
      </header>

      <section aria-label="Tokens de severidad">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Severidades (contrato §2.2)
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Chip label="alta — bloquea cotización" className="bg-sev-alta" />
          <Chip label="media — deseable" className="bg-sev-media" />
          <Chip label="expediente completo" className="bg-sev-ok" />
        </div>
        <div className="mt-4 flex justify-center gap-3 text-xs text-white">
          <Chip label="tierra" className="bg-noa-tierra" />
          <Chip label="cobre" className="bg-noa-cobre" />
          <Chip label="andes" className="bg-noa-andes" />
        </div>
      </section>

      <section
        aria-label="Smoke test API/mocks"
        className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
      >
        <p className="text-sm text-slate-500">
          <span className="font-semibold">GET /api/corredores</span>
          {' · modo '}
          <span className={`font-mono font-semibold ${USE_MOCK ? 'text-sev-media' : 'text-sev-ok'}`}>
            {USE_MOCK ? 'MOCK' : 'API REAL'}
          </span>
        </p>
        <p className="mt-1 font-mono text-sm text-slate-800">{smoke}</p>
      </section>
    </main>
  )
}
