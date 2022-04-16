import { Socket } from "net"
import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"

function portIsUsed(host: string, port: number) {
  return new Promise((resolve, reject) => {
    const socket = new Socket()
    socket.connect(port, host)
    socket.on("connect", function () {
      resolve(true);
    });
    socket.on("error", function (err: any) {
      if (err['code'] !== "ECONNREFUSED") {
        reject(false);
      } else {
        resolve(true);
      }
    });
  })
}

describe('Test gRPC Server', () => {
  test('.proto is a file local', async () => {
    await Simulator.Run(`
  extensions:
    yas-grpc: ${join(__dirname, '../src')}
  steps:
    - yas-grpc/Server:
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
                    const merge = require('lodash.merge')
                    return merge({
                      name: this.request.name
                    }, {
                      age: 10
                    })
                  }
  `)
    expect(await portIsUsed('0.0.0.0', 5000)).toEqual(true)
  })

  test('.proto is a link', async () => {
    await Simulator.Run(`
    extensions:
      yas-grpc: ${join(__dirname, '../src')}
    steps:
      - yas-grpc/Server:
          title: Start mock gRPC server
          address: 0.0.0.0:5000
          timeout: 2s
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
                      const merge = require('lodash.merge')
                      return merge({
                        name: this.request.name
                      }, {
                        age: 10
                      })
                    }
    `)
    expect(await portIsUsed('0.0.0.0', 5000)).toEqual(true)
  })

})
