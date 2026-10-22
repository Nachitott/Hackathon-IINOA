import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthProvider.jsx'
import { AppProvider } from './lib/AppProvider.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historial from './pages/Historial.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/historial"
              element={
                <RequireAuth>
                  <Historial />
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
