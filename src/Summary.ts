import chalk from "chalk"
import merge from "lodash.merge"
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy"
import { IElement } from "yaml-scene/src/elements/IElement"
import { Scenario } from "yaml-scene/src/singleton/Scenario"
import { TimeUtils } from "yaml-scene/src/utils/TimeUtils"

/**
 * @guide
 * @name yas-grpc/Summary
 * @description Summary after all of gRPC calls in scene executed done. (It's should be the last step)
 * @group gRPC
 * @order 7
 * @example
- yas-grpc/Summary:
    title: Testing result
 * @end
 */
export default class Summary {
  proxy: ElementProxy<this>
  $$: IElement
  $: this

  title: string

  private passed = 0
  private failed = 0
  get total() {
    return this.passed + this.failed
  }

  init(props: string) {
    if (props && typeof props !== 'object') {
      this.title = props
    } else {
      merge(this, props)
    }
    Scenario.Instance.events
      .on('gRPC-call.done', isPassed => {
        if (isPassed) {
          this.passed++
        } else {
          this.failed++
        }
      })
  }

  async exec() {
    await TimeUtils.Delay('1s')
    this.proxy.logger.info('---------------------------------')
    console.group()
    this.proxy.logger.info(chalk.cyan.bold(this.title))
    this.proxy.logger.info(chalk.green('- Passed %d/%d'), this.passed, this.total)
    this.proxy.logger.info(chalk.red('- Failed %d/%d'), this.failed, this.total)
    console.groupEnd()
    this.proxy.logger.info('---------------------------------')
  }
}
