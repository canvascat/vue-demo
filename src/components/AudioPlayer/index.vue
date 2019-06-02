<template>
  <div
    class="wrapper"
    :class="{active: playState}"
  >
    <audio
      ref="audio"
      :src="src"
    ></audio>
    <button @click="toggle()">
      <i :class="`fa fa-${!playState ? 'play':'pause'}`"></i>
    </button>
    <div
      class="progress-bar-wrapper"
      ref="progressBar"
      @mousedown="clickProgressBar"
    >
      <div class="progress-bar bg">
        <div
          class="box"
          v-for="(h, i) in bgArr"
          :key="i"
          :style="{height: h + 'px'}"
        ></div>
      </div>
      <div
        class="progress-bar progress"
        :style="{
          width: progressValue + '%',
          transitionDuration: transitionTime + 's',
          transitionProperty: transitionTime ? 'width': 'height'
        }"
      >
        <div
          class="box"
          v-for="(h, i) in bgArr"
          :key="i"
          :style="{height: h + 'px'}"
        ></div>
        <div class="silder"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',

  data () {
    return {
      playState: false,
      bgArr: [],
      progressValue: 0,
      cursorDown: false,
      duration: 0,
      transitionTime: 0
    }
  },

  props: {
    src: {
      type: String,
      default: ''
    }
  },

  components: {},

  computed: {},

  created () {
    this.$nextTick(() => {
      const audio = this.$refs.audio
      audio.addEventListener('loadeddata', this.audioLoaded)
      audio.addEventListener('timeupdate', this.audioTimeUpdate)
      audio.addEventListener('ended', this.audioEndedHandler)
      audio.addEventListener('play', this.audioPlayHandler)
      const progressBar = this.$refs.progressBar
      const { width, height } = progressBar.getBoundingClientRect()
      const count = ~~(width / 5)
      // Todo peaks分析
      progressBar.style.marginLeft = (width - count * 5) + 'px'
      const ret = []
      for (let i = 0; i < count; i++) {
        ret.push(Math.ceil(Math.random() * (height - 8) / 2) * 2)
      }
      this.bgArr = ret
    })
  },
  destoryed () {
    const audio = this.$refs.audio
    audio.removeEventListener('loadeddata', this.audioLoaded)
    audio.removeEventListener('timeupdate', this.audioTimeUpdate)
    audio.removeEventListener('ended', this.audioEndedHandler)
  },

  methods: {
    audioPlayHandler (e) {
      this.playState = true
      setTimeout(() => {
        this.transitionTime = 0.27
      }, 0)
    },
    audioEndedHandler (e) {
      this.playState = false
      this.transitionTime = 0
    },
    audioTimeUpdate (e) {
      if (this.cursorDown === true) return
      const el = e.target
      this.progressValue = el.currentTime / el.duration * 100
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
      // console.log({ x, width, pageX }, this.progressValue)
    },
    mouseUpDocumentHandler (e) {
      const audio = this.$refs.audio
      audio.currentTime = audio.duration * this.progressValue / 100
      document.onselectstart = null
      this.cursorDown = false
      this.transitionTime = 0.27
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
      const audio = this.$refs.audio
      this.playState = state
      state ? audio.play() : audio.pause()
    }
  }
}

</script>

<style scoped>
.wrapper {
  height: 34px;
  min-width: 100px;
  max-width: 300px;
  display: flex;
  background-color: #eaecef;
  border-radius: 17px;
  border-top-left-radius: 0;
  align-items: center;
  box-sizing: border-box;
  position: relative;
}
.wrapper.active::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ff495f;
  position: absolute;
  top: -3px;
  right: -3px;
}
button {
  background-color: #035ed8;
  height: 26px;
  width: 26px;
  color: #fff;
  border: 0;
  border-radius: 13px;
  text-align: center;
  outline: 0;
  margin: 4px;
  margin-right: 5px;
}
.progress-bar-wrapper {
  flex: auto;
  height: 100%;
  margin-right: 14px;
  position: relative;
}
.progress-bar {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  color: #035ed8;
  pointer-events: none;
}
.progress-bar.bg {
  color: #c0c4cc;
}
.progress-bar.progress {
  overflow: hidden;
  transition-property: width;
  transition-timing-function: linear;
}
audio {
  display: none;
}
.box {
  width: 3px;
  margin-left: 2px;
  background-color: currentColor;
  flex: none;
  border-radius: 2px;
}
.silder {
  position: absolute;
  width: 1px;
  /* opacity: 0.6; */
  height: 34px;
  top: 0;
  right: 0;
  background: linear-gradient(
    rgba(3, 94, 216, 0.3),
    rgba(3, 94, 216, 1) 30%,
    rgba(3, 94, 216, 1) 70%,
    rgba(3, 94, 216, 0.3)
  );
}
</style>
