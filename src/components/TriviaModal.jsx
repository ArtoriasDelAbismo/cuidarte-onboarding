import './TriviaModal.css'
import { useTrivia } from '../utils/games'

export default function TriviaModal({ onClose }) {
  const { index, total, current, selected, score, finished, select } = useTrivia()

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
              {index + 1}/{total}
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
                    onClick={() => select(i)}
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
              Acertaste {score} de {total}
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
