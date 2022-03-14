import { VarManager } from "yaml-scene/src/singleton/VarManager"
import { Simulator } from "yaml-scene/src/Simulator"

describe('Unit test extension', () => {

  beforeAll(async () => {
    await Simulator.Run(`
extensions:
  - ${require.resolve('../src/Translator')}
steps:
  - Translator:
      text: hello
      lang: vi
      var: 
        trans: \${_}
        translatedText: \${_.result}
`)
  })

  test('Check value via object reference', () => {
    const trans = VarManager.Instance.vars.trans
    // Check object here
    expect(trans.result).toBe('Xin chào')
  })

  test('Check value via environment variables', () => {
    expect(VarManager.Instance.vars.translatedText).toBe('Xin chào')
  })

})
