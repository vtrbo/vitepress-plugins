/**
 * @vitest/utils
 * https://github.com/vitest-dev/vitest/blob/main/packages/utils/src/stringify.ts
 */
const pretty = require('pretty-format')

const {
  AsymmetricMatcher,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent,
} = pretty.plugins

const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher,
]

function stringify(object, maxDepth = 10, { maxLength, ...options } = {}) {
  const MAX_LENGTH = maxLength ?? 10000
  let result

  try {
    result = pretty.format(object, {
      maxDepth,
      escapeString: false,
      plugins: PLUGINS,
      ...options,
    })
  }
  catch {
    result = pretty.format(object, {
      callToJSON: false,
      maxDepth,
      escapeString: false,
      plugins: PLUGINS,
      ...options,
    })
  }

  return (result.length >= MAX_LENGTH && maxDepth > 1)
    ? stringify(object, Math.floor(maxDepth / 2))
    : result
}

module.exports = stringify
