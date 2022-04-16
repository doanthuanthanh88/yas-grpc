import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"

describe('Test gRPC call', () => {

  test('.proto is a file local', async () => {
    await Simulator.Run(`
extensions:
  yas-grpc: ${join(__dirname, '../src')}
steps:
  - yas-grpc/Server:
      async: true
      title: Start mock gRPC server
      address: 0.0.0.0:5000
      timeout: 5s
      packages:
        user:
          proto: ${join(__dirname, '../proto/server.proto')}
          protoOptions: 
            keepCase: true
            longs: String
            enums: String
            defaults: true
            oneofs: true
          services:
            UserService:
              GetUsers: {
                code: 1,
                data: [{name: 'thanh', age: 1}]
              }
              GetCustomers: !function |
                () {
                  return {
                    code: 10,
                    data: [{name: 'thanh', age: 10}]
                  }
                }
  - Group:
      stepAsync: true
      async: true
      steps:
        - Templates:
            - yas-grpc/Call:
                ->: base
                proto: ${join(__dirname, '../proto/server.proto')}
                protoOptions: 
                  keepCase: true
                  longs: String
                  enums: String
                  defaults: true
                  oneofs: true
                package: user
                service: UserService
                address: 0.0.0.0:5000
                timeout: 1s
        - yas-grpc/Call:
            <-: base
            title: Test gRPC call
            method: GetUsers
            request: {
              "name": "thanh"
            }
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}
              - title: Response is valid
                chai: \${$.response.code.should.equals(1)}
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}

        - yas-grpc/Call:
            <-: base
            title: Test gRPC call
            method: GetCustomers
            request: {
              "name": "thanh"
            }
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(10)}
`)

    expect(existsSync(`${join(__dirname, 'grpc_document_details.md')}`)).toBe(true)
    const cnt = readFileSync(`${join(__dirname, 'grpc_document_details.md')}`).toString()
    expect(cnt).toContain('Test gRPC call')
    expect(cnt).not.toContain('This is not documented')
  })

  test('.proto is a link', async () => {
    await Simulator.Run(`
extensions:
  yas-grpc: ${join(__dirname, '../src')}
steps:
  - yas-grpc/Server:
      async: true
      title: Start mock gRPC server
      address: 0.0.0.0:5000
      timeout: 5s
      packages:
        user:
          proto: https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/proto/server.proto
          protoOptions: 
            keepCase: true
            longs: String
            enums: String
            defaults: true
            oneofs: true
          services:
            UserService:
              GetUsers: {
                code: 1,
                data: [{name: 'thanh', age: 1}]
              }
              GetCustomers: !function |
                () {
                  return {
                    code: 10,
                    data: [{name: 'thanh', age: 10}]
                  }
                }
  - Group:
      stepAsync: true
      async: true
      steps:
        - Templates:
            - yas-grpc/Call:
                ->: base
                proto: https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/proto/server.proto
                protoOptions: 
                  keepCase: true
                  longs: String
                  enums: String
                  defaults: true
                  oneofs: true
                package: user
                service: UserService
                address: 0.0.0.0:5000
                timeout: 1s
        - yas-grpc/Call:
            <-: base
            title: Test gRPC call
            method: GetUsers
            request: {
              "name": "thanh"
            }
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}
              - title: Response is valid
                chai: \${$.response.code.should.equals(1)}
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}

        - yas-grpc/Call:
            <-: base
            title: Test gRPC call
            method: GetCustomers
            request: {
              "name": "thanh"
            }
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(10)}
`)

    expect(existsSync(`${join(__dirname, 'grpc_document_details.md')}`)).toBe(true)
    const cnt = readFileSync(`${join(__dirname, 'grpc_document_details.md')}`).toString()
    expect(cnt).toContain('Test gRPC call')
    expect(cnt).not.toContain('This is not documented')
  })

})
