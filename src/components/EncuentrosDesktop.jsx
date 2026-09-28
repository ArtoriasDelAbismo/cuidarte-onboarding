import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EncuentrosDesktop.css'

import logo from '../assets/desktop/logotipo.svg'
import fotoPintura from '../assets/desktop/encuentros/pintura.jpg'
import fotoCafe from '../assets/desktop/encuentros/cafe.jpg'
import fotoCena from '../assets/desktop/encuentros/cena.jpg'
import fotoBingo from '../assets/desktop/encuentros/bingo.jpg'

// Figma: Bienestar › "Encuentros", "Encuentros 1" and "Encuentros 2" — the
// desktop versions of /bienestar/encuentros, /planificar and /listo.

const CAROUSEL_PHOTOS = [fotoPintura, fotoCafe, fotoCena, fotoBingo]

// Figma component "Animación frases", Predeterminada → Variante5
const PHRASES = [
  ['una cena', 'mi pareja'],
  ['una salida al teatro', 'mi pareja'],
  ['tomar un café', 'persona a ciegas'],
  ['salir a caminar', 'amigos'],
  ['hacer deporte', '+ de 4 personas'],
]
const PHRASE_INTERVAL_MS = 3000

const ACTIVIDAD_OPTIONS = [
  'Caminata en costanera',
  'Tomar un café',
  'Ir al teatro',
  'Ir al museo',
  'Ir a un restaurant',
]

const CON_QUIEN_OPTIONS = [
  'Persona a ciegas',
  'Familiares o amigos',
  'Mi pareja',
  'Grupo de 4 o más personas',
  'Nadie',
]

function Arrow({ className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M7 1a1 1 0 0 1 2 0v11.586l5.293-5.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 1.414-1.414L7 12.586V1Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Dark stage shared by the three screens: curved top/bottom masks and green side glows.
function Stage({ children }) {
  return (
    <div className="encuentros-desktop">
      {children}
      <div className="encuentros-desktop__mask encuentros-desktop__mask--top" aria-hidden="true" />
      <div className="encuentros-desktop__mask encuentros-desktop__mask--bottom" aria-hidden="true" />
      <div className="encuentros-desktop__glow encuentros-desktop__glow--left" aria-hidden="true" />
      <div className="encuentros-desktop__glow encuentros-desktop__glow--right" aria-hidden="true" />
    </div>
  )
}

export default function EncuentrosDesktop() {
  const navigate = useNavigate()
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPhraseIndex((i) => (i + 1) % PHRASES.length), PHRASE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const [actividad, conQuien] = PHRASES[phraseIndex]

  return (
    <Stage>
      <div className="encuentros-desktop__carousel" aria-hidden="true">
        <div className="encuentros-desktop__carousel-track">
          {[...CAROUSEL_PHOTOS, ...CAROUSEL_PHOTOS].map((photo, index) => (
            <div key={index} className="encuentros-desktop__photo" style={{ backgroundImage: `url(${photo})` }} />
          ))}
        </div>
      </div>

      <img className="encuentros-desktop__logo" src={logo} alt="Cuidarte.ia" />

      <h1 className="encuentros-desktop__phrase" key={phraseIndex}>
        <span className="encuentros-desktop__accent">Planifiquemos</span>
        <span className="encuentros-desktop__underline">{actividad}</span>
        <span className="encuentros-desktop__accent">con</span>
        <span className="encuentros-desktop__underline">{conQuien}</span>
      </h1>

      <div className="encuentros-desktop__actions">
        <button
          type="button"
          className="encuentros-desktop__button encuentros-desktop__button--dark"
          onClick={() => navigate('/bienestar')}
        >
          Volver
        </button>
        <button
          type="button"
          className="encuentros-desktop__button"
          onClick={() => navigate('/bienestar/encuentros/planificar')}
        >
          Continuar
        </button>
      </div>
    </Stage>
  )
}

function Selector({ label, options, value, onSelect, open, onOpenChange }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) onOpenChange(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div className="encuentros-desktop__selector" ref={rootRef}>
      <button
        type="button"
        className={`encuentros-desktop__selector-trigger${value ? ' encuentros-desktop__selector-trigger--selected' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={value ? `${label}: ${value}` : label}
        onClick={() => onOpenChange(!open)}
      >
        <span>{value || 'Selecciona una opción'}</span>
        <Arrow className={`encuentros-desktop__arrow${open ? ' encuentros-desktop__arrow--open' : ''}`} />
      </button>
      {open && (
        <ul className="encuentros-desktop__selector-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(option)
                  onOpenChange(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function EncuentrosPlanDesktop() {
  const navigate = useNavigate()
  const [actividad, setActividad] = useState('')
  const [conQuien, setConQuien] = useState('')
  const [openSelector, setOpenSelector] = useState(null)
  const ready = Boolean(actividad && conQuien)

  function openChange(name) {
    return (open) => setOpenSelector(open ? name : null)
  }

  return (
    <Stage>
      <div className="encuentros-desktop__plan">
        <p className="encuentros-desktop__plan-label">Planifiquemos</p>
        <Selector
          label="Actividad"
          options={ACTIVIDAD_OPTIONS}
          value={actividad}
          onSelect={setActividad}
          open={openSelector === 'actividad'}
          onOpenChange={openChange('actividad')}
        />
        <p className="encuentros-desktop__plan-label">con</p>
        <Selector
          label="¿Con quién?"
          options={CON_QUIEN_OPTIONS}
          value={conQuien}
          onSelect={setConQuien}
          open={openSelector === 'conQuien'}
          onOpenChange={openChange('conQuien')}
        />
      </div>

      <div className="encuentros-desktop__actions">
        <button
          type="button"
          className="encuentros-desktop__button"
          disabled={!ready}
          onClick={() => navigate('/bienestar/encuentros/listo')}
        >
          Continuar
        </button>
      </div>
    </Stage>
  )
}

export function EncuentrosListoDesktop() {
  const navigate = useNavigate()

  return (
    <Stage>
      <div className="encuentros-desktop__listo">
        <p className="encuentros-desktop__listo-title">¡Listo!</p>
        <p className="encuentros-desktop__listo-body">
          Nos pondremos en contacto
          <br />a la brevedad.
        </p>
      </div>

      <div className="encuentros-desktop__actions">
        <button type="button" className="encuentros-desktop__button" onClick={() => navigate('/bienestar')}>
          Volver
        </button>
      </div>
    </Stage>
  )
}
