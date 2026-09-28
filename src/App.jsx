import { Routes, Route, useLocation } from 'react-router-dom'
import Intro from './components/Intro.jsx'
import IntroDesktop from './components/IntroDesktop.jsx'
import Registro from './components/Registro.jsx'
import Loading from './components/Loading.jsx'
import Home from './components/Home.jsx'
import HomeDesktop from './components/HomeDesktop.jsx'
import DesktopScene from './components/DesktopScene.jsx'
import MobileCarmenLayout from './carmen/MobileCarmenLayout.jsx'
import Salud from './components/Salud.jsx'
import SaludDesktop from './components/SaludDesktop.jsx'
import Seguridad from './components/Seguridad.jsx'
import SeguridadDesktop from './components/SeguridadDesktop.jsx'
import Entretenimiento from './components/Entretenimiento.jsx'
import EntretenimientoDesktop from './components/EntretenimientoDesktop.jsx'
import Encuentros from './components/Encuentros.jsx'
import EncuentrosPlan from './components/EncuentrosPlan.jsx'
import EncuentrosListo from './components/EncuentrosListo.jsx'
import EncuentrosDesktop, { EncuentrosPlanDesktop, EncuentrosListoDesktop } from './components/EncuentrosDesktop.jsx'
import Finanzas from './components/Finanzas.jsx'
import FinanzasDesktop from './components/FinanzasDesktop.jsx'
import useIsDesktop from './utils/useIsDesktop.js'

// Routes that have a desktop layout; everything else stays in the mobile-width shell.
const DESKTOP_ROUTES = new Set([
  '/',
  '/home',
  '/salud',
  '/seguridad',
  '/bienestar',
  '/finanzas',
  '/bienestar/encuentros',
  '/bienestar/encuentros/planificar',
  '/bienestar/encuentros/listo',
])

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
        {/* These share one Carmen connection: on desktop inside one mounted scene
            (photo, hotspots, nav), on mobile drawn on each screen's device photo */}
        <Route element={isDesktop ? <DesktopScene /> : <MobileCarmenLayout />}>
          <Route path="/home" element={isDesktop ? <HomeDesktop /> : <Home />} />
          <Route path="/salud" element={isDesktop ? <SaludDesktop /> : <Salud />} />
          <Route path="/seguridad" element={isDesktop ? <SeguridadDesktop /> : <Seguridad />} />
          <Route path="/bienestar" element={isDesktop ? <EntretenimientoDesktop /> : <Entretenimiento />} />
          <Route path="/finanzas" element={isDesktop ? <FinanzasDesktop /> : <Finanzas />} />
        </Route>
        <Route path="/bienestar" element={<Entretenimiento />} />
        {/* Encuentros is its own full-screen flow on desktop, outside DesktopScene */}
        <Route path="/bienestar/encuentros" element={isDesktop ? <EncuentrosDesktop /> : <Encuentros />} />
        <Route
          path="/bienestar/encuentros/planificar"
          element={isDesktop ? <EncuentrosPlanDesktop /> : <EncuentrosPlan />}
        />
        <Route
          path="/bienestar/encuentros/listo"
          element={isDesktop ? <EncuentrosListoDesktop /> : <EncuentrosListo />}
        />
      </Routes>
    </div>
  )
}
