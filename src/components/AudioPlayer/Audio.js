import axios from 'axios'
import WebAudio from '../wavesurfer/webaudio'

export default class Aduio extends WebAudio {
  constructor(url) {
    this.init(url)
  }

  init(url) {
    this.loadBuffer(url, peaks, duration)
  }
  /**
   * Loads audio using Web Audio buffer backend.
   *
   * @private
   * @param {string} url
   */
  loadBuffer(url) {
    return this.getArrayBuffer(url, data => this.loadArrayBuffer(data))
  }
  /**
   * Load an array buffer by ajax and pass to a callback
   *
   * @param {string} url
   * @param {function} callback
   * @private
   */
  getArrayBuffer(url, callback) {
    this.currentAjax = axios({
      url,
      responseType: 'arraybuffer',
      onDownloadProgress(e) {
        console.log(e)
      }
    })
      .then(res => {
        callback(res.data)
        this.currentAjax = null
      })
      .catch(e => {
        // this.fireEvent('error', 'XHR error: ' + e.target.statusText)
        this.currentAjax = null
      })

    return this.currentAjax
  }

  onProgress() {}

  /**
   * Decode buffer and load
   *
   * @private
   * @param {ArrayBuffer} arraybuffer
   */
  loadArrayBuffer(arraybuffer) {
    this.decodeArrayBuffer(arraybuffer, data => {
      if (!this.isDestroyed) {
        this.load(data)
      }
    })
  }
}

class Peaks {
  constructor(buffer) {
    this.buffer = buffer
    this.init()
  }
  init() {
    this.splitPeaks = []
    this.mergedPeaks = null
    this.splitChannels = false
    this.peaks = null
  }
  setLength(length) {
    // No resize, we can preserve the cached peaks.
    if (this.mergedPeaks && length == 2 * this.mergedPeaks.length - 1 + 2) {
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
  getPeaks(length, first, last) {
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

        if (c == 0 || max > this.mergedPeaks[2 * i]) {
          this.mergedPeaks[2 * i] = max
        }

        if (c == 0 || min < this.mergedPeaks[2 * i + 1]) {
          this.mergedPeaks[2 * i + 1] = min
        }
      }
    }

    return this.splitChannels ? this.splitPeaks : this.mergedPeaks
  }
}
