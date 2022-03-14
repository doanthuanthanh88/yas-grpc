import { FileDataSource } from "yaml-scene/src/utils/data-source/file/FileDataSource"
import { TimeUtils } from "yaml-scene/src/utils/time"
import { merge } from "lodash"
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { Exporter } from "./Exporter"
import { Client } from "@app/Client"

/**
 * yas-grpc~doc
 * @description Document all of yas-grpc~call which got "props.doc" is true
 * @group gRPC
 * @example
- yas-grpc~doc:
    title: Post service
    description: Demo CRUD API to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ./grpc_document_details.md

 */
export class DocMD {
  proxy: ElementProxy<DocMD>
  calls: Client[]

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
    this.proxy.scenario.events
      .on('gRPC-call.done', (isPassed: boolean, call: Client) => {
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
    const exporter = new Exporter(new FileDataSource(this.outFile), this)
    exporter.export(this.calls.sort((a, b) => a.title > b.title ? 1 : -1))
    this.proxy.logger.info(`Document is generated at ${this.outFile}`)
  }

}
