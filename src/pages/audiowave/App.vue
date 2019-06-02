<template>
  <div id="app">
    <audio-player :src="require('@/assets/胡一天叫起床.mp3')"></audio-player>
  </div>
</template>

<script>
import AudioPlayer from '@/components/AudioPlayer'

export default {
  components: {
    [AudioPlayer.name]: AudioPlayer
  },
  data () {
    return {}
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
</style>
