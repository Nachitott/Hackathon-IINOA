/**
 * Contexto global de la app — N-06 (objeto + hook).
 * El componente provider vive en AppProvider.jsx (fast-refresh exige
 * que los archivos con componentes solo exporten componentes).
 */

import { createContext, useContext } from 'react'

export const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
