// Client for Carmen's voice WebSocket bridge — a custom wrapper around
// OpenAI's Realtime API. Protocol per the backend dev (2026-09-16) and
// confirmed end-to-end against live traffic the same day:
//   client.hello -> bridge.ready -> input_audio_buffer.append (streaming)
//   client.playback_done -> bridge.playback_ack
//   client.sleep -> bridge.sleep_ack (socket stays open)
//   client.disconnect closes the socket
// Turn detection is fully server-side (OpenAI Realtime VAD) — the client
// never sends input_audio_buffer.commit or response.create, just streams
// continuously. The bridge forwards OpenAI's own Realtime event names
// unchanged on both directions (not bridge.* equivalents):
//   input_audio_buffer.speech_started / speech_stopped
//   response.output_audio.delta / response.output_audio.done / response.done
// response.created never actually fires — response_id only ever appears as
// a field on the delta/done messages themselves. Any message that still
// doesn't match is logged via console.warn.

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
// Until then, set VITE_CARMEN_USER_ID to a real user_id the backend dev gives
// you (e.g. in .env.local, or as a Netlify env var) — otherwise this falls
// back to a random UUID that the backend almost certainly won't recognize.
export function getOrCreateUserId() {
  if (import.meta.env.VITE_CARMEN_USER_ID) {
    return import.meta.env.VITE_CARMEN_USER_ID
  }

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
    console.log('[carmen] state ->', next)
    this.state = next
    this.onState(next)
  }

  async start() {
    if (this.ws) return
    console.log('[carmen] start() — user_id =', this.userId)
    this.setState(CARMEN_STATE.CONNECTING)
    this.isReady = false

    // Request mic permission immediately on the user gesture, in parallel
    // with the WebSocket handshake, instead of waiting for bridge.ready —
    // that way a stalled/rejected handshake doesn't also hide whether mic
    // access itself is the problem. Captured frames are dropped (see the
    // worklet onmessage below) until isReady flips true.
    try {
      await this.setupAudioCapture()
      console.log('[carmen] mic access granted, capture pipeline ready')
    } catch (err) {
      console.error('[carmen] mic/audio setup failed', err)
      this.onError(err)
      this.setState(CARMEN_STATE.ERROR)
      return
    }

    console.log('[carmen] opening socket ->', SOCKET_URL)
    this.ws = new WebSocket(SOCKET_URL)
    this.ws.binaryType = 'arraybuffer'
    this.ws.addEventListener('open', () => {
      console.log('[carmen] socket open — sending client.hello')
      this.send({ type: 'client.hello', user_id: this.userId, token: this.token })
      this.helloTimeout = setTimeout(() => {
        console.error('[carmen] bridge.ready timeout after 8s — check user_id/token')
        this.onError(new Error('Carmen no respondió al saludo inicial (bridge.ready) a tiempo — revisar user_id/token'))
        this.setState(CARMEN_STATE.ERROR)
        this.ws?.close()
      }, 8000)
    })
    this.ws.addEventListener('message', (event) => this.handleMessage(event))
    this.ws.addEventListener('close', (event) => {
      console.log('[carmen] socket closed', { code: event.code, reason: event.reason })
      clearTimeout(this.helloTimeout)
      this.teardownAudio()
      this.ws = null
      this.setState(CARMEN_STATE.IDLE)
    })
    this.ws.addEventListener('error', (event) => {
      console.error('[carmen] socket error', event)
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
        console.log('[carmen] bridge.ready — audio_format:', msg.audio_format)
        clearTimeout(this.helloTimeout)
        this.sampleRate = msg.audio_format?.sample_rate || DEFAULT_SAMPLE_RATE
        this.isReady = true
        this.setState(CARMEN_STATE.LISTENING)
        break
      case 'bridge.sleep_ack':
        console.log('[carmen] bridge.sleep_ack')
        this.setState(CARMEN_STATE.SLEEPING)
        break
      case 'bridge.playback_ack':
        console.log('[carmen] bridge.playback_ack')
        this.setState(CARMEN_STATE.LISTENING)
        break
      case 'input_audio_buffer.speech_started':
        console.log('[carmen] speech_started')
        break
      case 'input_audio_buffer.speech_stopped':
        console.log('[carmen] speech_stopped')
        break
      // Confirmed from live traffic (2026-09-16): response.created never
      // fires — response_id only ever appears as a field on the delta/done
      // messages themselves, captured lazily in handleAudioDelta below.
      case 'response.output_audio.delta':
        this.handleAudioDelta(msg)
        break
      case 'response.output_audio.done':
        console.log('[carmen] response.output_audio.done')
        break
      case 'response.done':
        console.log('[carmen] response.done')
        this.finalizeResponseAudio()
        break
      // Transcripts — not surfaced in the UI yet, just silenced so they
      // don't spam the "unhandled" warning below.
      case 'conversation.item.input_audio_transcription.delta':
      case 'conversation.item.input_audio_transcription.completed':
      case 'response.output_audio_transcript.delta':
      case 'response.output_audio_transcript.done':
        break
      default:
        console.warn('[carmen] unhandled message type', msg.type, msg)
        break
    }

    this.onServerMessage(msg)
  }

  async setupAudioCapture() {
    // Explicit mono constraint: multi-element "array" mics (common on Windows
    // laptops, e.g. "Microphone Array (Realtek)") expose raw beamforming
    // channels that can read as near-silent individually — letting the
    // browser downmix to one channel itself (rather than us reading raw
    // channel 0 in the worklet) avoids landing on a dead/cancelled channel.
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })
    const [track] = this.micStream.getAudioTracks()
    console.log('[carmen] mic track:', track?.label, track?.getSettings?.())

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    await this.audioContext.audioWorklet.addModule(
      new URL('./pcm-worklet-processor.js', import.meta.url),
    )

    this.sourceNode = this.audioContext.createMediaStreamSource(this.micStream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-capture-processor', {
      channelCount: 1,
      channelCountMode: 'explicit',
      channelInterpretation: 'discrete',
    })

    let loggedFirstChunk = false
    let lastLevelLogAt = 0
    this.workletNode.port.onmessage = (event) => {
      // Drop frames captured before bridge.ready — nothing to send them to yet.
      if (!this.isReady) return
      const resampled = resampleLinear(event.data, this.audioContext.sampleRate, this.sampleRate)
      const pcm16 = floatTo16BitPCM(resampled)
      this.send({ type: 'input_audio_buffer.append', audio: arrayBufferToBase64(pcm16.buffer) })
      if (!loggedFirstChunk) {
        loggedFirstChunk = true
        console.log('[carmen] streaming input_audio_buffer.append (further chunks not logged individually)')
      }
      // Throttled live level meter — proves whether real signal (not
      // silence) is actually being captured, independent of anything the
      // server does with it.
      const now = performance.now()
      if (now - lastLevelLogAt > 1000) {
        lastLevelLogAt = now
        let sumSquares = 0
        for (let i = 0; i < event.data.length; i++) sumSquares += event.data[i] * event.data[i]
        const rms = Math.sqrt(sumSquares / event.data.length)
        console.log('[carmen] mic level (rms, 0=silence):', rms.toFixed(4))
      }
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

    // response.created never fires (confirmed from live traffic) — capture
    // the id off the delta itself instead.
    if (msg.response_id) this.currentResponseId = msg.response_id
    this.responseAudioDone = false

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
    if (responseId) {
      console.log('[carmen] playback finished, sending client.playback_done for', responseId)
      this.playbackDone(responseId)
    } else {
      console.warn('[carmen] playback finished but no response_id was ever captured — client.playback_done not sent')
    }
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
