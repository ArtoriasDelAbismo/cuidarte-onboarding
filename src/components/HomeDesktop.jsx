import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import './HomeDesktop.css'

// Figma: "Home desktop transición" 0 -> 1 -> 2, then "Home desktop" on Explorar.
// Rendered inside DesktopScene, which owns the photo, hotspots and nav.
const PHASE_GREET_MS = 800
const PHASE_WELCOME_MS = 1000

export default function HomeDesktop() {
  const { revealed, reveal } = useOutletContext()
  const [phase, setPhase] = useState(() => (revealed ? 'explore' : 'dim')) // dim -> greet -> welcome -> explore

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
    setPhase('explore')
    reveal()
  }

  return (
    <div className={`home-desktop home-desktop--${phase}`} aria-hidden={phase === 'explore'}>
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
    </div>
  )
}
