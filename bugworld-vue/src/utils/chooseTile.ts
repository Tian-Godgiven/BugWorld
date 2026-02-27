import { createApp, h } from 'vue'
import mitt from 'mitt'
import ChooseTile from '../components/tiles/ChooseTile.vue'
import { createRandomId } from './global_ability'

interface ChoiceOption {
  选项内容: string | any
  选项事件?: {
    选中时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    失去选中时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    选择时?: (containerObject?: any, choiceObject?: any, index?: number) => any
    未选择时?: (containerObject?: any, choiceObject?: any, index?: number) => any
  }
  选项样式?: Record<string, any>
  选项样式类?: string[]
  对象?: any
  优先级?: number | string
  默认选中?: boolean
}

interface ChooseAbility {
  chooseTile_id?: string
  重复?: boolean | '关闭' | '取代'
  标题居中?: boolean
  对象?: any
  立即选择?: boolean
  关闭?: boolean
  复选?: { max?: number; min?: number }
  复选样式?: 'checkbox' | 'arrow' | false
  确认?: boolean
  取消?: boolean
  返回?: boolean | 'auto'
  选项排列?: '横向' | '竖向'
  通用样式?: Record<string, any>
  位置?: { top?: number; left?: number }
  尺寸?: { width?: string | number; height?: string | number }
}

/**
 * 创建一个选择 Tile
 * @param title 标题
 * @param text 选项文本
 * @param choices 选项数组
 * @param ability 配置选项
 * @returns 包含 chooseTile、submitEmitter、submit_id 的对象
 */
export function createChooseTile(
  title: string = '选择',
  text: string,
  choices: ChoiceOption[],
  ability: ChooseAbility = {}
) {
  // 检查是否存在同 chooseTile_id 的元素
  const chooseTile_id = ability.chooseTile_id
  if (chooseTile_id) {
    const old_chooseTile = document.querySelector(`.choose-tile[data-choose-tile-id="${chooseTile_id}"]`)
    if (old_chooseTile) {
      const 重复 = ability.重复
      if (重复 === '关闭') {
        old_chooseTile.remove()
        return false
      } else if (重复 === '取代') {
        old_chooseTile.remove()
      } else if (重复 !== true) {
        return false
      }
    }
  }

  // 创建事件发射器
  const submitEmitter = mitt()
  const submit_id = 'submit_id_' + createRandomId(8)

  // 创建容器
  const container = document.createElement('div')
  container.className = 'choose-tile-container'
  if (chooseTile_id) {
    container.setAttribute('data-choose-tile-id', chooseTile_id)
  }
  document.body.appendChild(container)

  // 创建 Vue 应用
  const app = createApp({
    render() {
      return h(ChooseTile, {
        title,
        text,
        choices,
        ability,
        emitter: submitEmitter,
        submitId: submit_id,
        onClose: () => {
          app.unmount()
          container.remove()
        }
      })
    }
  })

  app.mount(container)

  return {
    chooseTile: container,
    submitEmitter,
    submit_id
  }
}
