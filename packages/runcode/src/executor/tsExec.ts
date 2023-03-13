import ts from 'typescript'
import { stringify } from '../stringify'

/**
 * 执行 js/ts 代码
 * @param code 代码
 * @returns 执行结果
 */
export function tsExecutor(code: string) {
  try {
    const transpileOutput = ts.transpileModule(
      code,
      {
        compilerOptions: {
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.None,
        },
      },
    )
    const compiledCode = transpileOutput.outputText

    try {
      // eslint-disable-next-line no-new-func
      const output = new Function(compiledCode)()
      return {
        status: 'success',
        output: stringify(output),
      }
    }
    catch (error) {
      return {
        status: 'error',
        error,
      }
    }
  }
  catch (error) {
    return {
      status: 'error',
      error,
    }
  }
}
