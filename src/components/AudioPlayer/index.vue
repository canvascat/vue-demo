<template>
  <div class="audio-wave-wrapper"
    :class="{active: playState}">
    <audio ref="audio"
      :src="src"></audio>
    <button @click="toggle()">
      <i :class="`fa fa-${!playState ? 'play':'pause'}`"></i>
    </button>
    <div class="progress-bar-wrapper"
      ref="progressBar"
      @mousedown="clickProgressBar">
      <div class="progress-bar bg">
        <div class="wave-line"
          v-for="(h, i) in waveArray"
          :key="i"
          :style="{
            width: waveWidth + 'px',
            marginLeft: waveGap + 'px',
            height: h + 'px'
          }"></div>
      </div>
      <div class="progress-bar progress"
        :style="{
          width: progressValue + '%',
          transitionDuration: transitionTime
        }">
        <div class="wave-line"
          :style="{
            width: waveWidth + 'px',
            marginLeft: waveGap + 'px',
            height: h + 'px'
          }"
          v-for="(h, i) in waveArray"
          :key="i"></div>
        <div class="silder"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Audio, UnitBezier } from './util'

const DEFAULT_TRANSITION_TIME = '0.27s'

export default {
  name: 'AudioPlayer',

  data () {
    return {
      playState: false,
      waveArray: [],
      progressValue: 0,
      cursorDown: false,
      duration: 0,
      transitionTime: 0,
      playOver: false,
      bezier: null
    }
  },

  props: {
    src: {
      type: String,
      default: ''
    },
    waveGap: {
      type: Number,
      default: 2
    },
    waveWidth: {
      type: Number,
      default: 2
    }
  },

  components: {},

  computed: {},

  created () {
    this.bezier = new UnitBezier(0.455, 0.03, 0.515, 0.955)
    this.$nextTick(() => {
      const audio = this.$refs.audio
      audio.addEventListener('loadeddata', this.audioLoaded)
      audio.addEventListener('timeupdate', this.audioTimeUpdate)
      audio.addEventListener('ended', this.audioEndedHandler)
      audio.addEventListener('play', this.audioPlayHandler)
      const progressBar = this.$refs.progressBar
      const { width, height } = progressBar.getBoundingClientRect()
      const offsetXStep = this.waveGap + this.waveGap
      const count = ~~(width / offsetXStep)
      progressBar.style.marginLeft = (width - count * offsetXStep) + 'px'
      new Audio(this.src).getPeaks(count).then(data => {
        const ret = []
        for (let i = 0; i < count; i++) {
          ret.push(Math.ceil((data[2 * i] - data[2 * i + 1]) * height / 4) * 2)
        }
        this.waveArray = ret
      })
    })
  },
  destoryed () {
    const audio = this.$refs.audio
    audio.removeEventListener('loadeddata', this.audioLoaded)
    audio.removeEventListener('timeupdate', this.audioTimeUpdate)
    audio.removeEventListener('ended', this.audioEndedHandler)
  },

  methods: {
    drawWave ({ PCM, el, color }) {
      const { width, height } = el
      const ctx = el.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      let offsetX = 2
      const offsetXStep = 5
      ctx.lineWidth = 3
      ctx.strokeStyle = color
      ctx.lineCap = 'round'
      ctx.beginPath()
      for (let i = 0, l = PCM.length; i < l; i += 2) {
        const offsetYStep = ~~((PCM[i] - PCM[i + 1]) * height / 2)
        const offsetY = (height - offsetYStep) / 2
        ctx.moveTo(offsetX, offsetY)
        ctx.lineTo(offsetX, offsetY + offsetYStep)
        offsetX += offsetXStep
      }
      ctx.stroke()
    },
    audioPlayHandler (e) {
      this.playState = true
      if (this.playOver) {
        this.progressValue = 0
      }
      setTimeout(() => { this.transitionTime = DEFAULT_TRANSITION_TIME })
    },
    audioEndedHandler (e) {
      this.playState = false
      this.transitionTime = 0
    },
    audioTimeUpdate (e) {
      if (this.cursorDown === true) return
      const el = e.target
      this.progressValue = el.currentTime / el.duration * 100
      this.playOver = this.progressValue >= 100
    },
    clickProgressBar (e) {
      this.startDrag(e)
      const { pageX } = e
      const progressBar = this.$refs.progressBar
      const { x, width } = progressBar.getBoundingClientRect()
      this.progressValue = (pageX - x) / width * 100
      this.transitionTime = 0
    },
    startDrag (e) {
      this.cursorDown = true
      e.stopImmediatePropagation()
      document.addEventListener('mousemove', this.mouseMoveDocumentHandler)
      document.addEventListener('mouseup', this.mouseUpDocumentHandler)
      document.onselectstart = () => false
    },
    mouseMoveDocumentHandler (e) {
      if (this.cursorDown === false) return
      const { pageX } = e
      const { x, width } = this.$refs.progressBar.getBoundingClientRect()
      this.progressValue = Math.min(Math.max(~~((pageX - x) / width * 100), 0), 100)
    },
    mouseUpDocumentHandler (e) {
      const audio = this.$refs.audio
      audio.currentTime = audio.duration * this.progressValue / 100
      document.onselectstart = null
      this.cursorDown = false
      this.transitionTime = DEFAULT_TRANSITION_TIME
      if (this.playState === false) {
        audio.play()
      }
      document.removeEventListener('mousemove', this.mouseMoveDocumentHandler)
      document.removeEventListener('mouseup', this.mouseUpDocumentHandler)
    },
    audioLoaded () {
      this.duration = this.$refs.audio.duration
    },
    toggle (state = !this.playState) {
      this.playState = state
      this.$refs.audio[(state) ? 'play' : 'pause']()
    }
  }
}

</script>

<style lang="stylus" scoped>
.audio-wave-wrapper
  height 34px
  min-width 100px
  max-width 300px
  display flex
  background-color #eaecef
  border-radius 17px
  border-top-left-radius 0
  align-items center
  box-sizing border-box
  position relative

  &.active::before
    content ''
    width 6px
    height 6px
    border-radius 50%
    background-color #ff495f
    position absolute
    top -3px
    right -3px

  audio
    display none

  button
    background-color #035ed8
    height 26px
    width 26px
    color #fff
    border 0
    border-radius 13px
    text-align center
    outline 0
    margin 4px
    margin-right 5px

  .progress-bar-wrapper
    flex auto
    height 100%
    margin-right 14px
    position relative

  .progress-bar
    position absolute
    width 100%
    height 100%
    display flex
    /* justify-content: center; */
    align-items center
    color #035ed8
    pointer-events none

    &.bg
      color #c0c4cc

    &.progress
      overflow hidden
      transition-property width
      transition-timing-function linear

    .wave-line
      background-color currentColor
      flex none

    .silder
      position absolute
      width 1px
      /* opacity: 0.6; */
      height 34px
      top 0
      right 0
      background linear-gradient(
        rgba(3, 94, 216, 0.3),
        rgba(3, 94, 216, 1) 30%,
        rgba(3, 94, 216, 1) 70%,
        rgba(3, 94, 216, 0.3)
      )
</style>
