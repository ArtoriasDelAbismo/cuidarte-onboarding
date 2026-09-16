import { useCallback, useEffect, useRef, useState } from 'react'
import { CarmenVoiceClient, CARMEN_STATE, getOrCreateUserId } from './carmenVoice'

export function useCarmenVoice() {
  const clientRef = useRef(null)
  const [state, setState] = useState(CARMEN_STATE.IDLE)
  const [error, setError] = useState(null)

  useEffect(() => () => clientRef.current?.disconnect(), [])

  const start = useCallback(() => {
    setError(null)
    if (!clientRef.current) {
      clientRef.current = new CarmenVoiceClient({
        userId: getOrCreateUserId(),
        onState: setState,
        onError: (err) => setError(err?.message || 'No se pudo conectar con Carmen'),
        onServerMessage: () => {},
      })
    }
    clientRef.current.start()
  }, [])

  const sleep = useCallback(() => {
    clientRef.current?.sleep()
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect()
    clientRef.current = null
  }, [])

  return { state, error, start, sleep, disconnect }
}

export { CARMEN_STATE }
