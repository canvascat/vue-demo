<template>
  <canvas width="1600"
    height="800"
    @mousedown="mouseDownHandler"></canvas>
</template>

<script>
const MOSAIC_SIZE = 6 // 单个马赛克像素宽度的 1/2
const MOSAIC_COUNT = 4 // 马赛克笔触大小为 2 * MOSAIC_SIZE * MOSAIC_COUNT

export default {
  name: 'my-canavs',

  data () {
    return {
      mouseDown: false,
      originalImgData: null,
      points: [],
      ops: []
    }
  },

  props: [],

  components: {},

  computed: {
    ctx () {
      return this.$el.getContext('2d')
    }
  },

  created () {
    const img = new Image()
    img.src = require('@/assets/bz1.jpg')
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      this.$el.width = naturalWidth
      this.$el.height = naturalHeight
      this.ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight)
      this.originalImgData = this.ctx.getImageData(0, 0, naturalWidth, naturalHeight)
      console.log(this.originalImgData)
    }
  },
  mounted () {
    window.returnLastStep = this.returnLastStep
  },

  methods: {
    mouseDownHandler (e) {
      e.stopImmediatePropagation()
      document.onselectstart = () => false
      this.mouseDown = [
        e.pageX - this.$el.offsetLeft,
        e.pageY - this.$el.offsetTop
      ]
      this.points = []
      document.addEventListener('mousemove', this.documentMouseMoveHandle)
      document.addEventListener('mouseup', this.documentMouseUpHandle)
    },
    documentMouseMoveHandle (e) {
      if (this.mouseDown === false) return
      e.stopImmediatePropagation()
      const [x, y] = [
        e.pageX - this.$el.offsetLeft,
        e.pageY - this.$el.offsetTop
      ]
      this.dealMosaicXY(x, y)
    },
    documentMouseUpHandle () {
      this.mouseDown = false
      document.removeEventListener('mousemove', this.documentMouseMoveHandle)
      document.removeEventListener('mouseup', this.documentMouseUpHandle)
      document.onselectstart = null
      this.ops.push({
        action: 'mosaic',
        attribute: {
          size: MOSAIC_SIZE,
          num: MOSAIC_COUNT
        },
        path: this.points
      })
      this.points = []
      console.log(this.ops)
    },
    dealMosaicXY (x0, y0) {
      // 将坐标偏移到最近的网格上
      x0 = Math.round(x0 / MOSAIC_SIZE / 2) * MOSAIC_SIZE * 2
      y0 = Math.round(y0 / MOSAIC_SIZE / 2) * MOSAIC_SIZE * 2

      // 记录像素轨迹
      const lastXY = this.points.slice(-1)[0]
      if (lastXY && lastXY[0] === x0 && lastXY[1] === y0) return
      if (this.points.findIndex(xy => xy[0] === x0 && xy[1] === y0) !== -1) return
      this.points.push([x0, y0])
      this.drawMosaic(x0, y0)
    },
    drawMosaic (x0, y0) {
      // canvas 宽高
      const { width, height } = this.$el
      // 源文件像素数据
      const originalPxData = this.originalImgData.data

      // 复制一份进行计算
      const modifyImgData = this.ctx.getImageData(0, 0, width, height)
      let modifyPxData = modifyImgData.data

      const [size, num] = [MOSAIC_SIZE, MOSAIC_COUNT] // 马赛克方格宽 2*MOSAIC_SIZE，数量为 MOSAIC_COUNT**2 个
      for (var x1 = x0 - size * num; x1 < x0 + size * num; x1 += 2 * size) {
        for (var y1 = y0 - size * num; y1 < y0 + size * num; y1 += 2 * size) {
          // (x1, y1) 为每个像素点的基准坐标
          // 计算出已 (x1, y1) 为基准坐标的马赛克块内的平均 RGB 值
          let [sumR, sumG, sumB] = [0, 0, 0]
          let pixelIndexList = []
          for (let x = x1, xlen = x1 + 2 * size; x < xlen; x++) {
            for (let y = y1, ylen = y1 + 2 * size; y < ylen; y++) {
              // 圆形边界判断条件，可以让笔触边缘为圆角
              // if ((y - y0) ** 2 + (x - x0) ** 2 > (size * num) ** 2) {
              //   continue
              // }
              const pixelIndex = (y * width + x) * 4
              pixelIndexList.push(pixelIndex)
              sumR += originalPxData[pixelIndex]
              sumG += originalPxData[pixelIndex + 1]
              sumB += originalPxData[pixelIndex + 2]
            }
          }
          const pixelTotlal = pixelIndexList.length
          const [avgR, avgG, avgB] = [sumR / pixelTotlal, sumG / pixelTotlal, sumB / pixelTotlal]

          for (let x = 0; x < pixelIndexList.length; x++) {
            const pixelIndex = pixelIndexList[x]
            modifyPxData[pixelIndex] = avgR
            modifyPxData[pixelIndex + 1] = avgG
            modifyPxData[pixelIndex + 2] = avgB
          }
        }
      }
      this.ctx.putImageData(modifyImgData, 0, 0, 0, 0, width, height)
    },
    returnLastStep () {
      if (this.ops.length === 0) return
      this.ops.pop()
      const { width, height } = this.$el
      this.ctx.putImageData(this.originalImgData, 0, 0, 0, 0, width, height)
      for (let i = 0, len = this.ops.length; i < len; i++) {
        const op = this.ops[i]
        for (let j = 0, l = op.path.length; j < l; j++) {
          this.drawMosaic(...op.path[j])
        }
      }
    }
  }
}

</script>

<style lang="stylus" scoped></style>
