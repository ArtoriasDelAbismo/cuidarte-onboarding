import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './DesktopScene.css'

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

const CARMEN_URL = 'https://carmen-assistant.netlify.app/'

const INTRO_SEEN_STORAGE_KEY = 'cuidarte:home-intro-seen'

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function CarmenLink() {
  return (
    <div className="desktop-scene__carmen">
      <a className="desktop-scene__carmen-link" href={CARMEN_URL} target="_blank" rel="noopener noreferrer">
        <span className="desktop-scene__carmen-text">
          <span className="desktop-scene__carmen-line1">Interactuá con Carmen</span>
          <span className="desktop-scene__carmen-line2">en tiempo real.</span>
        </span>
        <img src={carmenArrow} alt="" aria-hidden="true" width="38" height="38" />
      </a>
    </div>
  )
}

// Shared desktop layout: the device photo, feature hotspots, Carmen link and
// section nav stay mounted while child routes (Home intro, Salud panel, ...)
// render their own overlays through <Outlet />.
export default function DesktopScene() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // Only /home plays the welcome intro; any other section starts revealed.
  const [revealed, setRevealed] = useState(() => introSeen() || pathname !== '/home')
  const [openHotspot, setOpenHotspot] = useState(null)

  function reveal() {
    try {
      sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1')
    } catch {
      // Storage unavailable: the intro will just replay next visit.
    }
    setRevealed(true)
  }

  return (
    <div className={`desktop-scene${revealed ? ' desktop-scene--revealed' : ''}`}>
      <div className="desktop-scene__stage">
        <img className="desktop-scene__bg" src={homeBg} alt="" aria-hidden="true" />

        {HOTSPOTS.map((spot) => {
          const open = revealed && openHotspot === spot.key
          return (
            <button
              key={spot.key}
              type="button"
              className={`desktop-scene__hotspot${open ? ' desktop-scene__hotspot--open' : ''}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              tabIndex={revealed ? 0 : -1}
              aria-label={spot.label}
              aria-expanded={open}
              onMouseEnter={() => setOpenHotspot(spot.key)}
              onMouseLeave={() => setOpenHotspot(null)}
              onFocus={() => setOpenHotspot(spot.key)}
              onBlur={() => setOpenHotspot(null)}
              onClick={() => setOpenHotspot(open ? null : spot.key)}
            >
              <span className="desktop-scene__hotspot-label" aria-hidden="true">
                {spot.label}
              </span>
              <img className="desktop-scene__hotspot-ring" src={hotspotRing} alt="" />
            </button>
          )
        })}
      </div>

      <Outlet context={{ revealed, reveal }} />

      {revealed && <CarmenLink />}

      <nav className="desktop-scene__nav" aria-hidden={!revealed}>
        <img className="desktop-scene__nav-logo" src={logo} alt="Cuidarte.ia" />
        <ul className="desktop-scene__nav-list">
          {NAV_ITEMS.map((item) => {
            const current = pathname.startsWith(item.to)
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={`desktop-scene__nav-button${current ? ' desktop-scene__nav-button--current' : ''}`}
                  onClick={() => navigate(current ? '/home' : item.to)}
                  tabIndex={revealed ? 0 : -1}
                  aria-current={current ? 'page' : undefined}
                >
                  <span
                    className="desktop-scene__nav-icon"
                    style={{ '--icon': `url("${item.icon}")` }}
                    aria-hidden="true"
                  />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
