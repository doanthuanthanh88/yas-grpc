import { readFileSync } from 'fs';
import { basename } from 'path';
import { escape } from 'querystring';
import { DataSource } from 'yaml-scene/src/utils/data-source/DataSource';
import { Exporter as IExporter } from 'yaml-scene/src/utils/doc/Exporter';
import MD from './MD';
import Call from '../Call';

export class Exporter implements IExporter<Call> {

  constructor(private datasource: DataSource, public md: MD) {
  }

  objectToMDType(obj) {
    const md = []
    md.push(`| Name | Type |`)
    md.push(`| --- | --- |`)
    this.objectToTypes({ '@ROOT': obj }).forEach(info => {
      md.push(...this.toMDString(info))
    })
    return md.length > 2 ? md.join('\n') : ''
  }

  private toMDString(info: any) {
    const md = []
    md.push(`| ${info.space} \`${info.name}\` | ${Array.from(info.types).join(', ')} |`)
    if (info.childs.length) {
      info.childs.forEach(child => {
        md.push(...this.toMDString(child))
      })
    }
    return md
  }

  private objectToTypes(obj: any, space = '') {
    if (Array.isArray(obj)) {
      const arr = []
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

  export(apis: Call[]) {
    const mdMenu = [`# ${this.md.title || this.md.proxy.scenario.title}`, `${this.md.description || this.md.proxy.scenario.description || ''}`];
    const mdDetails = [];

    if (this.md.signature) {
      mdMenu.push(`> Developed by ${this.md.signature}  `)
    }
    mdMenu.push(`> Updated at ${new Date().toLocaleString()}  `)

    mdMenu.push('', `| | Title | Package | Target |  `, `|---|---|---|---|  `)
    apis.sort((a, b) => a.title > b.title ? 1 : -1)

    apis.forEach((call, i) => {
      mdMenu.push(`|**${i + 1}**|[${call.title}](#${escape(call.title)})| ${call.package} | ${call.service}.${call.method}() | `)
      const details = []
      details.push('', '---', '', `## [${call.title}](#) <a name="${escape(call.title)}"></a>
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

    this.datasource.write([...mdMenu, '  ', ...mdDetails, '  '].join('\n'));
  }
}
