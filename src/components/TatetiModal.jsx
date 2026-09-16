import { useState } from 'react'
import './TatetiModal.css'

import iconX from '../assets/entretenimiento/tateti/icon-x.svg'
import iconO from '../assets/entretenimiento/tateti/icon-o.svg'

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const ICONS = { X: iconX, O: iconO }

function calculateWinner(cells) {
  for (const line of LINES) {
    const [a, b, c] = line
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { mark: cells[a], line }
    }
  }
  return null
}

export default function TatetiModal({ onClose }) {
  const [cells, setCells] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')

  const result = calculateWinner(cells)
  const isDraw = !result && cells.every((c) => c !== null)

  function handleCellClick(index) {
    if (cells[index] || result) return
    const next = [...cells]
    next[index] = turn
    setCells(next)
    setTurn(turn === 'X' ? 'O' : 'X')
  }

  function handleRestart() {
    setCells(Array(9).fill(null))
    setTurn('X')
  }

  let status
  if (result) status = `¡Ganó ${result.mark}!`
  else if (isDraw) status = 'Empate'
  else status = `Turno de ${turn}`

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
              onClick={() => handleCellClick(index)}
              disabled={!!mark || !!result}
              aria-label={mark ? `Casillero ${mark}` : 'Casillero vacío'}
            >
              {mark && <img src={ICONS[mark]} alt="" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {(result || isDraw) && (
          <button type="button" className="tateti-modal-restart" onClick={handleRestart}>
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
