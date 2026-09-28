import { useLayoutEffect, useRef, useState } from 'react'
import './SwipeToTalk.css'

import knobIcon from '../assets/home/swipe-knob.svg'

// Swiping (not tapping) is deliberate, so Carmen isn't woken by accident.
const COMPLETE_AT = 0.8 // fraction of the track to swipe right to wake her
const CANCEL_AT = 0.2 // ...and back left of this to end the conversation

// Figma: "Swipe" (2059:10505), mobile only. Swipe the knob right to wake
// Carmen; while she's awake the pill stays in its "swipe right" state and
// swiping back left ends the conversation. Enter/Space does the same for
// keyboard and switch users, who can't drag.
export default function SwipeToTalk({ carmen }) {
  const { status, toggle } = carmen
  const active = status === 'connecting' || status === 'connected'
  const busy = status === 'connecting'

  const pillRef = useRef(null)
  const drag = useRef(null) // { startX, base }
  const [dragX, setDragX] = useState(null)
  // Knob travel: pill width minus its horizontal padding (4 + 5) and the 28px
  // knob. Re-measured if the pill resizes (e.g. once the Sen font loads).
  const [max, setMax] = useState(0)

  useLayoutEffect(() => {
    const pill = pillRef.current
    const measure = () => setMax(Math.max(0, pill.offsetWidth - 9 - 28))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(pill)
    return () => observer.disconnect()
  }, [])

  function onPointerDown(event) {
    if (busy || !max) return
    drag.current = { startX: event.clientX, base: active ? max : 0 }
    pillRef.current.setPointerCapture(event.pointerId)
    setDragX(drag.current.base)
  }

  function onPointerMove(event) {
    if (!drag.current) return
    const { startX, base } = drag.current
    setDragX(Math.min(max, Math.max(0, base + event.clientX - startX)))
  }

  function onPointerUp() {
    if (!drag.current) return
    const progress = dragX / max
    if (!active && progress >= COMPLETE_AT) toggle()
    else if (active && progress <= CANCEL_AT) toggle()
    drag.current = null
    setDragX(null) // snaps to where the (possibly new) status says it belongs
  }

  function onClick(event) {
    // event.detail is 0 for keyboard activation; real taps/clicks do nothing,
    // so only a swipe (or the keyboard) can wake Carmen.
    if (event.detail === 0 && !busy) toggle()
  }

  const dragging = dragX !== null
  const x = dragging ? dragX : active ? max : 0
  const progress = max ? x / max : 0

  return (
    <button
      ref={pillRef}
      type="button"
      className={`swipe-to-talk${active ? ' swipe-to-talk--active' : ''}${dragging ? ' swipe-to-talk--dragging' : ''}`}
      style={{ '--x': `${x}px`, '--progress': progress }}
      aria-label={active ? 'Deslizá a la izquierda para terminar la conversación con Carmen' : 'Deslizá para hablar con Carmen'}
      aria-pressed={status === 'connected'}
      aria-busy={busy}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <span className="swipe-to-talk__fill" aria-hidden="true" />
      <img className="swipe-to-talk__knob" src={knobIcon} alt="" aria-hidden="true" draggable="false" />
      <span className="swipe-to-talk__spacer" aria-hidden="true" />
      <span className="swipe-to-talk__label">Swipe para hablar con Cármen</span>
    </button>
  )
}
