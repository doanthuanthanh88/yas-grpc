import { readFileSync } from 'fs';
import { basename } from 'path';
import { escape } from 'querystring';
import { IFileAdapter } from 'yaml-scene/src/elements/File/adapter/IFileAdapter';
import { Scenario } from 'yaml-scene/src/singleton/Scenario';
import { Exporter as IExporter } from 'yaml-scene/src/utils/doc/Exporter';
import Call from '../Call';
import MD from './MD';

export class Exporter implements IExporter<Call> {

  constructor(private writer: IFileAdapter, public md: MD) {
  }

  getHashLink(...txts: string[]) {
    return escape(this.md.prefixHashLink + txts.join('-')).toLowerCase()
  }

  async export(calls: Call[]) {
    const mdMenu = [`# ${this.md.title || Scenario.Instance.title}`, `${this.md.description || Scenario.Instance.description || ''}`];
    const mdDetails = [] as string[];

    if (this.md.signature) {
      mdMenu.push(`> Developed by ${this.md.signature}  `)
    }
    mdMenu.push(`> Updated at ${new Date().toLocaleString()}  `)

    mdMenu.push('', `| | Title | |  `, `|---|---|---|  `)
    calls.sort((a, b) => a.title > b.title ? 1 : -1)

    const tags = calls.reduce((tags, call) => {
      (call.doc.tags || [' DEFAULT']).forEach(tagName => {
        if (!tags[tagName]) tags[tagName] = []
        tags[tagName].push(call)
      })
      return tags
    }, {} as { [key: string]: Call[] })

    Object.keys(tags).sort().forEach(tagName => {
      mdMenu.push(`| |${tagName.trim()} (${tags[tagName].length}) | |`)
      tags[tagName].forEach((call, i) => {
        mdMenu.push(`|**${i + 1}**|[${call.title}](#${escape(call.title)})| ${call.uri} | `)
      })
    })
    calls.forEach(call => {
      const details = []
      details.push('', '---', '', `<a id="${this.getHashLink(call.title)}" name="${this.getHashLink(call.title)}"></a>`, `## [${call.title}](#)
${call.description || ''}`, '')

      details.push(`
Package: \`${call.package}\`

Service: \`${call.service}\`

Method: \`${call.method}\`

`, '')
      details.push(`<details>
<summary>${basename(call.proto)}</summary>

\`\`\`protobuf
${readFileSync(call.proto).toString()}
\`\`\`
</details>
`)
      details.push('', '<br/>', '', '## REQUEST')

      if (call.metadata) {
        if (Object.keys(call.metadata).length) {
          details.push(`### Request metadata
<details>
  <summary>Example</summary>

\`\`\`json
${JSON.stringify(call.metadata, null, '  ')}
\`\`\`

</details>

<details open>
  <summary>Schema</summary>

${this.objectToMDType(call.metadata)}

</details>
`)
        }
      }

      if (call.request) {
        details.push(`### Request data
<details>
  <summary>Example</summary>

\`\`\`json
${JSON.stringify(call.request, null, '  ')}
\`\`\`

</details>

<details open>
  <summary>Schema</summary>

${this.objectToMDType(call.request)}

</details>
`)
      }

      details.push('', `## RESPONSE`)

      if (call.response !== undefined) {
        details.push(`### Response data
<details>
  <summary>Example</summary>

\`\`\`json
${JSON.stringify(call.response, null, '  ')}
\`\`\`

</details>

<details open>
  <summary>Schema</summary>

${this.objectToMDType(call.response)}

</details>
`)
      }

      mdDetails.push(details.join('\n'))

    })

    await this.writer.write([...mdMenu, '  ', ...mdDetails, '  '].join('\n'));
  }

  private objectToMDType(obj: any) {
    const md = []
    md.push(`| Name | Type |`)
    md.push(`| --- | --- |`)
    this.objectToTypes({ '@ROOT': obj }).forEach((info: any) => {
      md.push(...this.toMDString(info))
    })
    return md.length > 2 ? md.join('\n') : ''
  }

  private toMDString(info: any) {
    const md = []
    md.push(`| ${info.space} \`${info.name}\` | ${Array.from(info.types).join(', ')} |`)
    if (info.childs.length) {
      info.childs.forEach((child: any) => {
        md.push(...this.toMDString(child))
      })
    }
    return md
  }

  private objectToTypes(obj: any, space = '') {
    if (Array.isArray(obj)) {
      const arr = [] as any[]
      obj.forEach(o => {
        arr.push(...this.objectToTypes(o, space))
      })
      return arr.reduce((sum, child) => {
        const existed = sum.find(c => c.name === child.name)
        if (existed) {
          existed.types.add(...child.types)
        } else {
          sum.push(child)
        }
        return sum
      }, [])
    } else if (typeof obj === 'object') {
      return Object.keys(obj).map(key => {
        const info = {
          space,
          name: key,
          types: new Set(),
          childs: []
        }
        if (Array.isArray(obj[key])) {
          info.types.add(`array&lt;${Array.from(new Set(obj[key].map(e => typeof e))).join(',')}&gt;`)
        } else {
          info.types.add(typeof obj[key])
        }
        info.childs = this.objectToTypes(obj[key], space + '&nbsp;&nbsp;&nbsp;&nbsp;')
        return info
      })
    }
    return []
  }
}
