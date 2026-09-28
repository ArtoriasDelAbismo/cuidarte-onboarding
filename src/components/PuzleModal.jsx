import './PuzleModal.css'
import { usePuzle } from '../utils/games'

export default function PuzleModal({ onClose }) {
  const { cells, solved, slide, restart } = usePuzle()

  return (
    <div className="puzle-modal-overlay" onClick={onClose}>
      <div
        className="puzle-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Puzle"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="puzle-modal-status">{solved ? '¡Resuelto!' : 'Ordená los números del 1 al 8'}</p>

        <div className="puzle-modal-grid">
          {cells.map((value, index) => (
            <button
              key={index}
              type="button"
              className={
                'puzle-modal-tile' +
                (value === null ? ' puzle-modal-tile--empty' : '') +
                (solved ? ' puzle-modal-tile--solved' : '')
              }
              onClick={() => slide(index)}
              disabled={value === null || solved}
              aria-label={value === null ? 'Casillero vacío' : `Ficha ${value}`}
            >
              {value}
            </button>
          ))}
        </div>

        {solved && (
          <button type="button" className="puzle-modal-restart" onClick={restart}>
            Jugar de nuevo
          </button>
        )}
      </div>

      <button
        type="button"
        className="puzle-modal-close"
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
