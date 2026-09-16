import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EncuentrosPlan.css'

import chevronDown from '../assets/entretenimiento/encuentros/chevron-down.svg'
import chevronUp from '../assets/entretenimiento/encuentros/chevron-up.svg'

const ACTIVIDAD_OPTIONS = [
  'Caminata en costanera',
  'Tomar un café/té',
  'Ir al Teatro Municipal',
  'Ir al Museo Rosa Galisteo',
  'Visita guiada cervecería',
]

const CON_QUIEN_OPTIONS = [
  'Persona a ciegas',
  'Familiares o amigos',
  'Mi pareja',
  'Grupo de 4 o más personas',
  'Nadie',
]

function Dropdown({ options, value, onSelect }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`encuentros-plan__dropdown ${open ? 'encuentros-plan__dropdown--open' : ''}`}>
      <button
        type="button"
        className="encuentros-plan__dropdown-header"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{value || 'Selecciona una opción'}</span>
        <img src={open ? chevronUp : chevronDown} alt="" aria-hidden="true" />
      </button>
      {open && (
        <ul className="encuentros-plan__dropdown-list">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onSelect(option)
                  setOpen(false)
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

export default function EncuentrosPlan() {
  const navigate = useNavigate()
  const [actividad, setActividad] = useState('')
  const [conQuien, setConQuien] = useState('')

  return (
    <div className="encuentros-plan">
      <div className="encuentros-plan__blob" aria-hidden="true" />
      <div className="encuentros-plan__glow" aria-hidden="true" />

      <div className="encuentros-plan__content">
        <p className="encuentros-plan__label">Planifiquemos</p>
        <Dropdown options={ACTIVIDAD_OPTIONS} value={actividad} onSelect={setActividad} />
        <p className="encuentros-plan__label">con</p>
        <Dropdown options={CON_QUIEN_OPTIONS} value={conQuien} onSelect={setConQuien} />

        <button
          type="button"
          className="encuentros-plan__confirm"
          onClick={() => navigate('/bienestar/encuentros/listo')}
        >
          Confirmar
        </button>
      </div>

      <button
        type="button"
        className="encuentros-plan__back"
        onClick={() => navigate('/bienestar/encuentros')}
      >
        Volver
      </button>
    </div>
  )
}
