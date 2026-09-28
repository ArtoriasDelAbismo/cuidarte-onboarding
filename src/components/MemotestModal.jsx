import './MemotestModal.css'
import { useMemotest } from '../utils/games'

export default function MemotestModal({ onClose }) {
  const { tiles, allMatched, flip, restart, isRevealed } = useMemotest()

  return (
    <div className="memotest-modal-overlay" onClick={onClose}>
      <div
        className="memotest-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Memotest"
        onClick={(event) => event.stopPropagation()}
      >
        {allMatched ? (
          <div className="memotest-modal-result">
            <p className="memotest-modal-result-title">¡Muy bien!</p>
            <p className="memotest-modal-result-copy">Encontraste todos los pares.</p>
            <button type="button" className="memotest-modal-restart" onClick={restart}>
              Jugar de nuevo
            </button>
          </div>
        ) : (
          <div className="memotest-modal-grid">
            {tiles.map((tile, index) => {
              const revealed = isRevealed(index)
              return (
                <button
                  key={tile.id}
                  type="button"
                  className={
                    'memotest-modal-tile' + (tile.matched ? ' memotest-modal-tile--matched' : '')
                  }
                  onClick={() => flip(index)}
                  disabled={tile.matched}
                  aria-label={revealed ? 'Ficha revelada' : 'Ficha boca abajo'}
                >
                  {revealed && <img src={tile.icon} alt="" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        className="memotest-modal-close"
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
