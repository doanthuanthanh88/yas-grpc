import { merge } from "lodash";
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { IElement } from "yaml-scene/src/elements/IElement";

/**
 * yaml-scene-extension~Translator
 * @description Translate hello text to vietnamese
 * @example
- yaml-scene-extension~Translator:
    text: hello
    var: result
- Echo: ${result}
 */
export class Translator implements IElement {
  // Element proxy which provide some functions to handle context
  proxy: ElementProxy<any>

  text: string
  lang: 'en' | 'vi'
  result: string

  // Save result to
  var: any

  // Init props in yaml into this element
  init(props: any) {
    merge(this, props)
  }

  // Prehandle data before execute
  prepare() {
    // Replace variable to value if it's declared in the input text
    this.text = this.proxy.getVar(this.text)
    if (!this.lang) this.lang = 'vi'
  }

  exec() {
    // Translate here
    this.result = this.translate(this.text, this.lang)
    if (this.var) {
      this.proxy.setVar(this.var, this, 'result')
    }
  }

  private translate(txt, lang) {
    switch (txt) {
      case 'hello':
      case 'xin chào':
        return lang === 'vi' ? 'Xin chào' : 'Hello'
    }
    throw new Error('We not supported this text yet')
  }

  dispose() {
    // Release resources here
  }
}
