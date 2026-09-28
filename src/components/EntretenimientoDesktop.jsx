import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EntretenimientoDesktop.css'
import DesktopOptionList from './DesktopOptionList.jsx'
import DesktopGamePopup from './DesktopGamePopup.jsx'

import iconoEncuentros from '../assets/desktop/bienestar-encuentros.svg'
import iconoTrivia from '../assets/desktop/bienestar-trivia.svg'
import iconoMemotest from '../assets/desktop/bienestar-memotest.svg'
import iconoTateti from '../assets/desktop/bienestar-tateti.svg'
import iconoPuzle from '../assets/desktop/bienestar-puzle.svg'

// Encuentros is its own page; the games open DesktopGamePopup.
const ENTERTAINMENT_ITEMS = [
  { key: 'encuentros', label: 'Encuentros', icons: [iconoEncuentros], to: '/bienestar/encuentros' },
  { key: 'trivia', label: 'Trivia', icons: [iconoTrivia] },
  { key: 'memotest', label: 'Memotest', icons: [iconoMemotest] },
  { key: 'tateti', label: 'Tateti', icons: [iconoTateti] },
  { key: 'puzle', label: 'Puzle', icons: [iconoPuzle] },
]

export default function EntretenimientoDesktop() {
  const navigate = useNavigate()
  const [activeGame, setActiveGame] = useState(null)

  function handleSelect(item) {
    if (item.to) navigate(item.to)
    else setActiveGame(item.key)
  }

  return (
    <>
      <DesktopOptionList
        label="Bienestar"
        items={ENTERTAINMENT_ITEMS}
        activeKey={activeGame}
        onSelect={handleSelect}
      />
      {activeGame && <DesktopGamePopup game={activeGame} onClose={() => setActiveGame(null)} />}
    </>
  )
}
