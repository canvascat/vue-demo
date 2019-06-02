<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div class="center-wrapper">
      <button class="ripple"
        ref="ripple">
        Click me!
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  created () {
    // 注册属性
    console.log(
      '%c this is colored',
      'background:#aaa;color:#bada55',
      'this is not colored'
    )
    this.$nextTick(this.init)
  },
  methods: {
    init () {
      const button = this.$refs.ripple
      // window.performance.now() 返回一个时间戳,以毫秒为单位,精确到千分之一毫秒.
      let start = performance.now()
      button.addEventListener('click', evt => {
        // 添加class
        button.classList.add('animating')
        // 获取点击坐标
        const [x, y] = [evt.clientX, evt.clientY]
        start = performance.now()

        // window.requestAnimationFrame() 方法告诉浏览器您希望执行动画并请求浏览器在下一次重绘之前调用指定的函数来更新动画。
        // callback 下一次重绘之前更新动画帧所调用的函数(即上面所说的回调函数)。
        // 该回调函数会被传入DOMHighResTimeStamp参数，该参数与performance.now()的返回值相同，它表示requestAnimationFrame() 开始去执行回调函数的时刻。
        requestAnimationFrame(function raf (now) {
          console.log(now)
          const count = Math.floor(now - start)
          button.style.cssText = `--ripple-x: ${x}; --ripple-y: ${y}; --animation-tick: ${count};`
          // 大于1000时消失并停止动画
          if (count > 1000) {
            button.classList.remove('animating')
            button.style.cssText = `--animation-tick: 0`
            return
          }
          requestAnimationFrame(raf)
        })
      })
    }
  }
}
</script>

<style lang="stylus">
.center-wrapper
  width 1200px
  margin 0 auto

.ripple
  width 300px
  height 300px
  border-radius 150px
  font-size 5em
  padding 0.5em 1em
  font-size 2em
  background-color rgb(255, 64, 129)
  border 0
  box-shadow 0 1px 1.5px 0 rgba(0, 0, 0, 0.12), 0 1px 1px 0 rgba(0, 0, 0, 0.24)
  color white
  --ripple-x 0
  --ripple-y 0
  --ripple-color rgba(255, 255, 255, 0.54)
  --animation-tick 0

.ripple:focus
  outline none

.ripple.animating
  background-image paint(ripple)
</style>
