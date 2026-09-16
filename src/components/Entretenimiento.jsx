import { useNavigate } from 'react-router-dom'
import './Entretenimiento.css'

import blob from '../assets/home/blob-home.svg'
import logo from '../assets/home/logo-compact.svg'
import iconEncuentros from '../assets/entretenimiento/icon-encuentros.svg'
import iconTrivia from '../assets/entretenimiento/icon-trivia.svg'
import iconMemotest from '../assets/entretenimiento/icon-memotest.svg'
import iconTateti from '../assets/entretenimiento/icon-tateti.svg'
import iconPuzle from '../assets/entretenimiento/icon-puzle.svg'
import AssistantOrb from './AssistantOrb.jsx'

const ENTERTAINMENT_CARDS = [
  { key: 'encuentros', label: 'Encuentros', icon: iconEncuentros, to: '/bienestar/encuentros' },
  { key: 'trivia', label: 'Trivia', icon: iconTrivia, to: '/bienestar/trivia' },
  { key: 'memotest', label: 'Memotest', icon: iconMemotest, to: '/bienestar/memotest' },
  { key: 'tateti', label: 'Tateti', icon: iconTateti, to: '/bienestar/tateti' },
  { key: 'puzle', label: 'Puzle', icon: iconPuzle, to: '/bienestar/puzle' },
]

export default function Entretenimiento() {
  const navigate = useNavigate()

  return (
    <div className="entretenimiento">
      <img className="entretenimiento__blob" src={blob} alt="" aria-hidden="true" />
      <div className="entretenimiento__glow" aria-hidden="true" />
      <img className="entretenimiento__logo" src={logo} alt="Cuidarte.ia" />

      <AssistantOrb />

      <div className="entretenimiento__content">
        <div className="entretenimiento__list">
          {ENTERTAINMENT_CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              className="entretenimiento__card"
              onClick={() => navigate(card.to)}
            >
              <img src={card.icon} alt="" aria-hidden="true" />
              <span>{card.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="entretenimiento__back" onClick={() => navigate('/home')}>
          Volver
        </button>
      </div>
    </div>
  )
}
