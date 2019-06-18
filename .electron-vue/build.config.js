const path = require('path')

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */
module.exports = {
  name: 'PTN',
  arch: ['x64','ia32'],
  asar: true,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../build/icons/icon'),
  ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,
  out: path.join(__dirname, '../build'),
  overwrite: true,
  win32metadata:{
    CompanyName:'PTN_Company',
    FileDescription:'PTN', // 文件说明
    OriginalFilename: 'PTN', // 原始文件名
    ProductName: 'PTN', // 产品名称
    InternalName: 'PTN', // 内部名称
  },
  platform: process.env.BUILD_TARGET || 'all'
}
