import './TatetiModal.css'
import { useTateti, TATETI_ICONS } from '../utils/games'

export default function TatetiModal({ onClose }) {
  const { cells, result, isDraw, status, play, restart } = useTateti()

  return (
    <div className="tateti-modal-overlay" onClick={onClose}>
      <div
        className="tateti-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Tateti"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="tateti-modal-status">{status}</p>

        <div className="tateti-modal-grid">
          {cells.map((mark, index) => (
            <button
              key={index}
              type="button"
              className={
                'tateti-modal-cell' + (result?.line.includes(index) ? ' tateti-modal-cell--win' : '')
              }
              onClick={() => play(index)}
              disabled={!!mark || !!result}
              aria-label={mark ? `Casillero ${mark}` : 'Casillero vacío'}
            >
              {mark && <img src={TATETI_ICONS[mark]} alt="" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {(result || isDraw) && (
          <button type="button" className="tateti-modal-restart" onClick={restart}>
            Jugar de nuevo
          </button>
        )}
      </div>

      <button
        type="button"
        className="tateti-modal-close"
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
