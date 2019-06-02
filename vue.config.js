const path = require('path')
const glob = require('glob')

const pagesDefaultConfig = {
  // page 的入口
  entry: 'src/index/main.js',
  // 模板来源
  template: 'public/index.html',
  // 在 dist/index.html 的输出
  filename: 'index.html',
  // 当使用 title 选项时，
  // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
  title: 'Index Page',
  // 在这个页面中包含的块，默认情况下会包含
  // 提取出来的通用 chunk 和 vendor chunk。
  chunks: ['chunk-vendors', 'chunk-common', 'index']
}

// 获取入口js和模板html

const pages = (globPath => {
  const entries = {}
  glob.sync(globPath).map(entry => {
    const basename = path.basename(entry, path.extname(entry))
    entries[basename] = {
      ...pagesDefaultConfig,
      entry: path.join(entry, './main.js'),
      filename: basename + '.html',
      title: basename,
      chunks: ['chunk-vendors', 'chunk-common', basename]
    }
  })
  return entries
})('src/pages/**?')

module.exports = {
  pages
}
