import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"

describe('Unit test gRPC Server', () => {

  test('Test gRPC client & mock server', async () => {
    await Simulator.Run(`
extensions:
  - ${require.resolve('../src')}
steps:
  - Group: 
      steps:
        - serve:
            async: true
            title: Start mock gRPC server
            address: 0.0.0.0:5000
            timeout: 3s
            packages:
              user:
                proto: ${join(__dirname, '../proto/server.proto')}
                protoOptions: 
                  keepCase: true,
                  longs: String,
                  enums: String,
                  defaults: true,
                  oneofs: true
                services:
                  UserService:
                    GetUsers: {
                      code: 1,
                      data: [{name: 'thanh', age: 1}]
                    }
        - call:
            async: true
            doc: true
            title: Test gRPC call
            proto: ${join(__dirname, '../proto/server.proto')}
            protoOptions: 
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
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
                chai: \${expect(_.response.code).to.equal(1)}

        - call:
            async: true
            title: This is not documented
            proto: ${join(__dirname, '../proto/server.proto')}
            protoOptions: 
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
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
                chai: \${expect(_.response.code).to.equal(1)}

        - doc:
            title: User gRPC Service
            description: Demo CRUD API to generate to markdown document
            signature: "[Doan Thuan Thanh](mailto:doanthuanthanh88@gmail.com)"
            outFile: ${join(__dirname, 'api_document_details.md')}
`)

    expect(existsSync(`${join(__dirname, 'api_document_details.md')}`)).toBe(true)
    const cnt = readFileSync(`${join(__dirname, 'api_document_details.md')}`).toString()
    expect(cnt).toContain('Test gRPC call')
    expect(cnt).not.toContain('This is not documented')
  })

})
