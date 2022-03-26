# yas-grpc
Support grpc call, grpc document and grpc mock server

> It's an extension for `yaml-scene`  

## Features:
- Create testcases to test gRPC
- Make gRPC call to others
- Create a mock gRPC server
  - Serve static gRPC response data 
  - Build handler for yourself by code
- Generate gRPC document

## Details document
> [Wiki Pages](https://github.com/doanthuanthanh88/yas-grpc/wiki)

## Prerequisite
- Platform [`yaml-scene`](https://www.npmjs.com/package/yaml-scene)


## Installation

```sh
  yas add yas-grpc        # npm install -g yas-grpc OR yard global add yas-grpc
```

## Example
[Examples scenario files](./scenes/test)

## gRPC call
Make a gGPC call to another

```yaml
- yas-grpc/Call:
    proto: ./proto/server.proto
    package: user
    service: UserService
    method: GetUsers
    address: 0.0.0.0:5000
    request: {
      "name": "thanh"
    }
```

## gRPC Server
Create a gRPC server to mock data

### Serve static gRPC response data 
```yaml
- yas-grpc/Server:
    address: 0.0.0.0:5000
    packages:
      user:
        proto: ./proto/server.proto
        services:
          UserService:
            GetUsers: {
              code: 1,
              data: [{name: 'thanh', age: 1}]
            }
```

### Build handler for yourself by code
```yaml
- yas-grpc/Server:
    address: 0.0.0.0:5000
    packages:
      user:
        proto: ./proto/server.proto
        services:
          UserService:
            GetCustomers: !function |
              const merge = require('lodash.merge')
              return merge({
                name: request.name
              }, {
                age: 10
              })
```

## gRPC Document
Document all of yas-grpc/Call which got property `doc` is `true` or `{ tags: [] }`

```yaml
- yas-grpc/Doc/MD:
    title: User gRPC Service
    description: Demo CRUD gRPC to generate to markdown document
    signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
    outFile: ${join(__dirname, 'grpc_document_details.md')}
```

## gRPC calls summary
Collect information of gRPC calls

```yaml
yas-grpc/Summary:
  title: Testing result
```