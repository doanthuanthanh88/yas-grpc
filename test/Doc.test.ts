import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"

describe('gRPC', () => {

  test('Test gRPC call', async () => {
    await Simulator.Run(`
extensions:
  yas-grpc: ${join(__dirname, '../src')}
steps:
  - yas-grpc/Server:
      async: true
      title: Start mock gRPC server
      address: 0.0.0.0:5000
      timeout: 3s
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
  - Group:
      async: true
      steps:
        - yas-grpc/Call:
            doc: 
              tags: [RETURNS, USER]
            ->: test
            title: Test gRPC call
            proto: ${join(__dirname, '../proto/server.proto')}
            protoOptions: 
              keepCase: true
              longs: String
              enums: String
              defaults: true
              oneofs: true
            package: user
            service: UserService
            method: GetUsers
            address: 0.0.0.0:5000
            request: {
              "name": "thanh"
            }
            timeout: 1s
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}

        - yas-grpc/Call:
            <-: test
            title: This is default doc
            doc: true

        - yas-grpc/Call:
            title: This is not documented
            proto: ${join(__dirname, '../proto/server.proto')}
            protoOptions: 
              keepCase: true
              longs: String
              enums: String
              defaults: true
              oneofs: true
            package: user
            service: UserService
            method: GetUsers
            address: 0.0.0.0:5000
            request: {
              "name": "thanh"
            }
            timeout: 1s
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}

  - yas-grpc/Summary:
      title: gRPC Summary

  - yas-grpc/Doc/MD:
      title: User gRPC Service
      description: Demo CRUD gRPC to generate to markdown document
      signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
      outFile: ${join(__dirname, 'grpc_document_details.md')}
`)

    expect(existsSync(`${join(__dirname, 'grpc_document_details.md')}`)).toBe(true)
    const cnt = readFileSync(`${join(__dirname, 'grpc_document_details.md')}`).toString()
    expect(cnt).toContain('Test gRPC call')
    expect(cnt).not.toContain('This is not documented')
  }, 60000)

})
