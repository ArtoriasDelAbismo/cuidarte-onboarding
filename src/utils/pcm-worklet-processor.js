// Runs on the audio rendering thread. Buffers incoming mic samples and hands
// them to the main thread in ~2048-sample chunks (avoids posting a message
// every 128-sample render quantum, which would be excessive overhead).
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = []
    this.bufferedLength = 0
    this.chunkSize = 2048
  }

  process(inputs) {
    const channel = inputs[0]?.[0]
    if (channel && channel.length) {
      this.buffer.push(channel.slice())
      this.bufferedLength += channel.length

      if (this.bufferedLength >= this.chunkSize) {
        const merged = new Float32Array(this.bufferedLength)
        let offset = 0
        for (const part of this.buffer) {
          merged.set(part, offset)
          offset += part.length
        }
        this.port.postMessage(merged, [merged.buffer])
        this.buffer = []
        this.bufferedLength = 0
      }
    }
    return true
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor)
