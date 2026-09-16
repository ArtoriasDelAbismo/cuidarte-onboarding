// Client for Carmen's voice WebSocket bridge — a custom wrapper around
// OpenAI's Realtime API. Protocol per the backend dev (2026-09-16):
//   client.hello -> bridge.ready -> input_audio_buffer.append (streaming)
//   client.playback_done -> bridge.playback_ack
//   client.sleep -> bridge.sleep_ack (socket stays open)
//   client.disconnect closes the socket
// Turn detection is fully server-side (OpenAI Realtime VAD) — the client
// never sends input_audio_buffer.commit or response.create, just streams
// continuously. The server confirmed it forwards OpenAI's own event names
// on the input side unchanged (input_audio_buffer.append/speech_started/
// speech_stopped rather than inventing bridge.* equivalents), so the
// response-audio handling below assumes OpenAI's standard Realtime event
// names too (response.created / response.audio.delta / response.audio.done)
// — UNCONFIRMED for the output side specifically. Any message that doesn't
// match is still logged via console.warn so this can be corrected quickly
// against real traffic if the naming differs.

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

    // Playback scheduling state for Carmen's response audio.
    this.nextPlaybackTime = 0
    this.pendingPlaybackSources = 0
    this.responseAudioDone = false
    this.currentResponseId = null

    this.isReady = false
    this.helloTimeout = null
  }

  setState(next) {
    this.state = next
    this.onState(next)
  }

  async start() {
    if (this.ws) return
    this.setState(CARMEN_STATE.CONNECTING)
    this.isReady = false

    // Request mic permission immediately on the user gesture, in parallel
    // with the WebSocket handshake, instead of waiting for bridge.ready —
    // that way a stalled/rejected handshake doesn't also hide whether mic
    // access itself is the problem. Captured frames are dropped (see the
    // worklet onmessage below) until isReady flips true.
    try {
      await this.setupAudioCapture()
    } catch (err) {
      this.onError(err)
      this.setState(CARMEN_STATE.ERROR)
      return
    }

    this.ws = new WebSocket(SOCKET_URL)
    this.ws.binaryType = 'arraybuffer'
    this.ws.addEventListener('open', () => {
      this.send({ type: 'client.hello', user_id: this.userId, token: this.token })
      this.helloTimeout = setTimeout(() => {
        this.onError(new Error('Carmen no respondió al saludo inicial (bridge.ready) a tiempo — revisar user_id/token'))
        this.setState(CARMEN_STATE.ERROR)
        this.ws?.close()
      }, 8000)
    })
    this.ws.addEventListener('message', (event) => this.handleMessage(event))
    this.ws.addEventListener('close', () => {
      clearTimeout(this.helloTimeout)
      this.teardownAudio()
      this.ws = null
      this.setState(CARMEN_STATE.IDLE)
    })
    this.ws.addEventListener('error', (event) => {
      this.onError(event)
      this.setState(CARMEN_STATE.ERROR)
    })
  }

  handleMessage(event) {
    if (typeof event.data !== 'string') {
      // Binary frame (ArrayBuffer) — presumably Carmen's response audio, but
      // the shape/type for that isn't specified yet, so just log + forward it.
      console.warn('[carmen] binary frame received, byteLength =', event.data.byteLength)
      this.onServerMessage({ type: 'binary', data: event.data })
      return
    }

    let msg
    try {
      msg = JSON.parse(event.data)
    } catch {
      console.warn('[carmen] non-JSON text frame received', event.data)
      this.onServerMessage({ type: 'text', data: event.data })
      return
    }

    switch (msg.type) {
      case 'bridge.ready':
        clearTimeout(this.helloTimeout)
        this.sampleRate = msg.audio_format?.sample_rate || DEFAULT_SAMPLE_RATE
        this.isReady = true
        this.setState(CARMEN_STATE.LISTENING)
        break
      case 'bridge.sleep_ack':
        this.setState(CARMEN_STATE.SLEEPING)
        break
      case 'bridge.playback_ack':
        this.setState(CARMEN_STATE.LISTENING)
        break
      case 'input_audio_buffer.speech_started':
      case 'input_audio_buffer.speech_stopped':
        // Informational VAD events — no client action needed, server drives
        // the turn automatically. Kept as explicit no-ops so they don't spam
        // the "unhandled" warning below.
        break
      case 'response.created':
        this.currentResponseId = msg.response?.id || msg.response_id || null
        this.responseAudioDone = false
        break
      case 'response.audio.delta':
        this.handleAudioDelta(msg)
        break
      case 'response.audio.done':
      case 'response.done':
        this.finalizeResponseAudio()
        break
      default:
        console.warn('[carmen] unhandled message type', msg.type, msg)
        break
    }

    this.onServerMessage(msg)
  }

  async setupAudioCapture() {
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    await this.audioContext.audioWorklet.addModule(
      new URL('./pcm-worklet-processor.js', import.meta.url),
    )

    this.sourceNode = this.audioContext.createMediaStreamSource(this.micStream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-capture-processor')

    this.workletNode.port.onmessage = (event) => {
      // Drop frames captured before bridge.ready — nothing to send them to yet.
      if (!this.isReady) return
      const resampled = resampleLinear(event.data, this.audioContext.sampleRate, this.sampleRate)
      const pcm16 = floatTo16BitPCM(resampled)
      this.send({ type: 'input_audio_buffer.append', audio: arrayBufferToBase64(pcm16.buffer) })
    }

    // Deliberately not connected to audioContext.destination — we don't want
    // to play the user's own mic back to them.
    this.sourceNode.connect(this.workletNode)
  }

  // Schedules a base64 PCM16 chunk for gapless playback: AudioBuffer can hold
  // a different sampleRate than the AudioContext's own — the browser
  // resamples automatically on playback, so no manual resampling needed here
  // (unlike the mic-capture side, which isn't going through AudioBuffer).
  handleAudioDelta(msg) {
    const base64 = msg.delta || msg.audio
    if (!base64 || !this.audioContext) return

    this.setState(CARMEN_STATE.SPEAKING)

    const pcm16 = new Int16Array(base64ToArrayBuffer(base64))
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 0x8000

    const audioBuffer = this.audioContext.createBuffer(1, float32.length, this.sampleRate)
    audioBuffer.copyToChannel(float32, 0)

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)

    const startAt = Math.max(this.audioContext.currentTime, this.nextPlaybackTime)
    source.start(startAt)
    this.nextPlaybackTime = startAt + audioBuffer.duration

    this.pendingPlaybackSources++
    source.onended = () => {
      this.pendingPlaybackSources--
      if (this.pendingPlaybackSources === 0 && this.responseAudioDone) {
        this.finishPlayback()
      }
    }
  }

  finalizeResponseAudio() {
    this.responseAudioDone = true
    if (this.pendingPlaybackSources === 0) {
      this.finishPlayback()
    }
  }

  finishPlayback() {
    const responseId = this.currentResponseId
    this.currentResponseId = null
    this.responseAudioDone = false
    this.nextPlaybackTime = 0
    this.setState(CARMEN_STATE.LISTENING)
    if (responseId) this.playbackDone(responseId)
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
    clearTimeout(this.helloTimeout)
    this.isReady = false
    this.workletNode?.disconnect()
    this.sourceNode?.disconnect()
    this.micStream?.getTracks().forEach((track) => track.stop())
    this.audioContext?.close()
    this.workletNode = null
    this.sourceNode = null
    this.micStream = null
    this.audioContext = null

    this.nextPlaybackTime = 0
    this.pendingPlaybackSources = 0
    this.responseAudioDone = false
    this.currentResponseId = null
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

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
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
