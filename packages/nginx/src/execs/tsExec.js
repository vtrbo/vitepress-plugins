const ts = require('typescript')
const stringify = require('../utils/stringify')

function tsExec(code) {
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
        output: consoleOutputs.map(m => stringify(m)).join('\n'),
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

module.exports = tsExec
