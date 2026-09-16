import { useState } from 'react'
import './MemotestModal.css'

import iconHeart from '../assets/entretenimiento/memotest/icon-heart.svg'
import iconHome from '../assets/entretenimiento/memotest/icon-home.svg'
import iconBolt from '../assets/entretenimiento/memotest/icon-bolt.svg'
import iconStar from '../assets/entretenimiento/memotest/icon-star.svg'
import iconSun from '../assets/entretenimiento/memotest/icon-sun.svg'
import iconLeaf from '../assets/entretenimiento/memotest/icon-leaf.svg'

const ICONS = [iconHeart, iconHome, iconBolt, iconStar, iconSun, iconLeaf]
const MISMATCH_DELAY_MS = 800
const MATCH_DELAY_MS = 300

function shuffledTiles() {
  const pairs = [...ICONS, ...ICONS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((icon, i) => ({ id: i, icon, matched: false }))
}

export default function MemotestModal({ onClose }) {
  const [tiles, setTiles] = useState(shuffledTiles)
  const [flipped, setFlipped] = useState([])
  const [busy, setBusy] = useState(false)

  const allMatched = tiles.every((t) => t.matched)

  function handleTileClick(index) {
    if (busy || flipped.includes(index) || tiles[index].matched) return

    const next = [...flipped, index]
    setFlipped(next)

    if (next.length === 2) {
      setBusy(true)
      const [a, b] = next
      if (tiles[a].icon === tiles[b].icon) {
        setTimeout(() => {
          setTiles((prev) => prev.map((t, i) => (i === a || i === b ? { ...t, matched: true } : t)))
          setFlipped([])
          setBusy(false)
        }, MATCH_DELAY_MS)
      } else {
        setTimeout(() => {
          setFlipped([])
          setBusy(false)
        }, MISMATCH_DELAY_MS)
      }
    }
  }

  function handleRestart() {
    setTiles(shuffledTiles())
    setFlipped([])
    setBusy(false)
  }

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
            <button type="button" className="memotest-modal-restart" onClick={handleRestart}>
              Jugar de nuevo
            </button>
          </div>
        ) : (
          <div className="memotest-modal-grid">
            {tiles.map((tile, index) => {
              const isRevealed = tile.matched || flipped.includes(index)
              return (
                <button
                  key={tile.id}
                  type="button"
                  className={
                    'memotest-modal-tile' + (tile.matched ? ' memotest-modal-tile--matched' : '')
                  }
                  onClick={() => handleTileClick(index)}
                  disabled={tile.matched}
                  aria-label={isRevealed ? 'Ficha revelada' : 'Ficha boca abajo'}
                >
                  {isRevealed && <img src={tile.icon} alt="" aria-hidden="true" />}
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
