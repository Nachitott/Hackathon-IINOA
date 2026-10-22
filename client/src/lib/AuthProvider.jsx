/**
 * Provider de auth — N-14.
 * Dos caminos: login real (Supabase Auth, cuando hay env vars) o
 * "Entrar como demo" (AUTH_OPTIONAL — la demo nunca se bloquea).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, SUPABASE_CONFIGURADO } from './supabase.js'
import { AuthContext } from './authContext.js'

const USUARIO_DEMO = { email: 'demo@innoa.local', demo: true }

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [inicializando, setInicializando] = useState(SUPABASE_CONFIGURADO)
  const [errorAuth, setErrorAuth] = useState(null)

  // Escuchar sesión real cuando Supabase está configurado.
  useEffect(() => {
    if (!supabase) return
    let activo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return
      setUsuario(data.session?.user ?? null)
      setInicializando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user ?? null)
    })
    return () => {
      activo = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    if (!supabase) {
      setErrorAuth({ code: 'AUTH_OFF', message: 'Auth no configurada — usá "Entrar como demo".' })
      return false
    }
    setErrorAuth(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorAuth({ code: 'AUTH_ERROR', message: error.message })
      return false
    }
    return true
  }, [])

  const loginDemo = useCallback(() => {
    setErrorAuth(null)
    setUsuario(USUARIO_DEMO)
  }, [])

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut().catch(() => {})
    setUsuario(null)
  }, [])

  /** Token JWT para Authorization: Bearer (contrato §1) — null en demo. */
  const token = useCallback(async () => {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  const value = useMemo(
    () => ({
      usuario,
      inicializando,
      errorAuth,
      supabaseConfigurado: SUPABASE_CONFIGURADO,
      autenticado: Boolean(usuario),
      esDemo: Boolean(usuario?.demo),
      login,
      loginDemo,
      logout,
      token,
    }),
    [usuario, inicializando, errorAuth, login, loginDemo, logout, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
