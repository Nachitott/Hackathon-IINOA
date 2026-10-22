import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './lib/AppProvider.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
