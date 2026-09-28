import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import { DEVICE_HOTSPOTS } from '../utils/deviceHotspots'
import MobileStage from './MobileStage.jsx'

import logo from '../assets/home/logo-pill.svg'
import hotspotRing from '../assets/desktop/hotspot.svg'
import iconSalud from '../assets/home/icon-salud.svg'
import iconSeguridad from '../assets/home/icon-seguridad.svg'
import iconBienestar from '../assets/home/icon-entretenimiento.svg'
import iconFinanzas from '../assets/home/icon-finanzas.svg'

const NAV_ITEMS = [
  { key: 'salud', label: 'Salud', icon: iconSalud, to: '/salud' },
  { key: 'seguridad', label: 'Seguridad', icon: iconSeguridad, to: '/seguridad' },
  { key: 'bienestar', label: 'Bienestar', icon: iconBienestar, to: '/bienestar' },
  { key: 'finanzas', label: 'Finanzas', icon: iconFinanzas, to: '/finanzas' },
]

// Figma: mobile "Home" (1357:2271) — the Carmen device photo with the section
// buttons laid over its base, plus the desktop scene's feature hotspots
// (tap a dot to show its label).
export default function Home() {
  const navigate = useNavigate()
  const [openHotspot, setOpenHotspot] = useState(null)

  useEffect(() => {
    if (!openHotspot) return
    function onPointerDown(event) {
      if (!event.target.closest?.('.home__hotspot')) setOpenHotspot(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openHotspot])

  return (
    <div className="home">
      <MobileStage>
        {DEVICE_HOTSPOTS.map(({ key, label, mobile }) => {
          const open = openHotspot === key
          return (
            <button
              key={key}
              type="button"
              className={`home__hotspot home__hotspot--${mobile.align || 'center'}${open ? ' home__hotspot--open' : ''}`}
              style={{ left: `${mobile.x}%`, top: `${mobile.y}%` }}
              aria-label={label}
              aria-expanded={open}
              onClick={() => setOpenHotspot(open ? null : key)}
            >
              <span className="home__hotspot-label" aria-hidden="true">
                {label}
              </span>
              <img className="home__hotspot-ring" src={hotspotRing} alt="" />
            </button>
          )
        })}
      </MobileStage>

      <img className="home__logo" src={logo} alt="Cuidarte.ia" />

      <nav className="home__grid">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="home__button"
            onClick={() => navigate(item.to)}
          >
            <img className="home__button-icon" src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
