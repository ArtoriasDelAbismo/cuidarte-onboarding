import './AssistantOrb.css'

// Placeholder for the AI voice assistant's reactive sphere (Figma: "Audio-Reactive
// animation - Idle state 1"). No real asset from the designer yet, so this is a
// CSS-only idle "breathing" orb — swap the markup here for the real video/Lottie
// loops once they're delivered, and drive `state` (idle/listening/speaking) from
// live mic/audio-output volume via the Web Audio API.
export default function AssistantOrb({ state = 'idle' }) {
  return (
    <div className={`assistant-orb assistant-orb--${state}`}>
      <div className="assistant-orb__shadow" aria-hidden="true" />
      <div className="assistant-orb__sphere" aria-hidden="true" />
    </div>
  )
}
