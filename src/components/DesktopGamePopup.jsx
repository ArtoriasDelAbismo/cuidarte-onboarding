import { useEffect, useState } from 'react'
import './DesktopGamePopup.css'
import { useTrivia, useMemotest, useTateti, usePuzle, TATETI_ICONS } from '../utils/games'

import triviaLogo from '../assets/desktop/trivia-logo.svg'

// Figma: "Pop-ups bienestar" — a 1395x642 glass frame around a teal panel.
// It's laid out at design size and scaled down to fit smaller viewports.
const POPUP_WIDTH = 1395
const POPUP_HEIGHT = 642
const VIEWPORT_MARGIN = 64

const TITLES = { trivia: 'Trivia', memotest: 'Memotest', tateti: 'Tateti', puzle: 'Puzle' }

function fitScale() {
  return Math.min(
    1,
    (window.innerWidth - VIEWPORT_MARGIN) / POPUP_WIDTH,
    (window.innerHeight - VIEWPORT_MARGIN) / POPUP_HEIGHT,
  )
}

function useFitScale() {
  const [scale, setScale] = useState(fitScale)
  useEffect(() => {
    const onResize = () => setScale(fitScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

// Status copy + restart for the grid games, in the left column where Trivia has its logo.
function GameSide({ title, copy, onRestart }) {
  return (
    <div className="game-popup__side">
      <p className="game-popup__side-title">{title}</p>
      {copy && <p className="game-popup__side-copy">{copy}</p>}
      {onRestart && (
        <button type="button" className="game-popup__pill" onClick={onRestart}>
          Jugar de nuevo
        </button>
      )}
    </div>
  )
}

function Trivia() {
  const { index, total, current, selected, score, finished, select, restart } = useTrivia()

  return (
    <>
      <img className="game-popup__trivia-logo" src={triviaLogo} alt="Trivia" />
      {!finished && (
        <span className="game-popup__trivia-count">
          {index + 1}/{total}
        </span>
      )}
      <div className="game-popup__trivia-frame">
        <p className="game-popup__trivia-question">{finished ? '¡Listo!' : current.question}</p>
        {finished ? (
          <div className="game-popup__trivia-result">
            <p>
              Acertaste {score} de {total}
            </p>
            <button type="button" className="game-popup__pill" onClick={restart}>
              Jugar de nuevo
            </button>
          </div>
        ) : (
          <div className="game-popup__trivia-options">
            {current.options.map((option, i) => {
              const answered = selected !== null
              const isCorrect = answered && i === current.correct
              const isWrong = answered && selected === i && i !== current.correct
              return (
                <button
                  key={option}
                  type="button"
                  className={
                    'game-popup__trivia-option' +
                    (isCorrect ? ' game-popup__trivia-option--correct' : '') +
                    (isWrong ? ' game-popup__trivia-option--wrong' : '')
                  }
                  onClick={() => select(i)}
                  disabled={answered}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function Memotest() {
  const { tiles, allMatched, flip, restart, isRevealed } = useMemotest()

  return (
    <>
      <GameSide
        title={allMatched ? '¡Muy bien!' : 'Memotest'}
        copy={allMatched ? 'Encontraste todos los pares.' : 'Encontrá los pares.'}
        onRestart={allMatched ? restart : null}
      />
      <div className="game-popup__grid game-popup__grid--memotest">
        {tiles.map((tile, index) => {
          const revealed = isRevealed(index)
          return (
            <button
              key={tile.id}
              type="button"
              className="game-popup__tile"
              onClick={() => flip(index)}
              disabled={tile.matched}
              aria-label={revealed ? 'Ficha revelada' : 'Ficha boca abajo'}
            >
              {revealed && <img src={tile.icon} alt="" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </>
  )
}

function Tateti() {
  const { cells, result, over, status, play, restart } = useTateti()

  return (
    <>
      <GameSide title={status} onRestart={over ? restart : null} />
      <div className="game-popup__grid game-popup__grid--tateti">
        {cells.map((mark, index) => (
          <button
            key={index}
            type="button"
            className={'game-popup__cell' + (result?.line.includes(index) ? ' game-popup__cell--win' : '')}
            onClick={() => play(index)}
            disabled={!!mark || !!result}
            aria-label={mark ? `Casillero ${mark}` : 'Casillero vacío'}
          >
            {mark && <img src={TATETI_ICONS[mark]} alt="" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </>
  )
}

function Puzle() {
  const { cells, solved, slide, restart } = usePuzle()

  return (
    <>
      <GameSide
        title={solved ? '¡Resuelto!' : 'Puzle'}
        copy={solved ? null : 'Ordená los números del 1 al 8.'}
        onRestart={solved ? restart : null}
      />
      <div className="game-popup__grid game-popup__grid--puzle">
        {cells.map((value, index) => (
          <button
            key={index}
            type="button"
            className={'game-popup__tile game-popup__tile--number' + (value === null ? ' game-popup__tile--empty' : '')}
            onClick={() => slide(index)}
            disabled={value === null || solved}
            aria-label={value === null ? 'Casillero vacío' : `Ficha ${value}`}
          >
            {value}
          </button>
        ))}
      </div>
    </>
  )
}

const GAMES = { trivia: Trivia, memotest: Memotest, tateti: Tateti, puzle: Puzle }

export default function DesktopGamePopup({ game, onClose }) {
  const scale = useFitScale()
  const Game = GAMES[game]

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="game-popup__overlay" onClick={onClose}>
      <div
        className="game-popup"
        style={{ scale }}
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[game]}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="game-popup__panel">
          <button type="button" className="game-popup__close" onClick={onClose}>
            Cerrar
          </button>
          <Game />
        </div>
      </div>
    </div>
  )
}
