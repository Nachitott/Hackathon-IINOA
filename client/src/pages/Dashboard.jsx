/**
 * N-05 — Vista hero: una sola pantalla que cuenta toda la historia.
 * input informal | ficha+alertas | comparador+RFQ.
 * En ≥1280px (xl) las 3 zonas se ven sin scroll horizontal — pensado para
 * proyector; en pantallas menores se apilan (mobile-friendly).
 */

import { useApp } from '../lib/appContext.js'
import { USE_MOCK } from '../lib/api.js'
import ChatInput from '../components/ChatInput.jsx'
import FichaViewer from '../components/FichaViewer.jsx'
import AlertasPanel from '../components/AlertasPanel.jsx'
import ComparadorCorredores from '../components/ComparadorCorredores.jsx'
import EditorRFQ from '../components/EditorRFQ.jsx'

export default function Dashboard() {
  const { modo, error, limpiarError, reset } = useApp()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-noa-cobre/20 bg-noa-arena/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-noa-tierra">Asistente Logístico NOA</h1>
            <p className="text-xs text-slate-500">Hackathon INNOA · Comex-PuertoNoa ZOFRI</p>
          </div>
          <div className="flex items-center gap-2">
            {modo === 'fallback' && (
              <span className="rounded-full bg-sev-media px-3 py-1 text-xs font-bold text-white">
                parser en modo fallback (sin IA)
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${USE_MOCK ? 'bg-noa-andes' : 'bg-sev-ok'}`}
              title={USE_MOCK ? 'Datos de lib/mocks.js — sin backend' : 'Conectado a la API real'}
            >
              {USE_MOCK ? 'MOCK' : 'API'}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Limpiar
            </button>
          </div>
        </div>
        {error && (
          <div className="mx-auto mt-2 flex max-w-[1600px] items-center justify-between rounded-lg border border-sev-alta/40 bg-sev-alta/10 px-3 py-2 text-sm text-sev-alta">
            <span>
              <span className="font-semibold">{error.code}:</span> {error.message}
            </span>
            <button type="button" onClick={limpiarError} className="ml-3 font-bold" aria-label="Cerrar error">
              ✕
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-2 xl:grid-cols-12">
        {/* Zona 1 — input informal */}
        <div className="lg:col-span-1 xl:col-span-3">
          <ChatInput />
        </div>

        {/* Zona 2 — ficha técnica + alertas */}
        <div className="space-y-4 lg:col-span-1 xl:col-span-5">
          <FichaViewer />
          <AlertasPanel />
        </div>

        {/* Zona 3 — comparador de corredores + editor RFQ */}
        <div className="space-y-4 lg:col-span-2 xl:col-span-4">
          <ComparadorCorredores />
          <EditorRFQ />
        </div>
      </main>
    </div>
  )
}
