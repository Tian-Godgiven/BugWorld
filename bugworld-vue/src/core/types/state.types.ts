// 状态类型定义

// 状态类型枚举
export type StateType = '数值' | '字典' | '数组' | '无'

// 影响接口
export interface Impact {
  来源: any
  数值: any
  优先级: number | string
}

// 状态对象接口
export interface StateObject {
  来源: any[]
  类型: StateType
  单位?: string
  数值?: any
  影响?: Impact[]
  字典?: Record<string, StateObject>
  数组?: any[]
  数量?: number | '无限'
}

// 属性名称到类型的映射
export const stateNameToTypeLib: Record<string, StateType> = {
  所属: '数组',
  特性: '数组',
  参数: '字典',
  系数: '字典',
  范围: '数组'
}
