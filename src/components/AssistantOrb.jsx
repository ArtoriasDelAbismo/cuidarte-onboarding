import { useEffect, useRef } from 'react'
import './AssistantOrb.css'

import orbIdle from '../assets/assistant/orb-idle.mp4'

// The Figma "Audio-Reactive animation - Idle state 1" export from the designer.
// It's a flat opaque square (no alpha channel — Safari doesn't reliably support
// alpha WebM/HEVC in <video>), so the square edges are faded out with a CSS
// radial mask instead, matching the ffmpeg mask used when the video was cropped.
// TODO: once the designer delivers separate "listening"/"speaking" loops, swap
// the `src` per `state` instead of just changing playbackRate.
const PLAYBACK_RATE = { idle: 1, listening: 1.3, speaking: 1.7 }

export default function AssistantOrb({ state = 'idle' }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = PLAYBACK_RATE[state] ?? 1
    }
  }, [state])

  return (
    <div className={`assistant-orb assistant-orb--${state}`}>
      <video
        ref={videoRef}
        className="assistant-orb__video"
        src={orbIdle}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
    </div>
  )
}
