import _ from 'lodash'
import { initObject } from './Object'
import { changeState, pushToState } from '../state/State'
import Area_lib from '../../library/data/Area_lib.json'

let focusing_area: any
let area_id = 0

class Area {
  属性: any
  隐藏: any

  constructor() {
    this.属性 = {
      名称: null,
      参数: {},
      状态: null,
      虫巢: [],
      来源: []
    }
    this.隐藏 = {
      进行中: {
        工作: [],
        事件: []
      }
    }
  }
}

// 创建一个指定key的地区
export function createArea(area_key: string, source: any, states?: any): any {
  const area = new Area()
  const area_json = _.cloneDeep((Area_lib as any)[area_key])
  const area_func = null
  // 初始化
  initObject(area, area_key, source, area_json.属性, area_func, states)

  ;(area as any)['id'] = area_id

  area_id += 1
  focusing_area = area
  return area
}

// 返回当前聚焦的地区
export function returnFocusingArea(): any {
  return focusing_area
}

// 令虫巢加入一个地区
export function bugNestJoinArea(bugNest: any, area: any): void {
  // 令该虫巢的[属性→所处]为该地区
  changeState(bugNest, '所处', area)
  // 将其加入该地区的"虫巢"当中
  pushToState(area, '虫巢', bugNest)
}
