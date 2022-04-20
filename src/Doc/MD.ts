import Call from "@app/Call"
import chalk from "chalk"
import merge from "lodash.merge"
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { FileWriter } from "yaml-scene/src/elements/File/writer/FileWriter"
import { IElement } from "yaml-scene/src/elements/IElement"
import { Scenario } from "yaml-scene/src/singleton/Scenario"
import { TraceError } from "yaml-scene/src/utils/error/TraceError"
import { TimeUtils } from "yaml-scene/src/utils/TimeUtils"
import { Exporter } from "./Exporter"

/*****
 * @name yas-grpc/Doc/MD
 * @description Document all of yas-grpc/Call which got property "doc" is true or { tags: [] }
 * @group gRPC
 * @example
- yas-grpc/Doc/MD:
    title: Post service
    description: Demo CRUD gRPC to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ./grpc_document_details.md
    prefixHashLink:                        # Default is `user-content-` for github
 */
export default class MD {
  proxy: ElementProxy<this>
  $$: IElement
  $: this

  private _calls: Call[]

  title: string
  description: string
  signature: string
  prefixHashLink: string

  outFile: string

  constructor() {
    this._calls = []
  }

  init(props: any) {
    merge(this, props)
    Scenario.Instance.events
      .on('gRPC-call.done', (isPassed: boolean, call: Call) => {
        if (isPassed && !!call.doc) {
          this._calls.push(call)
        }
      })
  }

  async prepare() {
    await this.proxy.applyVars(this, 'title', 'description', 'signature', 'outFile')
    if (!this.outFile) throw new TraceError(`"outFile"  is required`, { outFile: this.outFile })
    this.outFile = this.proxy.resolvePath(this.outFile)
    if (!this.prefixHashLink) this.prefixHashLink = 'user-content-'
  }

  async exec() {
    await TimeUtils.Delay('1s')
    const exporter = new Exporter(new FileWriter(this.outFile), this)
    await exporter.export(this._calls.sort((a, b) => a.title > b.title ? 1 : -1))
    this.proxy.logger.info(chalk.green(`API Document is saved to "${this.outFile}"`))
  }

}
