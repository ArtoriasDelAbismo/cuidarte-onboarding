import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FinanzasDesktop.css'

import iphone from '../assets/desktop/finanzas/iphone.webp'
import card from '../assets/desktop/finanzas/card.webp'
import isologo from '../assets/desktop/finanzas/isologo.svg'
import backIcon from '../assets/desktop/finanzas/back.svg'

// Figma: "Finanzas publicidad" (1998:9081), a 1920x1080 frame. Rendered inside
// DesktopScene (whose nav stays on top); fades in from the bottom over the
// scene, and back out before returning Home.
const ARTBOARD_W = 1920
const ARTBOARD_H = 1080
const EXIT_MS = 450

function fitScale() {
  return Math.min(window.innerWidth / ARTBOARD_W, window.innerHeight / ARTBOARD_H)
}

export default function FinanzasDesktop() {
  const navigate = useNavigate()
  const [scale, setScale] = useState(fitScale)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const onResize = () => setScale(fitScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => navigate('/home'), EXIT_MS)
    return () => clearTimeout(t)
  }, [leaving, navigate])

  return (
    <section className={`finanzas-desktop${leaving ? ' finanzas-desktop--leaving' : ''}`} aria-label="Finanzas">
      <div className="finanzas-desktop__artboard" style={{ scale }}>
        <div className="finanzas-desktop__circle" aria-hidden="true" />
        <img className="finanzas-desktop__iphone" src={iphone} alt="" aria-hidden="true" />

        <div className="finanzas-desktop__copy">
          <h1 className="finanzas-desktop__title">Próximamente</h1>
          <p className="finanzas-desktop__text">
            Con la app de <span>Cuidarte Wallet</span> podrás administrar tu dinero, generar rendimientos,
            solicitar tu tarjeta virtual y mucho más...
          </p>
        </div>

        <img className="finanzas-desktop__isologo" src={isologo} alt="" aria-hidden="true" />
        <img className="finanzas-desktop__card" src={card} alt="" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="finanzas-desktop__back"
        onClick={() => setLeaving(true)}
        disabled={leaving}
        aria-label="Volver"
      >
        <img src={backIcon} alt="" aria-hidden="true" />
      </button>
    </section>
  )
}
