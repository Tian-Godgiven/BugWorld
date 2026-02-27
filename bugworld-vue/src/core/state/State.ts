import _ from 'lodash'
import { countImpact, createImpact, impactToStateObject } from './Impact'
import { getContentBetween, newError } from '../../utils/global_ability'
import type { Impact } from './Impact'

export class State {
  来源: any[]
  类型: '数值' | '字典' | '数组' | '无'
  单位?: string
  数值?: any
  影响?: Impact[]
  字典?: Record<string, State>
  数组?: any[]
  数量?: number | '无限'

  constructor(source: any, type: '数值' | '字典' | '数组' | '无') {
    this.来源 = [source]
    this.类型 = type
  }
}

// 属性名称→属性类型映射表
const stateNameToTypeLib: Record<string, '数值' | '字典' | '数组' | '无'> = {
  所属: '数组',
  特性: '数组',
  参数: '字典',
  系数: '字典',
  范围: '数组'
}

// 创建一个属性对象
function createState(
  source: any,
  type: '数值' | '字典' | '数组' | '无',
  unit?: string,
  num?: number | '无限'
): State {
  const state = new State(source, type)

  if (type === '数值') {
    state.数值 = null
    state.影响 = []
  } else if (type === '字典') {
    state.字典 = {}
  } else if (type === '数组') {
    state.数组 = []
    if (num != null && ((_.isNumber(num) && num >= 0) || num === '无限')) {
      state.数量 = num
    }
  }

  if (unit) {
    state.单位 = unit
  }

  return state
}

// 读取一个json_states数据，将其中[属性-值]键值对变为一个对象的属性+影响
export function loadJsonStatesToObject(
  object: any,
  state_belong: string | string[],
  json_states: Record<string, any>,
  source: any,
  level?: number | string
): void {
  for (const state_name in json_states) {
    let state_data = json_states[state_name]

    // 获取属性类型
    let state_type: '数值' | '字典' | '数组' | '无' = '数值'
    if (state_data === null) {
      state_type = '无'
    } else if (_.isArray(state_data)) {
      state_type = '数组'
    } else if (!_.isObject(state_data)) {
      state_type = '数值'
    } else {
      if (state_data['类型'] != null) {
        state_type = state_data['类型']
      } else {
        if (stateNameToTypeLib[state_name]) {
          state_type = stateNameToTypeLib[state_name]
        } else {
          const temp = ['数组', '字典', '数值'].find((key) => key in state_data)
          if (temp) {
            state_type = temp as '数值' | '字典' | '数组' | '无'
          } else if (_.isObject(state_data)) {
            state_type = '字典'
          }
        }
      }
    }

    const state_unit = state_data?.['单位'] ?? undefined
    const state_level = state_data?.['优先级'] ?? level
    const state_num = state_data?.['数量'] ?? undefined

    const state_object = createState(source, state_type, state_unit, state_num)
    appendStateObject(object, state_belong, state_name, state_object)

    if (state_type === '数值') {
      const state_value = state_data?.['数值'] ?? state_data
      const impact = createImpact(source, state_value, state_level)
      impactToStateObject(object, state_object, impact as Impact)
    } else if (state_type === '字典') {
      delete state_data['单位']
      delete state_data['优先级']
      const state_dic = state_data?.['字典'] ?? state_data
      loadJsonStatesToObject(state_object, '字典', state_dic, source, state_level)
    } else if (state_type === '数组') {
      const state_array = state_data?.['数组'] ?? state_data
      state_object.数组 = state_array
    }
  }
}

// 将一个指定的【属性对象State】添加到对象的指定位置中
export function appendStateObject(
  object: any,
  state_belong: string | string[],
  state_name: string,
  state_object: State
): void {
  let the_object: any

  if (_.isArray(state_belong)) {
    let tmp_object = object
    for (let i = 0; i < state_belong.length; i++) {
      tmp_object = tmp_object[state_belong[i]]
    }
    the_object = tmp_object
  } else {
    the_object = object[state_belong]
  }

  if (the_object[state_name] instanceof State) {
    const old_state = the_object[state_name]
    const new_source = state_object.来源
    if (!_.includes(old_state.来源, new_source)) {
      old_state.来源.push(new_source)
    }
    const new_impact = state_object.影响
    if (old_state.影响 && new_impact) {
      old_state.影响.push(...new_impact)
    }
  } else {
    the_object[state_name] = state_object
  }
}

