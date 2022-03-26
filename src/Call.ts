import { credentials, loadPackageDefinition, Metadata, ChannelOptions } from '@grpc/grpc-js'
import { ServiceClient } from '@grpc/grpc-js/build/src/make-client'
import { loadSync, Options } from '@grpc/proto-loader'
import chalk from "chalk"
import merge from "lodash.merge"
import { ElementFactory } from "yaml-scene/src/elements/ElementFactory"
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { IElement } from "yaml-scene/src/elements/IElement"
import Validate from "yaml-scene/src/elements/Validate"
import { LogLevel } from "yaml-scene/src/utils/logger/LogLevel"
import { TimeUtils } from 'yaml-scene/src/utils/TimeUtils'

/**
 * @guide
 * @name yas-grpc/Call
 * @description Make a gGPC call to another
 * @order 1
 * @group gRPC
 * @exampleType custom
 * @example
```yaml
- yas-grpc/Call
    title: Get list users which filter by name
    description: Test on dev environment        
    channelOptions:                                   # gRPC Call options
    doc: true                                         # Document it. Reference to "yas-grpc/Doc/MD"
    doc: 
      tags: [USER]

    proto: ./proto/server.proto                       # File proto

    protoOptions:                                     # Protobuf options

    package: user                                   
    service: UserService                            
    method: GetUsers                                
    address: 0.0.0.0:5000                             # gRPC Server which send a call to
    metadata: {                                       # Request metadata
      service: "A"
    }
    request: {                                        # Request input data
      "name": "thanh"
    }
    timeout: 1s                                       # Request timeout
    validate:                                         # Validate response after request done. Reference to [Validate](https://github.com/doanthuanthanh88/yaml-scene/wiki#Validate)
      - title: Response is valid
        chai: \${expect($.response.code).to.equal(1)} # `$.response` is the result after make a gRPC call
```

<details>
  <summary>channelOptions</summary>

  - 'grpc.ssl_target_name_override'?: string;
  - 'grpc.primary_user_agent'?: string;
  - 'grpc.secondary_user_agent'?: string;
  - 'grpc.default_authority'?: string;
  - 'grpc.keepalive_time_ms'?: number;
  - 'grpc.keepalive_timeout_ms'?: number;
  - 'grpc.keepalive_permit_without_calls'?: number;
  - 'grpc.service_protoOptions'?: string;
  - 'grpc.max_concurrent_streams'?: number;
  - 'grpc.initial_reconnect_backoff_ms'?: number;
  - 'grpc.max_reconnect_backoff_ms'?: number;
  - 'grpc.use_local_subchannel_pool'?: number;
  - 'grpc.max_send_message_length'?: number;
  - 'grpc.max_receive_message_length'?: number;
  - 'grpc.enable_http_proxy'?: number;
  - 'grpc.http_connect_target'?: string;
  - 'grpc.http_connect_creds'?: string;
  - 'grpc.default_compression_algorithm'?: CompressionAlgorithms;
  - 'grpc.enable_channelz'?: number;
  - 'grpc-node.max_session_memory'?: number;
  - ...
</details>

<details>
  <summary>protoOptions</summary>

  - 'keepCase': true,
  - 'longs': String,
  - 'enums': String,
  - 'defaults': true,
  - 'oneofs': true
  - 'includeDirs': []
  - ...
</details>
 * @end
 */
export default class Call implements IElement {
  proxy: ElementProxy<Call>
  $$: IElement;
  $: this;
  logLevel: any

  title: string
  description: string

  channelOptions?: Partial<ChannelOptions>
  protoOptions?: Options
  proto: string
  doc: {
    tags: string[]
  }

  package: string
  service: string
  method: string

  address?: string
  metadata: any
  request: any
  response: any

  timeout?: number

  error: any
  time: number
  var: any
  validate: ElementProxy<Validate>[]

  #client: ServiceClient

  get uri() {
    return `/${this.package}/${this.service}.${this.method}`
  }

  init(props: any) {
    merge(this, {
      protoOptions: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    }, {
      ...props,
      validate: props.validate?.map(v => {
        const _v = ElementFactory.CreateElement<Validate>('Validate', this.proxy.scenario)
        _v.changeLogLevel(props.logLevel)
        _v.init(v)
        return _v
      })
    })
  }

