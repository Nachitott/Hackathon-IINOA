/**
 * N-14 — Guard de ruta: sin sesión ni modo demo → /login.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/authContext.js'

export default function RequireAuth({ children }) {
  const { autenticado, inicializando } = useAuth()
  const location = useLocation()

  if (inicializando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-sm text-slate-500">Verificando sesión…</p>
      </main>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
