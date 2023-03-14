import ts from 'typescript'
import { stringify } from '../utils'
import type { Executor } from './types'

/**
 * 执行 js/ts 代码
 * @param code 代码
 * @returns 执行结果
 */
export function tsExecutor(code: string): Executor {
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
      // return 方式
      // eslint-disable-next-line no-new-func
      const returnOutput = new Function(compiledCode)()
      if (returnOutput) {
        return {
          status: 'success',
          output: stringify(returnOutput),
        }
      }

      // console 方式
      const reConsoleCode = `
const output = [];
const reConsole = console.log;
presetConsoleLog = function() {
  reConsole.apply(console, arguments);
  output.push(...arguments);
};

${compiledCode}  

return output;
`.replace('console.log(', 'presetConsoleLog(').trim()
      // eslint-disable-next-line no-new-func
      const consoleOutputs = new Function(reConsoleCode)()
      return {
        status: 'success',
        output: consoleOutputs.map((m: any) => stringify(m)).join('\n'),
      }
    }
    catch (error) {
      return {
        status: 'error',
        error: error as Error,
      }
    }
  }
  catch (error) {
    return {
      status: 'error',
      error: error as Error,
    }
  }
}
