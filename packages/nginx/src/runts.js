const fs = require('fs')
const cp = require('child_process')

const sourcePath = 'temp'

/**
 * 创建文件夹
 * @param {string} path 文件夹路径
 */
function mkdirSync(path) {
  const pathArr = path.split('/')
  let jointPath = ''
  pathArr.forEach((dir) => {
    jointPath += `${dir}/`
    if (!fs.existsSync(jointPath))
      fs.mkdirSync(jointPath)
  })
}

/**
 * 运行 js 或 ts
 * @param {string} fileName 文件名称
 * @param {string} code 运行代码
 * @returns {Promise} 运行结果
 */
const runTs = (fileName, code) => {
  return new Promise((resolve) => {
    mkdirSync(sourcePath)
    const jointSource = `${sourcePath}/${fileName}.ts`
    fs.writeFile(jointSource, code, {}, () => {
      cp.exec(`ts-node ${jointSource}`, (_err, output, error) => {
        if (_err) {
          return resolve({
            status: 'error',
            error: _err,
          })
        }

        if (error) {
          return resolve({
            status: 'error',
            error,
          })
        }

        fs.unlinkSync(jointSource)

        return resolve({
          status: 'success',
          output: output.trim(),
        })
      })
    })
  })
}

module.exports = {
  runTs,
}
