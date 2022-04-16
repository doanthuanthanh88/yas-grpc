import { ChannelOptions, loadPackageDefinition, Server as GRPCServer, ServerCredentials } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import chalk from "chalk"
import merge from "lodash.merge"
import { ElementFactory } from 'yaml-scene/src/elements/ElementFactory'
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { IElement } from "yaml-scene/src/elements/IElement"
import Pause from "yaml-scene/src/elements/Pause"
import { Functional } from 'yaml-scene/src/tags/model/Functional'
import { TimeUtils } from "yaml-scene/src/utils/TimeUtils"
import { ProtoManager } from './utils/ProtoManager'

/*****
 * @name yas-grpc/Server
 * @description Create a gRPC server to mock data
 * @order 2
 * @group gRPC
 * @exampleType custom
 * @example
```yaml
- yas-grpc/Server
    title: Server to serve list users
    description: Test on dev environment        
    channelOptions:                                 # gRPC Server options

    address: 0.0.0.0:5000                           # gRPC Server which send a call to

    packages:                                       # Declare packages in proto file
      user:                                         # Package name
        proto: ./proto/server.proto                 # Proto is a local file
        proto: https://raw.../proto/server.proto    # Proto is a link

        protoOptions:                               # Protobuf options

        services:                                   # List service in package
          UserService:
            GetUsers: {                             # Method in service. (Object or Function return data)
              code: 1,
              data: [{name: 'thanh', age: 1}]
            }
            GetCustomers: !function |               # Handle code which handle request and response data
              () {                                  # Load global variables into function. [More](https://github.com/doanthuanthanh88/yaml-scene/wiki#user-content-!tags-!function)
                // this.request: Request input
                // this.metadata: Request metadata
                // this.ctx: gRPC context
                
                const merge = require('lodash.merge')
                return merge({
                  name: this.request.name
                }, {
                  age: 10
                })
              }
    timeout: 10s                                    # Server will shutdown after the time
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
 */
export default class Server implements IElement {
  proxy: ElementProxy<this>
  $$: IElement
  $: this

  title: string
  timeout?: number
  channelOptions?: Partial<ChannelOptions>
  address?: string
  packages: {
    [name: string]: {
      proto: string
      protoOptions?: any
      services: {
        [serviceName: string]: {
          /** FunctionName: Output */
          [functionName: string]: any
        }
      }
    }
  }

  private _server?: GRPCServer

  init(props: any) {
    merge(this, props)
  }

  async prepare() {
    await this.proxy.applyVars(this, 'title', 'address', 'timeout', 'packages', 'channelOptions')
    if (this.timeout) {
      this.timeout = TimeUtils.GetMsTime(this.timeout)
    }
    if (!this.packages) this.packages = {}
    this._server = new GRPCServer(this.channelOptions)
    for (const packageName in this.packages) {
      const packageConfig = this.packages[packageName]
      packageConfig.proto = await ProtoManager.Instance.getProtoPath(this.proxy.resolvePath(packageConfig.proto))
      packageConfig.protoOptions?.includeDirs?.forEach((e, i) => packageConfig.protoOptions.includeDirs[i] = this.proxy.resolvePath(e))
      const opts = merge({
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }, packageConfig.protoOptions || {})
      const packageDefinition = loadSync(
        packageConfig.proto,
        opts
      )
      const protoDescriptor = loadPackageDefinition(packageDefinition);
      const pack = protoDescriptor[packageName];
      this.proxy.logger.info(chalk.green('gRPC endpoints:'))
      console.group()
      for (const serviceName in packageConfig.services) {
        const service = packageConfig.services[serviceName]
        this._server.addService(pack[serviceName].service, Object.keys(service).reduce((sum: any, funcName: string) => {
          this.proxy.logger.info(chalk.green(`✓ /${packageName}/${serviceName}.${funcName}(?)`))
          let handler: any
          let data = service[funcName]
          if (typeof data === 'function') {
            // Fix response data
            const _handler = data as Function
            handler = async (ctx: any) => {
              const rs = await this.proxy.call(_handler, undefined, { ctx, metadata: ctx.metadata, request: ctx.request })
              return ctx.call.sendUnaryMessage(null, rs)
            }
          } else if (data instanceof Functional) {
            // Manual handler response data
            const _handler = data.getFunctionFromBody()
            handler = async (ctx: any) => {
              const rs = await this.proxy.call(_handler, undefined, { ctx, metadata: ctx.metadata, request: ctx.request })
              return ctx.call.sendUnaryMessage(null, rs)
            }
          } else {
            handler = async (ctx: any) => {
              const rs = await this.proxy.getVar(data, { ctx, metadata: ctx.metadata, request: ctx.request })
              return ctx.call.sendUnaryMessage(null, rs)
            }
          }
          sum[funcName] = handler
          return sum
        }, {}))
      }
      console.groupEnd()
    }
  }

  async exec() {
    if (this.title) this.proxy.logger.info(this.title);
    this.title && console.group();
    try {
      await this.start()
    } finally {
      this.title && console.groupEnd();
    }
  }

  private start() {
    return new Promise((resolve, reject) => {
      this._server.bindAsync(`${this.address}`, ServerCredentials.createInsecure(), async (err: Error) => {
        if (err) return reject(err)
        this._server.start()
        const pause = ElementFactory.CreateTheElement<Pause>(Pause)
        pause.init({
          title: `Stop gRPC server at "${this.address}"`,
          time: this.timeout
        })
        await pause.prepare()
        await pause.exec()
        await pause.dispose()
        await this.stop()
        resolve(undefined)
      })
    })
  }

  private async stop() {
    this._server?.forceShutdown()
  }

  async dispose() {
    await this.stop()
  }

}