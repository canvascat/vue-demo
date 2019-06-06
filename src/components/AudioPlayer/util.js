import axios from 'axios'

export class Audio {
  constructor (url, buffer) {
    this.buffer = buffer
    this.url = url
    this.init()
  }

  async getBuffer (url = this.url) {
    const audioCtx = new window.AudioContext()
    const { data: arrayBuffer } = await axios({
      url,
      responseType: 'arraybuffer'
    })
    const decodedData = await audioCtx.decodeAudioData(arrayBuffer)
    this.buffer = decodedData
    return decodedData
  }

  init () {
    this.splitPeaks = []
    this.mergedPeaks = null
    this.splitChannels = false
    this.peaks = null
    this.getBuffer(this.url)
  }
  setLength (length) {
    // No resize, we can preserve the cached peaks.
    if (this.mergedPeaks && length === 2 * this.mergedPeaks.length - 1 + 2) {
      return
    }

    this.splitPeaks = []
    this.mergedPeaks = []
    // Set the last element of the sparse array so the peak arrays are
    // appropriately sized for other calculations.
    const channels = this.buffer ? this.buffer.numberOfChannels : 1
    let c
    for (c = 0; c < channels; c++) {
      this.splitPeaks[c] = []
      this.splitPeaks[c][2 * (length - 1)] = 0
      this.splitPeaks[c][2 * (length - 1) + 1] = 0
    }
    this.mergedPeaks[2 * (length - 1)] = 0
    this.mergedPeaks[2 * (length - 1) + 1] = 0
  }
  _getPeaks (length, first, last) {
    if (this.peaks) {
      return this.peaks
    }
    if (!this.buffer) {
      return []
    }

    first = first || 0
    last = last || length - 1

    this.setLength(length)

    if (!this.buffer) {
      return this.splitChannels ? this.splitPeaks : this.mergedPeaks
    }

    /**
     * The following snippet fixes a buffering data issue on the Safari
     * browser which returned undefined It creates the missing buffer based
     * on 1 channel, 4096 samples and the sampleRate from the current
     * webaudio context 4096 samples seemed to be the best fit for rendering
     * will review this code once a stable version of Safari TP is out
     */
    // if (!this.buffer.length) {
    //   const newBuffer = this.createBuffer(1, 4096, this.sampleRate)
    //   this.buffer = newBuffer.buffer
    // }

    const sampleSize = this.buffer.length / length
    const sampleStep = ~~(sampleSize / 10) || 1
    const channels = this.buffer.numberOfChannels
    let c

    for (c = 0; c < channels; c++) {
      const peaks = this.splitPeaks[c]
      const chan = this.buffer.getChannelData(c)
      let i

      for (i = first; i <= last; i++) {
        const start = ~~(i * sampleSize)
        const end = ~~(start + sampleSize)
        let min = 0
        let max = 0
        let j

        for (j = start; j < end; j += sampleStep) {
          const value = chan[j]

          if (value > max) {
            max = value
          }

          if (value < min) {
            min = value
          }
        }

        peaks[2 * i] = max
        peaks[2 * i + 1] = min

        if (c === 0 || max > this.mergedPeaks[2 * i]) {
          this.mergedPeaks[2 * i] = max
        }

        if (c === 0 || min < this.mergedPeaks[2 * i + 1]) {
          this.mergedPeaks[2 * i + 1] = min
        }
      }
    }

    this.peaks = this.splitChannels ? this.splitPeaks : this.mergedPeaks
    return this.peaks
  }
  async getPeaks (length, first, last) {
    if (!this.buffer) await this.getBuffer()
    return this._getPeaks(length, first, last)
  }
}

export class UnitBezier {
  constructor (p1x, p1y, p2x, p2y) {
    this.cx = 3.0 * p1x
    this.bx = 3.0 * (p2x - p1x) - this.cx
    this.ax = 1.0 - this.cx - this.bx
    this.cy = 3.0 * p1y
    this.by = 3.0 * (p2y - p1y) - this.cy
    this.ay = 1.0 - this.cy - this.by
  }
  // sampleCurveX
  getXY (t) {
    return {
      x: ((this.ax * t + this.bx) * t + this.cx) * t,
      y: ((this.ay * t + this.by) * t + this.cy) * t
    }
  }
}
