import { useState } from 'react'

// Game rules shared by the mobile modals and the desktop pop-ups, so both
// platforms play identically and only the markup differs.

import iconHeart from '../assets/entretenimiento/memotest/icon-heart.svg'
import iconHome from '../assets/entretenimiento/memotest/icon-home.svg'
import iconBolt from '../assets/entretenimiento/memotest/icon-bolt.svg'
import iconStar from '../assets/entretenimiento/memotest/icon-star.svg'
import iconSun from '../assets/entretenimiento/memotest/icon-sun.svg'
import iconLeaf from '../assets/entretenimiento/memotest/icon-leaf.svg'
import iconX from '../assets/entretenimiento/tateti/icon-x.svg'
import iconO from '../assets/entretenimiento/tateti/icon-o.svg'

// ---------- Trivia ----------

export const TRIVIA_QUESTIONS = [
  { question: '¿Cuántos días tiene una semana?', options: ['5', '6', '7'], correct: 2 },
  { question: '¿Qué océano es más grande?', options: ['Atlántico', 'Pacífico'], correct: 1 },
  { question: '¿De qué color es el cielo en un día despejado?', options: ['Celeste', 'Verde', 'Gris'], correct: 0 },
  { question: '¿Cuál es el primer mes del año?', options: ['Enero', 'Marzo', 'Diciembre'], correct: 0 },
  { question: '¿Cuántas patas tiene un perro?', options: ['2', '4', '6'], correct: 1 },
]

const TRIVIA_ADVANCE_DELAY_MS = 900

export function useTrivia() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = TRIVIA_QUESTIONS[index]

  function select(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    if (optionIndex === current.correct) setScore((s) => s + 1)

    setTimeout(() => {
      if (index + 1 < TRIVIA_QUESTIONS.length) {
        setIndex((i) => i + 1)
        setSelected(null)
      } else {
        setFinished(true)
      }
    }, TRIVIA_ADVANCE_DELAY_MS)
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  return { index, total: TRIVIA_QUESTIONS.length, current, selected, score, finished, select, restart }
}

// ---------- Memotest ----------

const MEMOTEST_ICONS = [iconHeart, iconHome, iconBolt, iconStar, iconSun, iconLeaf]
const MEMOTEST_MISMATCH_DELAY_MS = 800
const MEMOTEST_MATCH_DELAY_MS = 300

function shuffledMemotestTiles() {
  const pairs = [...MEMOTEST_ICONS, ...MEMOTEST_ICONS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((icon, i) => ({ id: i, icon, matched: false }))
}

export function useMemotest() {
  const [tiles, setTiles] = useState(shuffledMemotestTiles)
  const [flipped, setFlipped] = useState([])
  const [busy, setBusy] = useState(false)

  const allMatched = tiles.every((t) => t.matched)

  function flip(index) {
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
        }, MEMOTEST_MATCH_DELAY_MS)
      } else {
        setTimeout(() => {
          setFlipped([])
          setBusy(false)
        }, MEMOTEST_MISMATCH_DELAY_MS)
      }
    }
  }

  function restart() {
    setTiles(shuffledMemotestTiles())
    setFlipped([])
    setBusy(false)
  }

  function isRevealed(index) {
    return tiles[index].matched || flipped.includes(index)
  }

  return { tiles, allMatched, flip, restart, isRevealed }
}

// ---------- Tateti ----------

const TATETI_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const TATETI_ICONS = { X: iconX, O: iconO }

function tatetiWinner(cells) {
  for (const line of TATETI_LINES) {
    const [a, b, c] = line
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { mark: cells[a], line }
    }
  }
  return null
}

export function useTateti() {
  const [cells, setCells] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')

  const result = tatetiWinner(cells)
  const isDraw = !result && cells.every((c) => c !== null)

  function play(index) {
    if (cells[index] || result) return
    const next = [...cells]
    next[index] = turn
    setCells(next)
    setTurn(turn === 'X' ? 'O' : 'X')
  }

  function restart() {
    setCells(Array(9).fill(null))
    setTurn('X')
  }

  let status
  if (result) status = `¡Ganó ${result.mark}!`
  else if (isDraw) status = 'Empate'
  else status = `Turno de ${turn}`

  return { cells, result, isDraw, over: !!result || isDraw, status, play, restart }
}

// ---------- Puzle (8-puzzle) ----------

const PUZLE_SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, null]
const PUZLE_SHUFFLE_MOVES = 150

function puzleAdjacent(index) {
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
function shuffledPuzleCells() {
  const cells = [...PUZLE_SOLVED]
  let emptyIndex = cells.indexOf(null)
  let lastIndex = -1
  for (let i = 0; i < PUZLE_SHUFFLE_MOVES; i++) {
    const options = puzleAdjacent(emptyIndex).filter((idx) => idx !== lastIndex)
    const swapWith = options[Math.floor(Math.random() * options.length)]
    ;[cells[emptyIndex], cells[swapWith]] = [cells[swapWith], cells[emptyIndex]]
    lastIndex = emptyIndex
    emptyIndex = swapWith
  }
  return cells
}

export function usePuzle() {
  const [cells, setCells] = useState(shuffledPuzleCells)

  const solved = cells.every((value, index) => value === PUZLE_SOLVED[index])

  function slide(index) {
    if (solved || cells[index] === null) return
    const emptyIndex = cells.indexOf(null)
    if (!puzleAdjacent(index).includes(emptyIndex)) return

    const next = [...cells]
    ;[next[index], next[emptyIndex]] = [next[emptyIndex], next[index]]
    setCells(next)
  }

  function restart() {
    setCells(shuffledPuzleCells())
  }

  return { cells, solved, slide, restart }
}
