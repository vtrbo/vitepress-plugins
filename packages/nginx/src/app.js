const express = require('express')
const parser = require('body-parser')
const tsExec = require('./execs/tsExec')

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
app.use(parser.json())
app.use(parser.urlencoded({ extended: false }))

// RunCode的接口转发
app.post('/vps/runcode', (_request, _response) => {
  const start = performance.now()

  const {
    lang,
    code,
  } = _request.body

  const runMap = {
    js: tsExec,
    ts: tsExec,
  }
  const result = runMap[lang](code)
  _response.send(result)

  const end = performance.now()
  // eslint-disable-next-line no-console
  console.log('[nginx] => RunCode 转发耗时：', `${end - start}ms`)
})

app.listen(9999, () => {
  // eslint-disable-next-line no-console
  console.log('[nginx] => 接口转发服务已启动')
})
