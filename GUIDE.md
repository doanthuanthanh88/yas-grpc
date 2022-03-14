# Document
*Describe all of elements in tool. (meaning, how to use...)*
| Element | Description |  
|---|---|  
| GRPC | --- |
|[yas-grpc~call](#yas-grpc~call)| Make a gGPC call to another|  
|[yas-grpc~serve](#yas-grpc~serve)| Create a gRPC server to mock data|  
|[yas-grpc~doc](#yas-grpc~doc)| Document all of yas-grpc~call which got "props.doc" is true|  
  
  
# Details
## yas-grpc~call <a name="yas-grpc~call"></a>
Make a gGPC call to another  
```yaml
- yas-grpc~call
    title: Get list users which filter by name
    description: Test on dev environment        
    channelOptions:                                 # gRPC Client options
    doc: true                                       # Document it

    proto: ./proto/server.proto'                    # File proto

    protoOptions:                                   # Protobuf options

    package: user                                   
    service: UserService                            
    method: GetUsers                                
    address: 0.0.0.0:5000                           # gRPC Server which send a call to
    metadata: {                                     # Request metadata
      service: "A"
    }
    request: {                                      # Request input data
      "name": "thanh"
    }
    timeout: 1s                                     # Request timeout
    validate:                                       # Validate response (Same Api)
      - title: Response is valid
        chai: \${expect(_.response.code).to.equal(1)}
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


## yas-grpc~serve <a name="yas-grpc~serve"></a>
Create a gRPC server to mock data  
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


## yas-grpc~doc <a name="yas-grpc~doc"></a>
Document all of yas-grpc~call which got "props.doc" is true  

```yaml
- yas-grpc~doc:
    title: Post service
    description: Demo CRUD API to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ./grpc_document_details.md

```


  