import { useState } from 'react'
import './TriviaModal.css'

const QUESTIONS = [
  { question: '¿Cuántos días tiene una semana?', options: ['5', '6', '7'], correct: 2 },
  { question: '¿Qué océano es más grande?', options: ['Atlántico', 'Pacífico'], correct: 1 },
  { question: '¿De qué color es el cielo en un día despejado?', options: ['Celeste', 'Verde', 'Gris'], correct: 0 },
  { question: '¿Cuál es el primer mes del año?', options: ['Enero', 'Marzo', 'Diciembre'], correct: 0 },
  { question: '¿Cuántas patas tiene un perro?', options: ['2', '4', '6'], correct: 1 },
]

const ADVANCE_DELAY_MS = 900

export default function TriviaModal({ onClose }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = QUESTIONS[index]

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    if (optionIndex === current.correct) setScore((s) => s + 1)

    setTimeout(() => {
      if (index + 1 < QUESTIONS.length) {
        setIndex((i) => i + 1)
        setSelected(null)
      } else {
        setFinished(true)
      }
    }, ADVANCE_DELAY_MS)
  }

  return (
    <div className="trivia-modal-overlay" onClick={onClose}>
      <div
        className="trivia-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Trivia"
        onClick={(event) => event.stopPropagation()}
      >
        {!finished ? (
          <>
            <span className="trivia-modal-progress">
              {index + 1}/{QUESTIONS.length}
            </span>
            <div className="trivia-modal-question">
              <p>{current.question}</p>
            </div>
            <div className="trivia-modal-options">
              {current.options.map((option, i) => {
                const showFeedback = selected !== null
                const isCorrectOption = i === current.correct
                const isWrongSelection = showFeedback && selected === i && !isCorrectOption
                return (
                  <button
                    key={option}
                    type="button"
                    className={
                      'trivia-modal-option' +
                      (showFeedback && isCorrectOption ? ' trivia-modal-option--correct' : '') +
                      (isWrongSelection ? ' trivia-modal-option--incorrect' : '')
                    }
                    onClick={() => handleSelect(i)}
                    disabled={showFeedback}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="trivia-modal-result">
            <p className="trivia-modal-result-title">¡Listo!</p>
            <p className="trivia-modal-result-score">
              Acertaste {score} de {QUESTIONS.length}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="trivia-modal-close"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
      >
        Volver
      </button>
    </div>
  )
}
