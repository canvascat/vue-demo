<template>
  <div class="canvas-wrapper">
    <ul class="canvas-control">
      <li>
        <span>MOSAIC_SIZE:</span>
        <el-slider v-model="mosaicSize"
          :min="4"
          :max="10">
        </el-slider>
      </li>
      <li>
        <span>笔刷宽度:</span>
        <el-slider v-model="brushWidth"
          :min="20"
          :step="10"
          :max="100">
        </el-slider>
      </li>
    </ul>
    <canvas ref="canvas"
      width="1600"
      height="800"
      @mousedown="mouseDownHandler"></canvas>
  </div>
</template>

<script>
export default {
  name: 'my-canavs',

  data () {
    return {
      mouseDown: false,
      originalImgData: null,
      points: [],
      ops: [],
      mosaicSize: 3,
      mosaicCount: 4,
      brushWidth: 40 // 笔刷宽度
    }
  },

  props: [],

  components: {},

  computed: {
    ctx () {
      return this.canvas.getContext('2d')
    },
    canvas () {
      return this.$refs.canvas
    }
  },

  created () {
    const img = new Image()
    img.src = require('@/assets/bz1.jpg')
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      this.canvas.width = naturalWidth
      this.canvas.height = naturalHeight
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
        e.pageX - this.canvas.offsetLeft,
        e.pageY - this.canvas.offsetTop
      ]
      this.points = []
      document.addEventListener('mousemove', this.documentMouseMoveHandle)
      document.addEventListener('mouseup', this.documentMouseUpHandle)
    },
    documentMouseMoveHandle (e) {
      if (this.mouseDown === false) return
      e.stopImmediatePropagation()
      const [x, y] = [
        e.pageX - this.canvas.offsetLeft,
        e.pageY - this.canvas.offsetTop
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
          size: this.mosaicSize,
          num: this.mosaicCount,
          brushWidth: this.brushWidth
        },
        path: this.points
      })
      this.points = []
      console.log(this.ops)
    },
    dealMosaicXY (x0, y0) {
      const offSet = this.brushWidth - ~~(this.brushWidth / this.mosaicSize / 2) * this.mosaicSize * 2

      // 将坐标偏移到最近的网格上
      x0 = Math.round((x0 - offSet) / this.mosaicSize / 2) * this.mosaicSize * 2
      y0 = Math.round((y0 - offSet) / this.mosaicSize / 2) * this.mosaicSize * 2

      // 记录像素轨迹
      const lastXY = this.points.slice(-1)[0]
      if (lastXY && lastXY[0] === x0 && lastXY[1] === y0) return
      if (this.points.findIndex(xy => xy[0] === x0 && xy[1] === y0) !== -1) return
      this.points.push([x0, y0])
      this.drawMosaic(x0, y0)
    },
    // 马赛克方格宽 2*MOSAIC_SIZE
    drawMosaic (x0, y0, size = this.mosaicSize, brushWidth = this.brushWidth) {
      const num = ~~(brushWidth / size / 2)
      const offSet = brushWidth - num * size * 2
      // canvas 宽高
      const { width, height } = this.canvas
      // 源文件像素数据
      const originalPxData = this.originalImgData.data

      // 复制一份进行计算
      const modifyImgData = this.ctx.getImageData(0, 0, width, height)
      let modifyPxData = modifyImgData.data

      for (var x1 = x0 - size * num, maxX1 = x0 + size * num + offSet; x1 < maxX1; x1 += 2 * size) {
        for (var y1 = y0 - size * num, maxY1 = y0 + size * num + offSet; y1 < maxY1; y1 += 2 * size) {
          // (x1, y1) 为每个像素点的基准坐标
          // 计算出已 (x1, y1) 为基准坐标的马赛克块内的平均 RGB 值
          let [sumR, sumG, sumB] = [0, 0, 0]
          let pixelIndexList = []
          for (let x = x1, maxX = x1 + 2 * size; x < maxX; x++) {
            for (let y = y1, maxY = y1 + 2 * size; y < maxY; y++) {
              const pixelIndex = (y * width + x) * 4
              // 圆形边界判断条件，可以让笔触边缘为圆角，之后只给圆内的像素点调整颜色
              if ((y - y0 + offSet / 2) ** 2 + (x - x0 + offSet / 2) ** 2 <= (brushWidth / 2) ** 2) {
                pixelIndexList.push(pixelIndex)
              }
              sumR += originalPxData[pixelIndex]
              sumG += originalPxData[pixelIndex + 1]
              sumB += originalPxData[pixelIndex + 2]
            }
          }
          const pixelTotlal = (2 * size) ** 2 // pixelIndexList.length // 单个马赛克的像素点数量
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
      const { width, height } = this.canvas
      this.ctx.putImageData(this.originalImgData, 0, 0, 0, 0, width, height)
      for (let i = 0, len = this.ops.length; i < len; i++) {
        const op = this.ops[i]
        const { size, brushWidth } = op
        for (let j = 0, l = op.path.length; j < l; j++) {
          this._drawMosaic(...op.path[j], size, brushWidth)
        }
      }
    }
  }
}

</script>

<style lang="stylus">
.canvas-control
  width 600px

  li
    display flex
    align-items center

    span
      width 200px

    .el-slider
      flex auto
</style>
