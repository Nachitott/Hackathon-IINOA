/**
 * Contexto de auth — N-14 (objeto + hook).
 * Provider en AuthProvider.jsx (fast-refresh: archivos con componentes
 * solo exportan componentes).
 */

import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
