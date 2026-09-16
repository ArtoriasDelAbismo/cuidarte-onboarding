import { useState } from 'react'
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
import TriviaModal from './TriviaModal.jsx'
import MemotestModal from './MemotestModal.jsx'
import TatetiModal from './TatetiModal.jsx'

const ENTERTAINMENT_CARDS = [
  { key: 'encuentros', label: 'Encuentros', icon: iconEncuentros, to: '/bienestar/encuentros' },
  { key: 'trivia', label: 'Trivia', icon: iconTrivia, modal: 'trivia' },
  { key: 'memotest', label: 'Memotest', icon: iconMemotest, modal: 'memotest' },
  { key: 'tateti', label: 'Tateti', icon: iconTateti, modal: 'tateti' },
  { key: 'puzle', label: 'Puzle', icon: iconPuzle, to: '/bienestar/puzle' },
]

export default function Entretenimiento() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)

  function handleCardClick(card) {
    if (card.modal) {
      setActiveModal(card.modal)
    } else {
      navigate(card.to)
    }
  }

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
              onClick={() => handleCardClick(card)}
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

      {activeModal === 'trivia' && <TriviaModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'memotest' && <MemotestModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'tateti' && <TatetiModal onClose={() => setActiveModal(null)} />}
    </div>
  )
}
