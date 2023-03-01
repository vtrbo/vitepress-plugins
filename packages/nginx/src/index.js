const express = require('express')
const rp = require('request-promise')
const bp = require('body-parser')

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
app.post('/vitepress-plugins/runcode', async (req, res) => {
  const start = performance.now()
  const { url, form } = req.body

  const result = await rp({
    method: 'POST',
    uri: url,
    body: form,
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  res.send({
    error: result.errors.trim(),
    output: result.output.trim(),
  })
  const end = performance.now()
  // eslint-disable-next-line no-console
  console.log('[nginx] => RunCode 转发耗时：', `${end - start}ms`)
})

app.listen(80, () => {
  // eslint-disable-next-line no-console
  console.log('[nginx] => 接口转发服务已启动')
})