// 向对象的指定位置中添加一个新的属性对象
export function addStateTo(object: any, source: any, state_path: string | string[], state: any): void {
  let state_belong: any
  if (_.isArray(state_path)) {
    state_belong = findStatePath(object, state_path[0])
    state_belong.push(...state_path.slice(1))
  } else {
    state_belong = findStatePath(object, state_path)
  }

  if (!state_belong) {
    throw new Error('错误的state_path值：' + state_path)
  }

  const state_json: Record<string, any> = {}
  addStateTo_stateToJson(state, state_json)

  function addStateTo_stateToJson(state: any, state_json: Record<string, any>): void {
    const state_name = state.属性名
    state_json[state_name] = {}

    if (state.数值 != null) {
      state_json[state_name].数值 = state.数值
    } else if (state.数组 != null) {
      state_json[state_name].数组 = state.数组
    } else if (state.字典 != null) {
      state_json[state_name].字典 = state.字典
    } else if (state.子属性 != null) {
      for (const childState of state.子属性) {
        addStateTo_stateToJson(childState, state_json[state_name])
      }
    } else {
      throw new Error('state必须具备"数值"或"子元素"其一且不为空：' + state)
    }

    if (state.单位 != null) {
      state_json[state_name].单位 = state.单位
    }
    state_json[state_name].优先级 = state.优先级 == null ? 'basic' : state.优先级
  }

  if (Object.keys(state_json).length > 0) {
    loadJsonStatesToObject(object, state_belong, state_json, source)
  } else {
    newError('000', ['错误的state值,无法正确产生state_json：', state])
  }
}

// 删除一个对象的指定【属性名】对应的source
export function deleteStateFrom(object: any, source: any, state_path: string | string[]): void {
  const state_belong = findState(object, state_path, 'belong')
  const state_name = _.isArray(state_path) ? _.last(state_path)! : state_path
  const state = state_belong[state_name]

  if (!state) {
    throw new Error('没有在object中找到对应的state_path的位置')
  }

  if (source === 'all') {
    delete state_belong[state_name]
  } else {
    const index = state.来源.indexOf(source)
    if (index === -1) {
      throw new Error('这个state对象的来源中不包含指定的source')
    } else {
      state.来源.splice(index, 1)
      if (state.来源.length === 0) {
        delete state_belong[state_name]
      }
    }
  }
}

// 根据指定的对象和属性路径获取值
export function stateValue(object: any, state_path: string | string[], type?: string): any {
  if (object === undefined) {
    throw new Error('该对象不存在')
  }

  const state_object = findState(object, state_path)
  if (!state_object) {
    return false
  }

  if (type === 'stateObject') {
    return state_object
  }

  let value: any
  const state_type = state_object['类型']

  if (state_type === '数值') {
    value = state_object['数值']
  } else if (state_type === '数组') {
    value = state_object['数组']
    if (state_object['数量'] === 1) {
      value = value[0]
    }
  } else if (state_type === '字典') {
    value = state_object['字典']
  } else if (state_type === '无') {
    value = null
  } else {
    console.error('属性对象的类型有误：', state_object)
    throw new Error('000错误')
  }

  if (type === 'symbol' && _.isNumber(value)) {
    const symbol = value > 0 ? '+' : ''
    value = symbol + value
  } else if (type === 'num') {
    value = parseInt(value)
  }

  // 信息类属性由UI层处理，此处直接返回原始值
  return value
}

// 向一个【目标对象】的【数组属性】中添加一个值
export function pushToState(object: any, state_path: string | string[], value: any): boolean {
  const state_object = findState(object, state_path)

  if (state_object['类型'] === '数组' && _.isArray(state_object['数组'])) {
    const max_num = state_object['数量']
    if (max_num && max_num !== '无限') {
      const old_num = state_object.数组!.length
      const new_num = _.isArray(value) ? value.length : 1
      if (old_num + new_num > (max_num as number)) {
        console.log(state_object, old_num, value, new_num)
        return false
      }
    }
    state_object['数组'].push(value)
    return true
  } else {
    newError('000', ['该属性不是一个数组属性,或其[数组]属性不是一个数组！', state_object])
  }
}

// 将一个【目标对象】的[数组属性]中的指定的值删除并返回
export function popFromState(object: any, state_path: string | string[], value?: any): any {
  const state_object = findState(object, state_path)

  if (state_object['类型'] === '数组' && _.isArray(state_object['数组'])) {
    const array = state_object['数组']
    if (value) {
      if (_.isArray(value)) {
        const return_array: any[] = []
        for (const value_i of value) {
          return_array.push(popFromState_inner(array, value_i))
        }
        return return_array
      } else {
        return popFromState_inner(array, value)
      }
    } else {
      return array.pop()
    }
  } else {
    throw new Error('该属性对象不是一个数组属性,或其[数组]不是一个数组！')
  }

  function popFromState_inner(array: any[], value: any): any {
    const index = array.indexOf(value)
    if (index !== -1) {
      return array.splice(index, 1)[0]
    } else {
      console.log(`值 ${value} 在数组中不存在。`)
      return false
    }
  }
}

