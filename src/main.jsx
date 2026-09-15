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
          <Route path="/bienestar/encuentros" element={<Placeholder title="Encuentros" back="/bienestar" />} />
          <Route path="/bienestar/trivia" element={<Placeholder title="Trivia" back="/bienestar" />} />
          <Route path="/bienestar/memotest" element={<Placeholder title="Memotest" back="/bienestar" />} />
          <Route path="/bienestar/tateti" element={<Placeholder title="Tateti" back="/bienestar" />} />
          <Route path="/bienestar/puzle" element={<Placeholder title="Puzle" back="/bienestar" />} />
          <Route path="/finanzas" element={<Placeholder title="Finanzas" />} />
        </Routes>
      </div>
    </Router>
  </StrictMode>,
)
