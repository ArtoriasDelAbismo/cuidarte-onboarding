import { lazy, Suspense, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './DesktopScene.css'
import { DEVICE_HOTSPOTS } from '../utils/deviceHotspots'
import { useCarmen } from '../carmen/useCarmen'
import { DESKTOP_SCREEN } from '../carmen/screenGeometry'

import homeBg from '../assets/desktop/home-bg.jpg'
import logo from '../assets/desktop/logo-secundario.svg'
import carmenArrow from '../assets/desktop/carmen-arrow.svg'
import hotspotRing from '../assets/desktop/hotspot.svg'
import iconSalud from '../assets/desktop/icon-salud.svg'
import iconSeguridad from '../assets/desktop/icon-seguridad.svg'
import iconBienestar from '../assets/desktop/icon-bienestar.svg'
import iconFinanzas from '../assets/desktop/icon-finanzas.svg'

// three.js is heavy (~1MB) and only the desktop scene uses it, so Carmen's
// face loads as its own chunk instead of weighing down the mobile bundle.
const CarmenScreen = lazy(() => import('../carmen/CarmenScreen.jsx'))

const NAV_ITEMS = [
  { key: 'salud', label: 'Salud', icon: iconSalud, to: '/salud' },
  { key: 'seguridad', label: 'Seguridad', icon: iconSeguridad, to: '/seguridad' },
  { key: 'bienestar', label: 'Bienestar', icon: iconBienestar, to: '/bienestar' },
  { key: 'finanzas', label: 'Finanzas', icon: iconFinanzas, to: '/finanzas' },
]

// Positions are % of the background photo, so the dots stay pinned to the
// device at any viewport (see utils/deviceHotspots.js).
const HOTSPOTS = DEVICE_HOTSPOTS.map(({ key, label, desktop }) => ({ key, label, ...desktop }))

const INTRO_SEEN_STORAGE_KEY = 'cuidarte:home-intro-seen'

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Wakes Carmen on the device's screen (or ends the conversation). Stays in its
// "hover" look while she's awake so it reads as on.
function CarmenLink({ carmen }) {
  const { status, error, toggle } = carmen
  const active = status === 'connected' || status === 'connecting'

  return (
    <div className="desktop-scene__carmen">
      <button
        type="button"
        className={`desktop-scene__carmen-link${active ? ' desktop-scene__carmen-link--active' : ''}`}
        onClick={toggle}
        disabled={status === 'connecting'}
        aria-pressed={status === 'connected'}
      >
        <span className="desktop-scene__carmen-text">
          <span className="desktop-scene__carmen-line1">Interactuá con Carmen</span>
          <span className="desktop-scene__carmen-line2">
            {status === 'connecting' ? 'Despertando…' : status === 'connected' ? 'Tocá para terminar.' : 'en tiempo real.'}
          </span>
        </span>
        <img src={carmenArrow} alt="" aria-hidden="true" width="38" height="38" />
      </button>
      {error && (
        <p className="desktop-scene__carmen-error" role="alert">
          {error}
        </p>
      )}
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
  const carmen = useCarmen()

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
        <Suspense fallback={null}>
          <CarmenScreen carmen={carmen} geometry={DESKTOP_SCREEN} interactive={revealed} />
        </Suspense>

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

      {revealed && <CarmenLink carmen={carmen} />}

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
