import './AssistantOrb.css'
import { useCarmenVoice, CARMEN_STATE } from '../utils/useCarmenVoice'

// Figma: "Audio-Reactive animation - Idle state 1". No real asset from the
// designer yet, so this is a CSS-only "breathing" orb — swap the markup here
// for the real video/Lottie loops once delivered.
//
// Tap toggles the Carmen voice connection (see utils/carmenVoice.js). Visual
// state only distinguishes idle/listening/speaking; connecting/sleeping/error
// all render as idle since no distinct treatment has been designed for them.
// `speaking` is never actually reached yet — the backend hasn't specified how
// Carmen's spoken-response audio is delivered to the client.
const VISUAL_STATE = {
  [CARMEN_STATE.LISTENING]: 'listening',
  [CARMEN_STATE.SPEAKING]: 'speaking',
}

export default function AssistantOrb() {
  const { state, error, start, sleep } = useCarmenVoice()

  function handleClick() {
    if (state === CARMEN_STATE.IDLE || state === CARMEN_STATE.SLEEPING || state === CARMEN_STATE.ERROR) {
      start()
    } else if (state === CARMEN_STATE.LISTENING || state === CARMEN_STATE.SPEAKING) {
      sleep()
    }
  }

  const visualState = VISUAL_STATE[state] || 'idle'

  return (
    <button
      type="button"
      className={`assistant-orb assistant-orb--${visualState}`}
      onClick={handleClick}
      aria-label="Hablar con Carmen"
      aria-pressed={state === CARMEN_STATE.LISTENING || state === CARMEN_STATE.SPEAKING}
    >
      <div className="assistant-orb__shadow" aria-hidden="true" />
      <div className="assistant-orb__sphere" aria-hidden="true" />
      {error && <span className="assistant-orb__error">{error}</span>}
    </button>
  )
}
