import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"

test('Test gRPC Summary', async () => {
  await Simulator.Run(`
extensions:
  yas-grpc: ${join(__dirname, '../src')}
steps:
- yas-grpc/Summary:
    title: Testing result
`)
  expect(true).toEqual(true)
})

