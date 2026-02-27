/**
 * 示例插件 - 演示如何开发 BugWorld 插件
 *
 * 这个插件添加了：
 * - 一个新的虫群类型：超级工蚁
 * - 一个新的设施：高级孵化室
 * - 监听虫子创建事件并输出日志
 */

import type { Plugin, PluginContext } from '../index'

const examplePlugin: Plugin = {
  id: 'example-plugin',
  name: '示例插件',
  version: '1.0.0',
  description: '演示插件系统功能的示例插件',
  author: 'BugWorld Team',

  install(context: PluginContext) {
    console.log('示例插件正在安装...')

    // 1. 注册自定义虫群数据
    context.dataRegistry.registerBug('超级工蚁', {
      名称: '超级工蚁',
      属性: {
        工作: 15,
        战斗: 5,
        移动: 3,
        生命: 20,
        词条: ['成虫', '工作者', '超级']
      },
      特性: ['勤劳', '强壮'],
      信息: '经过特殊培育的超级工蚁，工作效率极高'
    })

    // 2. 注册自定义设施数据
    context.dataRegistry.registerFacility('高级孵化室', {
      名称: '高级孵化室',
      属性: {
        等级: 1,
        数量: 1,
        词条: ['建筑', '孵化'],
        效果: '孵化速度+50%'
      },
      影响: {
        孵化速度: '+50%'
      },
      信息: '先进的孵化设施，能大幅提升虫卵孵化速度'
    })

    // 3. 注册自定义工作
    context.dataRegistry.registerWork('超级采集', {
      名称: '超级采集',
      属性: {
        需求: '工作>=10',
        效率: '+20/回合',
        进度: {
          now: 0,
          max: 100
        }
      },
      信息: '效率更高的资源采集工作'
    })

    // 4. 监听游戏事件
    context.eventBus.on('bug:create', (event) => {
      console.log(`[示例插件] 新虫子创建:`, event.bug)
    })

    context.eventBus.on('work:start', (event) => {
      console.log(`[示例插件] 工作开始:`, event.work)
    })

    context.eventBus.on('facility:join', (event) => {
      console.log(`[示例插件] 设施加入虫巢:`, event.facility)
    })

    // 5. 使用插件配置
    const config = context.config
    if (config.enableDebugLog) {
      console.log('[示例插件] 调试日志已启用')
    }

    console.log('示例插件安装完成！')
  },

  uninstall() {
    console.log('示例插件正在卸载...')
    // 清理资源（如果需要）
    console.log('示例插件卸载完成！')
  }
}

export default examplePlugin
