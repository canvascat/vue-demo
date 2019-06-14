# vue-demo

```bash
# Project setup
yarn install
# Compiles and hot-reloads for development
yarn run serve
# Compiles and minifies for production
yarn run build
# Run your tests
yarn run test
# Lints and fixes files
yarn run lint
```

一个多页面开发的 vuedemo，用来保存 vscode 配置，还有一些 demo

基于 canvas 的图片 mosaic demo [http://localhost:8080/canvas](http://localhost:8080/canvas)

`pageX, pageY` 基于文档的边缘(考虑任何页面的水平方向上的滚动)
`clientX, clientY` / `x, y` 基于应用客户端区域的坐标 (与页面坐标不同，不考虑页面是否有水平滚动)
`layerX, layerY`
`offsetX, offsetY` 事件对象与目标节点的内填充边（padding edge）的偏移量。
`screenX, screenY` 鼠标相对于屏幕坐标系的偏移量
