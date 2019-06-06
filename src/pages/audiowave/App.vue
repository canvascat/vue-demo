<template>
  <div id="app">
    <audio-player :src="require('@/assets/胡一天叫起床.mp3')"></audio-player>
    <div class="wrapper">
      <canvas ref="canvas1"></canvas>
      <canvas ref="canvas2"></canvas>
    </div>
    <i class="wave-box" />
    <hr>
    <div ref="wave"
      style="width: 400px;"></div>
  </div>
</template>

<script>
import AudioPlayer from '@/components/AudioPlayer'
import WaveSurfer from 'wavesurfer.js'

export default {
  components: {
    [AudioPlayer.name]: AudioPlayer
  },
  data () {
    return {
      wavesurfer: null
    }
  },
  created () {
    this.$nextTick(() => {
      const self = this
      this.wavesurfer = WaveSurfer.create({
        container: self.$refs.wave,
        barWidth: 5,
        barGap: 3
        // barHeight: 5,
        // cursorColor: '#44bdf2', // 光标的填充颜色表示播放头位置
        // cursorWidth: 0,
        // waveColor: '#6ed7fd', // 光标后波形的填充颜色,
        // progressColor: '#32bcfb' // 光标后面波形部分的填充颜色。
      })
      // console.log(audioUrl)
      this.wavesurfer.load(require('@/assets/胡一天叫起床.mp3'))
      this.wavesurfer.on('ready', () => {
        let peaks = this.wavesurfer.backend.getPeaks(50)
        // peaks = [].map.call(peaks, val => Math.round(val * 1000) / 10)
        console.log('1:', peaks)
        // const PCM = this.wavesurfer.exportPCM(50)
        // console.log(PCM)
        // this.draw(JSON.parse(PCM), this.$refs.canvas1, '#c0c4cc')
        // this.draw(JSON.parse(PCM), this.$refs.canvas2, '#035ed8')
      })
    })
  },
  methods: {
    draw (data, el, color) {
      const canvas = el
      const { width, height } = canvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      if (!data) return
      let offsetX = 2
      const offsetXStep = 4
      ctx.lineWidth = 2
      ctx.strokeStyle = color
      // ctx.lineCap = 'round'
      ctx.beginPath()
      for (let i = 0, l = data.length; i < l; i += 2) {
        const offsetYStep = ~~((data[i] - data[i + 1]) * height / 2)
        const offsetY = (height - offsetYStep) / 2
        ctx.moveTo(offsetX, offsetY)
        ctx.lineTo(offsetX, offsetY + offsetYStep)
        offsetX += offsetXStep
      }
      ctx.stroke()
    }
  }
}
</script>

<style lang="stylus">
@import url('//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css')

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

wave
  position relative

  &::after
    content ''
    display block
    width 100%
    height 1px
    background-color #000
    position absolute
    left 0
    top 50%

.wrapper
  height 34px
  width 250px
  position relative
  background-color #eaecef

  canvas
    position absolute
    width 100%
    height 100%
    top 0
    left 0
</style>
