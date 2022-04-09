# Mock gRPC server
Mock data to serve to clients via gRPC

## Features
- Create `gRPC Server` to serve data
- Make `gRPC calls` to gRPC server
- Support .proto is `file local` or `link`
- `Auto document` the gRPC after run successfully

## How to use

### `Build a gRPC server to serve simple data content`

Run in local `yaml-scene`
```sh
  yas -f https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/sharing/Server.yas.yaml
```

Run via docker
```sh
  docker run --rm -it --name mock-grpc-server \
  -p 5000:5000 \
  doanthuanthanh88/yaml-scene \
  -f \
  https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/sharing/Server.yas.yaml
```

- After done, the address "0.0.0.0:5000" is availabed

### `Make clients call to gRPC server`

Run in local `yaml-scene`
```sh
  yas -f https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/sharing/Client.yas.yaml
```

Run via docker
```sh
  docker run --rm -it --link mock-grpc-server --name mock-grpc-client \
  -e ADDRESS=mock-grpc-server:5000 \
  doanthuanthanh88/yaml-scene \
  -f \
  https://raw.githubusercontent.com/doanthuanthanh88/yas-grpc/main/sharing/Client.yas.yaml
```
