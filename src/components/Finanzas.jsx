import { useNavigate } from 'react-router-dom'
import './Finanzas.css'

import logo from '../assets/home/logo-pill.svg'
import iphone from '../assets/desktop/finanzas/iphone.webp'
import card from '../assets/desktop/finanzas/card.webp'
import isologo from '../assets/desktop/finanzas/isologo.svg'

// Figma: mobile "Finanzas" (2063:10539), a 412x1606 scrolling page. The
// desktop version is FinanzasDesktop; both reuse the same phone/card renders.
export default function Finanzas() {
  const navigate = useNavigate()

  return (
    <div className="finanzas">
      {/* Frosted header that stays put while the page scrolls. Figma has no
          back button here, so the logo pill takes the user Home. */}
      <header className="finanzas__header">
        <button type="button" className="finanzas__logo" onClick={() => navigate('/home')} aria-label="Volver al inicio">
          <img src={logo} alt="Cuidarte.ia" />
        </button>
      </header>

      <div className="finanzas__green" aria-hidden="true" />
      <div className="finanzas__dark" aria-hidden="true" />
      <img className="finanzas__iphone" src={iphone} alt="" aria-hidden="true" />

      <div className="finanzas__copy">
        {/* The Figma frame breaks the word here ("Próxima / mente") */}
        <h1 className="finanzas__title">
          Próxima<wbr />mente
        </h1>
        <p className="finanzas__text">
          Con la app de <span>Cuidarte Wallet</span> podrás administrar tu dinero, generar rendimientos, solicitar
          tu tarjeta virtual y mucho más...
        </p>
      </div>

      <img className="finanzas__card" src={card} alt="" aria-hidden="true" />
      <img className="finanzas__isologo" src={isologo} alt="" aria-hidden="true" />
    </div>
  )
}
