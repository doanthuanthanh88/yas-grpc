import { ChannelOptions, loadPackageDefinition, Server as GRPCServer, ServerCredentials } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import chalk from "chalk"
import { merge } from "lodash"
import { ElementFactory } from 'yaml-scene/src/elements/ElementFactory'
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { IElement } from "yaml-scene/src/elements/IElement"
import { TimeUtils } from "yaml-scene/src/utils/time"

/**
 * yas-grpc~serve
 * @description Create a gRPC server to mock data
 * @order 2
 * @group gRPC
 * @exampleType custom
 * @example
```yaml
- yas-grpc~serve
    title: Server to serve list users
    description: Test on dev environment        
    channelOptions:                                 # gRPC Server options

    address: 0.0.0.0:5000                           # gRPC Server which send a call to

    packages:                                       # Declare packages in proto file
      user:                                         # Package name
        proto: ./proto/server.proto'                # File proto

        protoOptions:                               # Protobuf options

        services:                                   # List service in package
          UserService:
            GetUsers: {                             # Method in service. (Object or Function return data)
              code: 1,
              data: [{name: 'thanh', age: 1}]
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
export class Server implements IElement {
  proxy: ElementProxy<Server>

  title: string
  description: string

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

  time: number

  #server: GRPCServer

  init(props: any) {
    merge(this, props)
    if (!this.packages) this.packages = {}
  }

  prepare() {
    this.title = this.proxy.getVar(this.title)
    this.description = this.proxy.getVar(this.description)
    this.address = this.proxy.getVar(this.address)
    this.timeout = this.proxy.getVar(this.timeout)
    if (this.timeout) {
      this.timeout = TimeUtils.GetMsTime(this.timeout)
    }
    this.#server = new GRPCServer(this.channelOptions)
    for (const packageName in this.packages) {
      const packageConfig = this.packages[packageName]
      // Suggested options for similarity to existing grpc.load behavior
      packageConfig.proto = this.proxy.resolvePath(packageConfig.proto)
      if (packageConfig.protoOptions?.includeDirs) {
        packageConfig.protoOptions.includeDirs = packageConfig.protoOptions.includeDirs.map(e => this.proxy.resolvePath(e))
      }
      const packageDefinition = loadSync(
        packageConfig.proto,
        merge({
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }, packageConfig.protoOptions || {})
      )
      const protoDescriptor = loadPackageDefinition(packageDefinition);
      const pack = protoDescriptor[packageName];
      this.proxy.logger.info(chalk.green('gRPC endpoints:'))
      console.group()
      for (const serviceName in packageConfig.services) {
        const service = packageConfig.services[serviceName]
        this.#server.addService(pack[serviceName].service, Object.keys(service).reduce((sum: any, funcName: string) => {
          this.proxy.logger.info(chalk.green(`- /${packageName}/${serviceName}.${funcName}(?)`))
          sum[funcName] = async (ctx: any) => {
            let data = service[funcName]
            if (typeof data === 'function') {
              data = await data(ctx, this)
            }
            const metadata = ctx.metadata
            const request = ctx.request
            const rs = this.proxy.getVar(data, { $metadata: metadata, $request: request })
            ctx.call.sendUnaryMessage(null, rs)
          }
          return sum
        }, {}))
      }
      console.groupEnd()
    }
  }

  async exec() {
    if (this.title) {
      this.proxy.logger.info(chalk.green('%s'), this.title)
    }
    console.group()
    try {
      await this.start()
    } finally {
      this.stop()
      console.groupEnd()
    }
  }

  private start() {
    return new Promise((resolve, reject) => {
      this.proxy.logger.debug(chalk.green(`gRPC Server is listening at ${this.address}`))
      this.#server.bindAsync(`${this.address}`, ServerCredentials.createInsecure(), async (err: Error) => {
        if (err) reject(err)
        this.#server.start();
        const pause = ElementFactory.CreateElement('Pause', this.proxy.scenario)
        pause.init({
          title: `Enter to stop the gRPC service "${this.title || ''}" !`,
          time: this.timeout
        })
        pause.prepare()
        await pause.exec()
        resolve(undefined)
      })
    })
  }

  private stop() {
    if (this.#server) {
      this.#server.forceShutdown()
      this.#server = null
    }
  }

  dispose() {
    this.stop()
  }

}