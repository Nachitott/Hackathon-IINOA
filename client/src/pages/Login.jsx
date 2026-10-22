/**
 * N-14 — Login: form real (Supabase Auth) cuando hay env vars +
 * botón "Entrar como demo" siempre disponible (AUTH_OPTIONAL).
 */

import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext.js'

export default function Login() {
  const { login, loginDemo, supabaseConfigurado, errorAuth, autenticado } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.from?.pathname ?? '/'

  if (autenticado) {
    return <Navigate to={destino} replace />
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    const ok = await login(email, password)
    setEnviando(false)
    if (ok) navigate(destino, { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-bold text-noa-tierra">Asistente Logístico NOA</h1>
        <p className="mb-5 mt-1 text-center text-xs text-slate-500">Hackathon INNOA · Comex-PuertoNoa ZOFRI</p>

        <button
          type="button"
          onClick={() => {
            loginDemo()
            navigate(destino, { replace: true })
          }}
          className="w-full rounded-lg bg-noa-andes px-4 py-2.5 font-semibold text-white transition hover:bg-noa-andes/90"
        >
          Entrar como demo
        </button>

        {supabaseConfigurado ? (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> o con tu cuenta <span className="h-px flex-1 bg-slate-200" />
            </div>
            <form onSubmit={enviar} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-noa-cobre focus:outline-none focus:ring-2 focus:ring-noa-cobre/30"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-noa-cobre focus:outline-none focus:ring-2 focus:ring-noa-cobre/30"
              />
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-lg border border-noa-cobre px-4 py-2.5 font-semibold text-noa-cobre transition hover:bg-noa-cobre hover:text-white disabled:opacity-50"
              >
                {enviando ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Auth real pendiente de configuración de Supabase — el modo demo salta el login.
          </p>
        )}

        {errorAuth && (
          <p role="alert" className="mt-3 rounded-lg border border-sev-alta/40 bg-sev-alta/10 px-3 py-2 text-sm text-sev-alta">
            {errorAuth.message}
          </p>
        )}
      </section>
    </main>
  )
}
