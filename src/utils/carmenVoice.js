// Client for Carmen's voice WebSocket bridge. Protocol as specified by the
// backend dev (2026-09-16):
//   client.hello -> bridge.ready -> input_audio_buffer.append (streaming)
//   client.playback_done -> bridge.playback_ack
//   client.sleep -> bridge.sleep_ack (socket stays open)
//   client.disconnect closes the socket
//
// NOT YET SPECIFIED by the backend, so not implemented here:
//   - the message type/shape carrying Carmen's spoken-response audio back
//     to the client (so `speaking` is never entered — only idle/listening)
//   - whether the server auto-detects end-of-turn (VAD) or the client must
//     signal it explicitly (we just stream continuously and wait)
// Unknown server message types are logged and forwarded via onServerMessage
// so the caller can inspect real traffic once the above lands.

const SOCKET_URL = import.meta.env.VITE_CARMEN_WS_URL || 'wss://openia.dev.cuidarte.tlabcloud.tech/voice/ws'
const DEFAULT_SAMPLE_RATE = 24000
const USER_ID_STORAGE_KEY = 'cuidarte:carmen-user-id'

export const CARMEN_STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  SLEEPING: 'sleeping',
  ERROR: 'error',
}

// TODO: replace with the real patient id once patient registration exists on
// the backend (Registro.jsx currently never creates a server-side record).
export function getOrCreateUserId() {
  let id = localStorage.getItem(USER_ID_STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_STORAGE_KEY, id)
  }
  return id
}

export class CarmenVoiceClient {
  constructor({ userId, token = '', onState, onError, onServerMessage }) {
    this.userId = userId
    this.token = token
    this.onState = onState || (() => {})
    this.onError = onError || (() => {})
    this.onServerMessage = onServerMessage || (() => {})

    this.ws = null
    this.audioContext = null
    this.workletNode = null
    this.sourceNode = null
    this.micStream = null
    this.sampleRate = DEFAULT_SAMPLE_RATE
    this.state = CARMEN_STATE.IDLE
  }

  setState(next) {
    this.state = next
    this.onState(next)
  }

  start() {
    if (this.ws) return
    this.setState(CARMEN_STATE.CONNECTING)

    this.ws = new WebSocket(SOCKET_URL)
    this.ws.addEventListener('open', () => {
      this.send({ type: 'client.hello', user_id: this.userId, token: this.token })
    })
    this.ws.addEventListener('message', (event) => this.handleMessage(event))
    this.ws.addEventListener('close', () => {
      this.teardownAudio()
      this.ws = null
      this.setState(CARMEN_STATE.IDLE)
    })
    this.ws.addEventListener('error', (event) => {
      this.onError(event)
      this.setState(CARMEN_STATE.ERROR)
    })
  }

  async handleMessage(event) {
    let msg
    try {
      msg = JSON.parse(event.data)
    } catch {
      // Binary frame — presumably Carmen's response audio, but the shape/type
      // for that isn't specified yet, so just forward it untouched.
      this.onServerMessage({ type: 'binary', data: event.data })
      return
    }

    switch (msg.type) {
      case 'bridge.ready':
        this.sampleRate = msg.audio_format?.sample_rate || DEFAULT_SAMPLE_RATE
        try {
          await this.beginCapture()
          this.setState(CARMEN_STATE.LISTENING)
        } catch (err) {
          this.onError(err)
          this.setState(CARMEN_STATE.ERROR)
        }
        break
      case 'bridge.sleep_ack':
        this.setState(CARMEN_STATE.SLEEPING)
        break
      case 'bridge.playback_ack':
        this.setState(CARMEN_STATE.LISTENING)
        break
      default:
        console.warn('[carmen] unhandled message type', msg.type, msg)
        break
    }

    this.onServerMessage(msg)
  }

  async beginCapture() {
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    await this.audioContext.audioWorklet.addModule(
      new URL('./pcm-worklet-processor.js', import.meta.url),
    )

    this.sourceNode = this.audioContext.createMediaStreamSource(this.micStream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-capture-processor')

    this.workletNode.port.onmessage = (event) => {
      const resampled = resampleLinear(event.data, this.audioContext.sampleRate, this.sampleRate)
      const pcm16 = floatTo16BitPCM(resampled)
      this.send({ type: 'input_audio_buffer.append', audio: arrayBufferToBase64(pcm16.buffer) })
    }

    // Deliberately not connected to audioContext.destination — we don't want
    // to play the user's own mic back to them.
    this.sourceNode.connect(this.workletNode)
  }

  playbackDone(responseId) {
    this.send({ type: 'client.playback_done', responseid: responseId })
  }

  sleep() {
    this.send({ type: 'client.sleep' })
    this.teardownAudio()
  }

  disconnect() {
    this.send({ type: 'client.disconnect' })
    this.teardownAudio()
    this.ws?.close()
    this.ws = null
    this.setState(CARMEN_STATE.IDLE)
  }

  teardownAudio() {
    this.workletNode?.disconnect()
    this.sourceNode?.disconnect()
    this.micStream?.getTracks().forEach((track) => track.stop())
    this.audioContext?.close()
    this.workletNode = null
    this.sourceNode = null
    this.micStream = null
    this.audioContext = null
  }

  send(payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }
}

function resampleLinear(float32, fromRate, toRate) {
  if (fromRate === toRate) return float32
  const ratio = fromRate / toRate
  const newLength = Math.round(float32.length / ratio)
  const result = new Float32Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio
    const i0 = Math.floor(srcIndex)
    const i1 = Math.min(i0 + 1, float32.length - 1)
    const frac = srcIndex - i0
    result[i] = float32[i0] * (1 - frac) + float32[i1] * frac
  }
  return result
}

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32[i]))
    out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }
  return out
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}
