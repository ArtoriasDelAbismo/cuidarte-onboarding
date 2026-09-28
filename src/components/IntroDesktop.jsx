import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './IntroDesktop.css'
import { storeEmergencyPhones, storeNombre } from '../utils/notifyVideoOpened'

import heroBg from '../assets/desktop/hero-bg.jpg'
import logotipo from '../assets/desktop/logotipo.svg'

const SEXO_OPTIONS = ['Masculino', 'Femenino', 'No binario', 'Prefiero no especificar']

const PHONE_PATTERN = '\\+?[0-9]{8,15}'
const PHONE_TITLE = 'Incluí el código de país, ej: +5493425145645'

const EMPTY_FORM = {
  nombre: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  telefonoEmergencia1: '',
  telefonoEmergencia2: '',
}

function Chevron({ className }) {
  return (
    <svg className={className} width="34" height="19" viewBox="0 0 34 19" aria-hidden="true">
      <path
        d="M22.293 5.793a1 1 0 0 1 1.414 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 1.414-1.414L17 11.086l5.293-5.293Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SexoDropdown({ value, onChange, open, onOpenChange }) {
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
    <div className="intro-desktop__dropdown" ref={rootRef}>
      <button
        type="button"
        className={`intro-desktop__field intro-desktop__dropdown-trigger${
          value ? ' intro-desktop__dropdown-trigger--selected' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className={value ? '' : 'intro-desktop__placeholder'}>{value || 'Sexo'}</span>
        <Chevron
          className={`intro-desktop__chevron${open ? ' intro-desktop__chevron--open' : ''}`}
        />
      </button>
      {open && (
        <ul className="intro-desktop__dropdown-menu" role="listbox" aria-label="Sexo">
          {SEXO_OPTIONS.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                className="intro-desktop__dropdown-option"
                onClick={() => {
                  onChange(option)
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

export default function IntroDesktop() {
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [sexoOpen, setSexoOpen] = useState(false)
  const [dateFocused, setDateFocused] = useState(false)
  const navigate = useNavigate()

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.sexo) {
      setSexoOpen(true)
      return
    }
    storeEmergencyPhones(form.telefonoEmergencia1, form.telefonoEmergencia2)
    storeNombre(form.nombre)
    // TODO: send `form` to cuidarte-ia-backend once the patient registration endpoint exists
    // The desktop Home opens with its own intro sequence, so skip the mobile loading screen
    navigate('/home')
  }

  return (
    <div className="intro-desktop">
      <div className="intro-desktop__bg" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="intro-desktop__scrim" />

      <div className="intro-desktop__content">
        <div className={`intro-desktop__card${expanded ? ' intro-desktop__card--expanded' : ''}`}>
          <img className="intro-desktop__logo" src={logotipo} alt="Cuidarte.ia" />

          {expanded ? (
            <form className="intro-desktop__form" onSubmit={handleSubmit}>
              <div className="intro-desktop__fields">
                <input
                  className="intro-desktop__field"
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={form.nombre}
                  onChange={handleChange('nombre')}
                  autoFocus
                  required
                />
                <input
                  className="intro-desktop__field"
                  type={dateFocused || form.fechaNacimiento ? 'date' : 'text'}
                  placeholder="Fecha de nacimiento"
                  value={form.fechaNacimiento}
                  onChange={handleChange('fechaNacimiento')}
                  onFocus={() => setDateFocused(true)}
                  onBlur={() => setDateFocused(false)}
                  required
                />
                <SexoDropdown
                  value={form.sexo}
                  onChange={(sexo) => setForm((prev) => ({ ...prev, sexo }))}
                  open={sexoOpen}
                  onOpenChange={setSexoOpen}
                />
                <input
                  className="intro-desktop__field"
                  type="tel"
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={handleChange('telefono')}
                  pattern={PHONE_PATTERN}
                  title={PHONE_TITLE}
                  required
                />
                <input
                  className="intro-desktop__field"
                  type="tel"
                  placeholder="Teléfono de emergencia 1"
                  value={form.telefonoEmergencia1}
                  onChange={handleChange('telefonoEmergencia1')}
                  pattern={PHONE_PATTERN}
                  title={PHONE_TITLE}
                  required
                />
                <input
                  className="intro-desktop__field"
                  type="tel"
                  placeholder="Teléfono de emergencia 2"
                  value={form.telefonoEmergencia2}
                  onChange={handleChange('telefonoEmergencia2')}
                  pattern={PHONE_PATTERN}
                  title={PHONE_TITLE}
                />
              </div>
              <button type="submit" className="intro-desktop__cta">
                Comenzar
              </button>
            </form>
          ) : (
            <button type="button" className="intro-desktop__cta" onClick={() => setExpanded(true)}>
              Empezá tu experiencia
            </button>
          )}
        </div>

        <h1 className="intro-desktop__headline">
          <span>Cerca de quienes</span>
          <span className="intro-desktop__headline-accent">más importan.</span>
        </h1>
      </div>
    </div>
  )
}
