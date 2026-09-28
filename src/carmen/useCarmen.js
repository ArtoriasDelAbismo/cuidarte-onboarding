import { useCallback, useEffect, useRef } from 'react'
import { useRealtimeVoice } from './useRealtimeVoice'
import { useElevenLabsVoice } from './useElevenLabsVoice'
import { VOICE_PROVIDER } from './config'

// Carmen's voice connection plus the mood targets her face animates toward.
// Owned by the page (not by CarmenScreen) so any control — the "Interactuá con
// Carmen" button, a tap on the device's screen — can wake her or send her back
// to sleep. Ported from cuidarte-carmen's CarmenScene.
export function useCarmen() {
  const happyTargetRef = useRef(0)
  const concernedTargetRef = useRef(0)
  const sadTargetRef = useRef(0)

  // Driven by Carmen's own set_expression tool calls; persists until she calls
  // it again. The moods are mutually exclusive: whichever she reports wins.
  const handleExpressionChange = useCallback((mood) => {
    happyTargetRef.current = mood === 'happy' ? 1 : 0
    concernedTargetRef.current = mood === 'concerned' ? 1 : 0
    sadTargetRef.current = mood === 'sad' ? 1 : 0
  }, [])

  // Both hooks are always called (Rules of Hooks); neither opens a connection
  // until connect(), so the unused one stays idle. VOICE_PROVIDER picks which
  // one is actually wired up.
  const openaiVoice = useRealtimeVoice({ onExpressionChange: handleExpressionChange })
  const elevenLabsVoice = useElevenLabsVoice({ onExpressionChange: handleExpressionChange })
  const { status, error, connect, disconnect, speakRef } = VOICE_PROVIDER === 'elevenlabs' ? elevenLabsVoice : openaiVoice

  // Hang up if the page unmounts mid-conversation (e.g. navigating to
  // Encuentros), so the microphone doesn't stay open in the background.
  const disconnectRef = useRef(disconnect)
  useEffect(() => {
    disconnectRef.current = disconnect
  }, [disconnect])
  useEffect(() => () => disconnectRef.current(), [])

  // 'error' behaves like 'idle' (tap retries); taps are ignored while connecting.
  const toggle = useCallback(() => {
    if (status === 'connected') disconnect()
    else if (status !== 'connecting') connect()
  }, [status, connect, disconnect])

  return {
    status,
    error,
    awake: status === 'connected',
    toggle,
    disconnect,
    speakRef,
    happyTargetRef,
    concernedTargetRef,
    sadTargetRef,
  }
}
