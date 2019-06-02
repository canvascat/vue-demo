<template>
  <div></div>
</template>

<script>
import axios from "axios"
import WebAudio from '../wavesurfer/webaudio'

export default {
  name: 'WaveBg',

  data () {
    return {
      backend: null
    }
  },

  props: {
    src: {
      type: String,
      default: ''
    }
  },

  components: {},

  computed: {
  },
  created () {
    this.backend = new WebAudio({})
    this.load(this.src)
  },
  mounted () { },

  methods: {
    load (url) {
      axios({
        url,
        responseType: 'arraybuffer',
        onDownloadProgress (e) {
          // console.log(e)
        }
      }).then(res => {
        this.loadArrayBuffer(res.data)
      }).catch(e => {
        console.warn(e)
      })
    },
    loadArrayBuffer (arraybuffer) {
      this.backend.decodeArrayBuffer(arraybuffer, this.backend.load)
    }
  }
}

</script>

<style scoped>
</style>
