import { basename, join } from "path"
import { File } from "yaml-scene/src/elements/File/adapter/File"
import { Url } from "yaml-scene/src/elements/File/adapter/Url"
import { Scenario } from "yaml-scene/src/singleton/Scenario"
import { TraceError } from "yaml-scene/src/utils/error/TraceError"
import { FileUtils } from "yaml-scene/src/utils/FileUtils"

export class ProtoManager {
  private static _Instance: ProtoManager

  static get Instance() {
    if (!this._Instance) {
      Scenario.Instance.events
        .on('scenario.dispose', () => {
          this._Instance.clean()
          this._Instance = undefined
        })
      this._Instance = new ProtoManager()
    }
    return this._Instance
  }

  private _protoURLCached: Map<string, string>

  constructor() {
    this._protoURLCached = new Map<string, string>()
  }

  async getProtoPath(proto: string) {
    const existed = FileUtils.Existed(proto)
    if (!existed) throw new TraceError(`File .proto is not existed`, { proto: proto })

    if (existed !== 'url') return proto

    const protoLocalInCached = this._protoURLCached.get(proto)
    if (protoLocalInCached) {
      return protoLocalInCached
    }

    const tmpProtoDir = FileUtils.GetNewTempPath()
    FileUtils.MakeDirExisted(tmpProtoDir, 'dir')
    const url = new Url(proto)
    const protoLocal = join(tmpProtoDir, basename(proto))
    const file = new File(protoLocal)
    await file.write(await url.read())
    this._protoURLCached.set(proto, protoLocal)
    return protoLocal
  }

  clean() {
    FileUtils.RemoveFilesDirs(...this._protoURLCached?.values())
  }
}