import { TimeUtils } from "yaml-scene/src/utils/TimeUtils"
import merge from "lodash.merge"
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { Exporter } from "./Exporter"
import Call from "@app/Call"
import { File } from "yaml-scene/src/elements/File/adapter/File"
import { Scenario } from "yaml-scene/src/singleton/Scenario"

/**
 * @guide
 * @name yas-grpc/Doc/MD
 * @description Document all of yas-grpc/Call which got property "doc" is true or { tags: [] }
 * @group gRPC
 * @example
- yas-grpc/Doc/MD:
    title: Post service
    description: Demo CRUD gRPC to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ./grpc_document_details.md
 * @end
 */
export default class MD {
  proxy: ElementProxy<MD>
  calls: Call[]

  title: string
  description: string
  signature: string

  outFile: string

  constructor() {
    this.calls = new Array()
  }

  init(props: any) {
    if (!props.outFile) throw new Error(`"outFile" is required in ${this.constructor.name}`)
    merge(this, props)
    Scenario.Instance.events
      .on('gRPC-call.done', (isPassed: boolean, call: Call) => {
        if (isPassed && !!call.doc) {
          this.calls.push(call)
        }
      })
  }

  prepare() {
    this.outFile = this.proxy.resolvePath(this.outFile)
  }

  async exec() {
    await TimeUtils.Delay('1s')
    const exporter = new Exporter(new File(this.outFile), this)
    exporter.export(this.calls.sort((a, b) => a.title > b.title ? 1 : -1))
    this.proxy.logger.info(`Document is generated at ${this.outFile}`)
  }

}
