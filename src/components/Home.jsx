import { useNavigate } from 'react-router-dom'
import './Home.css'

import fondo from '../assets/home/fondo-home.jpg'
import logo from '../assets/home/logo-pill.svg'
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
// buttons laid over its base.
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      <img className="home__bg" src={fondo} alt="" aria-hidden="true" />
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