// 修改一个对象的数组属性的值
export function changeState(object: any, state_path: string | string[], value: any): void {
  const state_object = findState(object, state_path)

  if (!_.isArray(value) && _.isObject(value) && (value as any).type !== 'object') {
    if (state_object['类型'] === '字典') {
      for (const state_name in value) {
        const value_i = (state_path as any)[state_name]
        const state_object_i = state_object['字典']![state_name]
        changeState_inner(state_object_i, value_i)
      }
    } else {
      newError('000', [
        '对于此类字典value，要求state_path所指向的属性对象为字典类型',
        '\nstate_path:',
        state_path,
        '\nstate_object:',
        state_object,
        '\nvalue:',
        value
      ])
    }
  } else {
    changeState_inner(state_object, value)
  }

  function changeState_inner(state_object: State, value: any): void {
    if (state_object['类型'] === '数组') {
      if (state_object['数量']) {
        const value_num = _.isArray(value) ? value.length : 1
        if (value_num > (state_object['数量'] as number)) {
          newError('000', ['超过了state_object的数量上限：', state_object, value])
        }
      }
      if (!_.isArray(value)) {
        value = [value]
      }
      state_object['数组'] = value
    } else {
      newError('000', ['只允许修改对象的指定位置的数组属性的值', object, state_path, state_object])
    }
  }
}

// 返回对象是否具有某个属性
export function haveState(object: any, state_path: string | string[]): boolean {
  if (_.isArray(state_path)) {
    let path = findStatePath(object, state_path[0])
    if (!path) {
      return false
    }
    for (let i = 1; i < state_path.length; i++) {
      path.push(state_path[i])
    }
    let the_object: any = object
    for (const key of state_path) {
      if (the_object instanceof State) {
        the_object = the_object['字典']![key]
      } else {
        the_object = the_object[key]
      }
      if (!the_object) {
        return false
      }
    }
    return the_object instanceof State
  } else {
    const path = findStatePath(object, state_path)
    return !!path
  }
}

// 获取一个对象的指定属性的单位
export function getStateUnit(object: any, state_path: string | string[]): string {
  if (!object) {
    newError('000', ['该对象不存在：', object])
  }

  const state_object = findState(object, state_path)
  if (!state_object || state_object.type === 'object') {
    return ''
  }

  let unit = state_object['单位']
  if (!unit) {
    const units = object['单位']
    if (units && !_.isArray(state_path)) {
      unit = units[state_path as string]
    }
  }

  return unit || ''
}

// 返回对象的指定属性对象
export function findState(object: any, state_path: string | string[], type?: string): any {
  let path: string[] | false

  if (_.isArray(state_path)) {
    path = findStatePath(object, state_path[0])
    if (!path) return false
    for (let i = 1; i < state_path.length; i++) {
      path.push(state_path[i])
    }
  } else {
    path = findStatePath(object, state_path)
  }

  if (path) {
    let the_object: any = object
    if (type === 'belong') {
      path = [...path]
      path.pop()
    }
    for (const key of path) {
      if (the_object instanceof State) {
        the_object = the_object['字典']![key]
      } else {
        the_object = the_object[key]
      }
      if (!the_object) {
        newError('000', [
          '指定路径有误，无法沿该路径寻找属性，请确认该路径是否在对象中有效：',
          '\n对象：',
          object,
          '\n路径：',
          state_path
        ])
      }
    }
    return the_object
  } else {
    console.error(`未在`, object, `中找到对应的属性：${state_path}`)
    throw new Error('000')
  }
}

// 通过递归获得找到属性的路径,若没有找到则返回false
export function findStatePath(object: any, state_name: string): string[] | false {
  let the_object = object
  if (object.type === 'object') {
    the_object = object.属性
  }
  const path = ['属性']
  const tmp = findStatePath_inner(the_object, state_name, path)
  return tmp || false

  function findStatePath_inner(
    the_object: any,
    state_name: string,
    path: string[]
  ): string[] | false {
    for (const key in the_object) {
      if (key === state_name) {
        return path.concat(key)
      } else {
        const state_object = the_object[key]
        if (state_object instanceof State && state_object['类型'] === '字典') {
          const result = findStatePath_inner(state_object['字典']!, state_name, path.concat(key))
          if (result) {
            return result
          }
        }
      }
    }
    return false
  }
}