  prepare() {
    this.title = this.proxy.getVar(this.title)
    this.description = this.proxy.getVar(this.description)
    this.address = this.proxy.getVar(this.address)
    this.timeout = this.proxy.getVar(this.timeout)
    this.package = this.proxy.getVar(this.package)
    this.service = this.proxy.getVar(this.service)
    this.method = this.proxy.getVar(this.method)
    this.proto = this.proxy.resolvePath(this.proto)
    this.protoOptions?.includeDirs?.forEach((e, i) => this.protoOptions.includeDirs[i] = this.proxy.resolvePath(e))
    if (this.timeout) {
      this.timeout = TimeUtils.GetMsTime(this.timeout)
    }
    this.validate?.forEach(v => {
      v.element['$'] = this.$
      v.element['$$'] = this.$$
    })
    if (!this.#client) {
      const packageDefinition = loadSync(
        this.proto,
        this.protoOptions
      )
      const protoDescriptor = loadPackageDefinition(packageDefinition);
      const pack = protoDescriptor[this.package];
      this.#client = new pack[this.service](`${this.address}`, credentials.createInsecure(), this.channelOptions);
    }
  }

  async exec() {
    try {
      this.proxy.logger.info(chalk.cyan.bold('‣', this.title), chalk.gray('-', `${this.uri}`))
      console.group()
      this.time = Date.now()
      this.response = await new Promise((resolve, reject) => {
        const opts = {} as any
        if (this.timeout) {
          opts.deadline = new Date(Date.now() + this.timeout)
        }
        if (this.metadata) {
          opts.credentials = credentials.createFromMetadataGenerator((_params, callback) => {
            const meta = new Metadata();
            for (let k in this.metadata) {
              meta.add(k, this.metadata[k]);
            }
            callback(null, meta);
          })
        }
        this.#client[this.method](this.request, opts, (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve(data)
        })
      })
      this.time = Date.now() - this.time
    } catch (err) {
      this.time = Date.now() - this.time
      this.error = err
    } finally {
      if (this.response) {
        this.proxy.logger.info('%s %s', chalk[this.error ? 'red' : 'green'](`${this.error ? 'ERROR' : 'OK'}`), chalk.gray(` (${this.time}ms)`))
        try {
          await this.validateCall()
          this.error = undefined
          this.applyToVar()
        } catch (err) {
          this.error = err
          this.proxy.changeLogLevel('debug')
        }
      }
      this.printLog()
      this.proxy.scenario.events.emit('gRPC-call.done', !this.error, this)
      if (this.error) throw this.error
      console.groupEnd()
    }
  }

  private printLog() {
    if (this.proxy.logger.getLevel() <= LogLevel.TRACE) {
      console.group()
      this.proxy.logger.debug('%s', chalk.red.bold('* Request * * * * * * * * * *'))
      console.group()
      this.proxy.logger.debug('%s: %s', chalk.magenta('* URI'), `/${this.package}/${this.service}.${this.method}`)

      const metadata = Object.keys(this.metadata)
      if (metadata.length) {
        this.proxy.logger.debug('%s: ', chalk.magenta('* Metadata'))
        console.group()
        metadata.forEach(k => this.proxy.logger.debug(`• %s: %s`, chalk.magenta(k), this.metadata[k]))
        console.groupEnd()
      }
      // Request
      if (this.request) {
        this.proxy.logger.debug('%s: ', chalk.magenta('* Request data'))
        this.proxy.logger.debug(this.request)
      }
      console.groupEnd()
      this.proxy.logger.debug('%s', chalk.red.bold('* Response * * * * * * * * * *'))
      console.group()
      if (this.response) {
        // Response data
        if (this.response) {
          this.proxy.logger.debug('%s: ', chalk.magenta('* Response data'))
          this.proxy.logger.debug(this.response)
        }
      }
      console.groupEnd()
      console.groupEnd()
    }
  }

  private async validateCall() {
    if (this.validate?.length) {
      for (const v of this.validate) {
        await v.prepare()
        await v.exec()
      }
    }
  }

  private applyToVar() {
    if (this.var && this.response) {
      this.proxy.setVar(this.var, { $: this.$ }, '$.response')
    }
  }

  dispose() {
    this.#client?.close()
    this.#client = null
  }

}