import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

import Intro from './components/Intro.jsx'
import Registro from './components/Registro.jsx'
import Loading from './components/Loading.jsx'
import Home from './components/Home.jsx'
import Salud from './components/Salud.jsx'
import Seguridad from './components/Seguridad.jsx'
import Entretenimiento from './components/Entretenimiento.jsx'
import Encuentros from './components/Encuentros.jsx'
import EncuentrosPlan from './components/EncuentrosPlan.jsx'
import EncuentrosListo from './components/EncuentrosListo.jsx'
import Placeholder from './components/Placeholder.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/cargando" element={<Loading />} />
          <Route path="/home" element={<Home />} />
          <Route path="/salud" element={<Salud />} />
          <Route path="/seguridad" element={<Seguridad />} />
          <Route path="/bienestar" element={<Entretenimiento />} />
          <Route path="/bienestar/encuentros" element={<Encuentros />} />
          <Route path="/bienestar/encuentros/planificar" element={<EncuentrosPlan />} />
          <Route path="/bienestar/encuentros/listo" element={<EncuentrosListo />} />
          <Route path="/finanzas" element={<Placeholder title="Finanzas" />} />
        </Routes>
      </div>
    </Router>
  </StrictMode>,
)
