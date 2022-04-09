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
  - Group:
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
            doc: 
              tags: [RETURNS, USER]
            <-: base
            ->: test
            title: Test gRPC call
            proto: ${join(__dirname, '../proto/server.proto')}
            method: GetUsers
            request: {
              "name": "thanh"
            }
            validate:
              - title: Response is valid
                chai: \${expect($.response.code).to.equal(1)}

        - yas-grpc/Call:
            <-: test
            title: This is default doc
            doc: true

        - yas-grpc/Call:
            <-: base
            title: This is not documented
            method: GetUsers
            request: {
              "name": "thanh"
            }
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
  })

})
