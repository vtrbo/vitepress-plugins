/**
 * 处理异常消息
 * @param message 异常消息
 */
export const throwError = (message: string): void => {
  throw new Error(`[vitepress-plugin-runcode]: ${message}`)
}

/**
 * UBB 转 HTML
 * @param code ubb 代码
 * @returns html 代码
 */
export const ubbToHtml = (code: string): string => {
  code = code.replace(/<br[^>]*>/gi, '\n')
  code = code.replace(/<p[^>\/]*\/>/gi, '\n')
  code = code.replace(/\son[\w]{3,16}\s?=\s*([\'\"]).+?\1/gi, '')
  code = code.replace(/<hr[^>]*>/gi, '[hr]')
  code = code.replace(/<(sub|sup|u|strike|b|i|pre)>/gi, '[$.id1]')
  code = code.replace(/<\/(sub|sup|u|strike|b|i|pre)>/gi, '[/$.id1]')
  code = code.replace(/<(\/)?strong>/gi, '[$.id1b]')
  code = code.replace(/<(\/)?em>/gi, '[$.id1i]')
  code = code.replace(/<(\/)?blockquote([^>]*)>/gi, '[$.id1blockquote]')
  code = code.replace(/&amp;/gi, '&')
  code = code.replace(/&lt;/gi, '<')
  code = code.replace(/&gt;/gi, '>')
  code = code.replace(/&quot;/gi, '"')
  code = code.replace(/&nbsp;/gi, ' ')
  return code
}

/**
 * 移除 HTML 标签
 * @param code 代码
 * @param isUbb 是否 UBB
 * @returns 移除后的代码
 */
export const removeHtmlTag = (code: string, isUbb?: boolean): string => {
  if (isUbb)
    code = ubbToHtml(code)
  return code.replace(/<\/?[^>]*>/g, '')
}

export const parseVue = (code: string) => {
  const vueEls: {
    content: string
    attrs: string
  }[] = []

  let content = ''
  let attrs = ''

  let getReg = /<template[^>]*>([\s\S]*?)<\/template>/gi
  const teContent = getReg.exec(code)
  if (teContent) {
    content = teContent[1]

    getReg = /<template ([\S\s\t]*?)>/gi
    const teAttrs = getReg.exec(teContent[0])
    if (teAttrs)
      attrs = teAttrs[1]
  }
  vueEls.push({
    content,
    attrs,
  })

  content = ''
  attrs = ''

  getReg = /<script[^>]*>([\s\S]*?)<\/script>/gi
  const jsContent = getReg.exec(code)
  if (jsContent) {
    content = jsContent[1]

    getReg = /<script ([\S\s\t]*?)>/gi
    const jsAttrs = getReg.exec(jsContent[0])

    if (jsAttrs)
      attrs = jsAttrs[1]
  }
  vueEls.push({
    content,
    attrs,
  })

  content = ''
  attrs = ''

  getReg = /<style[^>]*>([\s\S]*?)<\/style>/gi
  const stContent = getReg.exec(code)
  if (stContent) {
    content = stContent[1]

    getReg = /<style ([\S\s\t]*?)>/gi
    const stAttrs = getReg.exec(stContent[0])
    if (stAttrs)
      attrs = stAttrs[1]
  }
  vueEls.push({
    content,
    attrs,
  })

  return vueEls
}

// export const parseComponent = (code: string) => {
//   try {
//     const [te, js, st] = parseVue(code)
//   }
//   catch (e) {

//   }
// }
