const express = require('express')
const bp = require('body-parser')
const uuid = require('uuid')
const runts = require('./runts')

const app = express()

// 设置解决跨域
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'content-type')
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')

  if (req.method.toLowerCase() === 'options')
    res.sendStatus(200)
  else
    next()
})

// 解析POST请求的BODY
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))

// RunCode的接口转发
app.post('/vitepress-plugins/runcode', async (_request, _response) => {
  const start = performance.now()

  const filename = uuid.v4()
  const lang = _request.body.languageCode
  const code = _request.body.executoryCode

  const runMap = {
    1001: runts.runTs,
  }
  const result = await runMap[lang](filename, code)
  _response.send(result)

  const end = performance.now()
  // eslint-disable-next-line no-console
  console.log('[nginx] => RunCode 转发耗时：', `${end - start}ms`)
})

app.listen(9999, () => {
  // eslint-disable-next-line no-console
  console.log('[nginx] => 接口转发服务已启动')
})
