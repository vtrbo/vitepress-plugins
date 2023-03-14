/**
 * 处理异常消息
 * @param message 异常消息
 */
export const throwError = (message: string) => {
  return new Error(`[vitepress:plugin:runcode]: ${message}`)
}
