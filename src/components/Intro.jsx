import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Intro.css'

import splashBg from '../assets/login/splash-bg.jpg'
import splashBgAlt from '../assets/login/splash-bg-alt.jpg'
import logoFull from '../assets/login/logo-full.svg'
import logoCompact from '../assets/login/logo-compact.svg'
import loadingDots from '../assets/login/loading-dots.svg'
import blobWelcome from '../assets/login/blob-splash3.svg'

const PHASE_BOOT_MS = 900
const PHASE_LOGO_MS = 1500
const PHASE_EXIT_MS = 750

export default function Intro() {
  const [phase, setPhase] = useState('boot') // boot -> logo -> welcome -> exiting
  const navigate = useNavigate()

  useEffect(() => {
    if (phase === 'boot') {
      const t = setTimeout(() => setPhase('logo'), PHASE_BOOT_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'logo') {
      const t = setTimeout(() => setPhase('welcome'), PHASE_LOGO_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'exiting') {
      const t = setTimeout(() => navigate('/registro'), PHASE_EXIT_MS)
      return () => clearTimeout(t)
    }
  }, [phase, navigate])

  return (
    <div className={`intro intro--${phase}`}>
      <div className="intro__bg" style={{ backgroundImage: `url(${splashBg})` }} />
      <div
        className="intro__bg intro__bg--alt"
        style={{
          backgroundImage: `url(${splashBgAlt})`,
          opacity: phase === 'welcome' || phase === 'exiting' ? 1 : 0,
        }}
      />
      <div className="intro__scrim" />

      {phase !== 'welcome' && (
        <div className="intro__boot">
          {phase === 'logo' && (
            <>
              <img className="intro__logo-full" src={logoFull} alt="Cuidarte.ia" />
              <img className="intro__dots" src={loadingDots} alt="" aria-hidden="true" />
            </>
          )}
        </div>
      )}

      {(phase === 'welcome' || phase === 'exiting') && (
        <>
          <img className="intro__blob" src={blobWelcome} alt="" aria-hidden="true" />
          <img className="intro__top-logo" src={logoCompact} alt="Cuidarte.ia" />
          <div className="intro__content">
            <h1 className="intro__headline">
              Cerca <br />
              de quienes <br />
              <span className="intro__headline-accent">más importan.</span>
            </h1>
          </div>
          <button
            type="button"
            className="intro__cta"
            onClick={() => setPhase('exiting')}
          >
            Comenzar
          </button>
        </>
      )}
    </div>
  )
}
