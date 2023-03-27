/**
 * 校验是否是 HTTPS
 */
export function isHttps(): boolean {
  const protocol = window.location.protocol
  if (protocol === 'https:') {
    return true
  }
  else if (protocol === 'http:') {
    return false
  }
  else {
    const baseUrl = window.location.origin
    return baseUrl.startsWith('https:')
  }
}
