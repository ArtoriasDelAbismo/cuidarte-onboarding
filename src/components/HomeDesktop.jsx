import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomeDesktop.css'
import { useCarmenVoice, CARMEN_STATE } from '../utils/useCarmenVoice'

import homeBg from '../assets/desktop/home-bg.jpg'
import logo from '../assets/desktop/logo-secundario.svg'
import carmenArrow from '../assets/desktop/carmen-arrow.svg'
import hotspotRing from '../assets/desktop/hotspot.svg'
import iconSalud from '../assets/desktop/icon-salud.svg'
import iconSeguridad from '../assets/desktop/icon-seguridad.svg'
import iconBienestar from '../assets/desktop/icon-bienestar.svg'
import iconFinanzas from '../assets/desktop/icon-finanzas.svg'

const NAV_ITEMS = [
  { key: 'salud', label: 'Salud', icon: iconSalud, to: '/salud' },
  { key: 'seguridad', label: 'Seguridad', icon: iconSeguridad, to: '/seguridad' },
  { key: 'bienestar', label: 'Bienestar', icon: iconBienestar, to: '/bienestar' },
  { key: 'finanzas', label: 'Finanzas', icon: iconFinanzas, to: '/finanzas' },
]

// Positions are % of the background photo (2752x1536), converted from the
// 1920x1080 Figma frame so the dots stay pinned to the device at any viewport.
const HOTSPOTS = [
  { key: 'pantalla', label: 'Pantalla interactiva', x: 64.08, y: 25.19 },
  { key: 'nfc', label: 'Soporte inteligente NFC', x: 47.18, y: 52.87 },
  { key: 'llamada', label: 'Responder/finalizar llamada', x: 49.61, y: 61.85 },
  { key: 'parlante', label: 'Parlante integrado', x: 59.07, y: 67.59 },
  { key: 'microfonos', label: 'Micrófonos direccionales', x: 37.52, y: 68.24 },
]

// Figma: "Home desktop transición" 0 -> 1 -> 2, then "Home desktop" on Explorar.
const PHASE_GREET_MS = 800
const PHASE_WELCOME_MS = 1000
const INTRO_SEEN_STORAGE_KEY = 'cuidarte:home-intro-seen'

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function CarmenLink() {
  const { state, error, start, sleep } = useCarmenVoice()
  const active = state === CARMEN_STATE.LISTENING || state === CARMEN_STATE.SPEAKING

  function handleClick() {
    if (active) sleep()
    else if (state !== CARMEN_STATE.CONNECTING) start()
  }

  return (
    <div className="home-desktop__carmen">
      <button
        type="button"
        className={`home-desktop__carmen-link${active ? ' home-desktop__carmen-link--active' : ''}`}
        onClick={handleClick}
        aria-pressed={active}
      >
        <span className="home-desktop__carmen-text">
          <span className="home-desktop__carmen-line1">Interactuá con Carmen</span>
          <span className="home-desktop__carmen-line2">en tiempo real.</span>
        </span>
        <img src={carmenArrow} alt="" aria-hidden="true" width="38" height="38" />
      </button>
      {error && <p className="home-desktop__carmen-error">{error}</p>}
    </div>
  )
}

export default function HomeDesktop() {
  const [phase, setPhase] = useState(() => (introSeen() ? 'explore' : 'dim')) // dim -> greet -> welcome -> explore
  const [openHotspot, setOpenHotspot] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (phase === 'dim') {
      const t = setTimeout(() => setPhase('greet'), PHASE_GREET_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'greet') {
      const t = setTimeout(() => setPhase('welcome'), PHASE_WELCOME_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  function handleExplore() {
    try {
      sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1')
    } catch {
      // Storage unavailable: the intro will just replay next visit.
    }
    setPhase('explore')
  }

  const exploring = phase === 'explore'

  return (
    <div className={`home-desktop home-desktop--${phase}`}>
      <div className="home-desktop__stage">
        <img className="home-desktop__bg" src={homeBg} alt="" aria-hidden="true" />

        {HOTSPOTS.map((spot) => {
          const open = exploring && openHotspot === spot.key
          return (
            <button
              key={spot.key}
              type="button"
              className={`home-desktop__hotspot${open ? ' home-desktop__hotspot--open' : ''}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              tabIndex={exploring ? 0 : -1}
              aria-label={spot.label}
              aria-expanded={open}
              onMouseEnter={() => setOpenHotspot(spot.key)}
              onMouseLeave={() => setOpenHotspot(null)}
              onFocus={() => setOpenHotspot(spot.key)}
              onBlur={() => setOpenHotspot(null)}
              onClick={() => setOpenHotspot(open ? null : spot.key)}
            >
              <span className="home-desktop__hotspot-label" aria-hidden="true">
                {spot.label}
              </span>
              <img className="home-desktop__hotspot-ring" src={hotspotRing} alt="" />
            </button>
          )
        })}
      </div>

      <div className="home-desktop__scrim" aria-hidden="true" />

      <h1 className="home-desktop__title">¡Hola, soy Carmen!</h1>
      <p className="home-desktop__subtitle">
        Te doy la bienvenida al ecosistema de <span>Cuidarte.ia</span>, acá vas a poder explorar
        todas las funcionalidades que ofrecemos.
      </p>
      <button
        type="button"
        className="home-desktop__explore"
        onClick={handleExplore}
        tabIndex={phase === 'welcome' ? 0 : -1}
      >
        Explorar
      </button>

      {exploring && <CarmenLink />}

      <nav className="home-desktop__nav" aria-hidden={!exploring}>
        <img className="home-desktop__nav-logo" src={logo} alt="Cuidarte.ia" />
        <ul className="home-desktop__nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className="home-desktop__nav-button"
                onClick={() => navigate(item.to)}
                tabIndex={exploring ? 0 : -1}
              >
                <span
                  className="home-desktop__nav-icon"
                  style={{ '--icon': `url("${item.icon}")` }}
                  aria-hidden="true"
                />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
