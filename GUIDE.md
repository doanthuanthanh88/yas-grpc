# Document
*Describe all of elements in tool. (meaning, how to use...)*
| Element | Description |  
|---|---|  
| GRPC | --- |
|[yas-grpc/Call](#yas-grpc/Call)| Make a gGPC call to another ...|  
|[yas-grpc/Server](#yas-grpc/Server)| Create a gRPC server to mock data ...|  
|[yas-grpc/Doc/MD](#yas-grpc/Doc/MD)| Document all of yas-grpc/Call which got "props.doc" is true ...|  
  
  
# Details
## yas-grpc/Call <a name="yas-grpc/Call"></a>
Make a gGPC call to another  
```yaml
- yas-grpc/Call
    title: Get list users which filter by name
    description: Test on dev environment        
    channelOptions:                                 # gRPC Call options
    doc: true                                       # Document it. Reference to "yas-grpc/Doc/MD"

    proto: ./proto/server.proto                     # File proto

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


## yas-grpc/Server <a name="yas-grpc/Server"></a>
Create a gRPC server to mock data  
```yaml
- yas-grpc/Server
    title: Server to serve list users
    description: Test on dev environment        
    channelOptions:                                 # gRPC Server options

    address: 0.0.0.0:5000                           # gRPC Server which send a call to

    packages:                                       # Declare packages in proto file
      user:                                         # Package name
        proto: ./proto/server.proto                 # File proto

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


## yas-grpc/Doc/MD <a name="yas-grpc/Doc/MD"></a>
Document all of yas-grpc/Call which got "props.doc" is true  

```yaml
- yas-grpc/Doc/MD:
    title: Post service
    description: Demo CRUD API to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ./grpc_document_details.md

```


  