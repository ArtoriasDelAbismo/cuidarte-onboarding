import { useState } from 'react'
import './PuzleModal.css'

const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, null]
const SHUFFLE_MOVES = 150

function getEmptyIndex(cells) {
  return cells.indexOf(null)
}

function getAdjacentIndices(index) {
  const row = Math.floor(index / 3)
  const col = index % 3
  const adjacent = []
  if (row > 0) adjacent.push(index - 3)
  if (row < 2) adjacent.push(index + 3)
  if (col > 0) adjacent.push(index - 1)
  if (col < 2) adjacent.push(index + 1)
  return adjacent
}

// Always shuffles by performing random legal slides from the solved state,
// rather than a random permutation — guarantees the result is solvable
// (an arbitrary permutation of an 8-puzzle is only solvable ~50% of the time).
function shuffledCells() {
  const cells = [...SOLVED]
  let emptyIndex = getEmptyIndex(cells)
  let lastIndex = -1
  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    const options = getAdjacentIndices(emptyIndex).filter((idx) => idx !== lastIndex)
    const swapWith = options[Math.floor(Math.random() * options.length)]
    ;[cells[emptyIndex], cells[swapWith]] = [cells[swapWith], cells[emptyIndex]]
    lastIndex = emptyIndex
    emptyIndex = swapWith
  }
  return cells
}

function isSolved(cells) {
  return cells.every((value, index) => value === SOLVED[index])
}

export default function PuzleModal({ onClose }) {
  const [cells, setCells] = useState(shuffledCells)

  const solved = isSolved(cells)

  function handleTileClick(index) {
    if (solved || cells[index] === null) return
    const emptyIndex = getEmptyIndex(cells)
    if (!getAdjacentIndices(index).includes(emptyIndex)) return

    const next = [...cells]
    ;[next[index], next[emptyIndex]] = [next[emptyIndex], next[index]]
    setCells(next)
  }

  function handleRestart() {
    setCells(shuffledCells())
  }

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
              onClick={() => handleTileClick(index)}
              disabled={value === null || solved}
              aria-label={value === null ? 'Casillero vacío' : `Ficha ${value}`}
            >
              {value}
            </button>
          ))}
        </div>

        {solved && (
          <button type="button" className="puzle-modal-restart" onClick={handleRestart}>
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
