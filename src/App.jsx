import { Routes, Route, useLocation } from 'react-router-dom'
import Intro from './components/Intro.jsx'
import IntroDesktop from './components/IntroDesktop.jsx'
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
import useIsDesktop from './utils/useIsDesktop.js'

// Routes that have a desktop layout; everything else stays in the mobile-width shell.
const DESKTOP_ROUTES = new Set(['/'])

export default function App() {
  const isDesktop = useIsDesktop()
  const { pathname } = useLocation()
  const wide = isDesktop && DESKTOP_ROUTES.has(pathname)

  return (
    <div className={`app-shell${wide ? ' app-shell--wide' : ''}`}>
      <Routes>
        <Route path="/" element={isDesktop ? <IntroDesktop /> : <Intro />} />
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
  )
}
