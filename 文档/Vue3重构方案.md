# BugWorld Vue3 + TypeScript 重构方案

## 一、方案确认

### 1.1 我对项目的理解

经过对现有代码的深入分析，我确认了以下核心架构：

**核心对象系统（Object/）**
- 基于ES6 Class的面向对象设计
- 统一的初始化流程（initObject）
- 复杂的属性系统（State）支持数值、数组、字典三种类型
- 影响系统（Impact）用于动态计算属性值
- 隐藏属性系统（Hidden）用于内部状态管理

**状态管理系统（State/）**
- State类：支持来源追踪、优先级、单位等元数据
- Impact系统：支持多来源影响的优先级计算
- 复杂的属性查找机制（findState/findStatePath）

**UI组件系统（Tiles/）**
- 基于jQuery的DOM操作
- Tile作为基础UI容器
- 事件委托机制处理交互

**数据驱动（library/）**
- JSON配置文件定义游戏内容
- 函数库（func_lib）定义对象行为

### 1.2 技术选型确认

✅ **同意使用以下技术栈：**
- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia
- Express（开发服务器）

### 1.3 重构原则再次确认

✅ 我理解并承诺遵守：
1. **100%功能保真** - 不修改任何游戏逻辑
2. **保留中文命名** - 这是项目特色
3. **辅助角色** - 所有改动需征得你的同意
4. **逐步迁移** - 每个模块完成后等待确认

---

## 二、目录结构设计

### 2.1 新项目结构

```
bugworld-vue/
├── public/                    # 静态资源
│   └── data/                 # 游戏数据文件（从原data/迁移）
├── src/
│   ├── main.ts               # 入口文件
│   ├── App.vue               # 根组件
│   ├── core/                 # 核心游戏逻辑（对应原Object/State/）
│   │   ├── objects/          # 游戏对象类
│   │   │   ├── Object.ts     # 基础对象类
│   │   │   ├── Bug.ts        # 虫群对象
│   │   │   ├── BugNest.ts    # 虫巢对象
│   │   │   ├── Facility.ts   # 设施对象
│   │   │   ├── Work.ts       # 工作对象
│   │   │   ├── Event.ts      # 事件对象
│   │   │   ├── Area.ts       # 区域对象
│   │   │   └── Characteristic.ts # 特性对象
│   │   ├── state/            # 状态系统
│   │   │   ├── State.ts      # 状态类
│   │   │   ├── Impact.ts     # 影响系统
│   │   │   ├── Hidden.ts     # 隐藏属性
│   │   │   ├── Entry.ts      # 词条系统
│   │   │   ├── Effect.ts     # 效果系统
│   │   │   ├── Movement.ts   # 行为系统
│   │   │   └── Status.ts     # 状态系统
│   │   └── types/            # TypeScript类型定义
│   │       ├── object.types.ts
│   │       ├── state.types.ts
│   │       └── game.types.ts
│   ├── library/              # 数据和函数库（对应原library/）
│   │   ├── data/             # JSON数据文件
│   │   │   ├── Bug_lib.json
│   │   │   ├── BugNest_lib.json
│   │   │   ├── Facility_lib.json
│   │   │   ├── Work_lib.json
│   │   │   └── Event_lib.json
│   │   └── functions/        # 函数库
│   │       ├── Bug_func_lib.ts
│   │       ├── Facility_func_lib.ts
│   │       ├── Work_func_lib.ts
│   │       └── Event_func_lib.ts
│   ├── components/           # Vue组件（对应原Tiles/）
│   │   ├── tiles/            # Tile组件
│   │   │   ├── LogTile.vue
│   │   │   ├── BugNestTile.vue
│   │   │   ├── BugGroupTile.vue
│   │   │   ├── WorkTile.vue
│   │   │   ├── OrderTile.vue
│   │   │   ├── FacilityTile.vue
│   │   │   ├── EventTile.vue
│   │   │   ├── BuildTile.vue
│   │   │   └── ChooseTile.vue
│   │   ├── common/           # 通用组件
│   │   │   ├── Tile.vue      # Tile基础组件
│   │   │   ├── ObjectDiv.vue # 对象显示组件
│   │   │   └── TileButton.vue
│   │   └── menus/            # 菜单组件
│   │       ├── WorkMenu.vue
│   │       ├── OrderMenu.vue
│   │       └── FacilityMenu.vue
│   ├── stores/               # Pinia状态管理
│   │   ├── game.ts           # 游戏全局状态
│   │   ├── bugNest.ts        # 虫巢状态
│   │   └── log.ts            # 日志状态
│   ├── composables/          # 组合式函数
│   │   ├── useGame.ts        # 游戏逻辑hooks
│   │   ├── useBugNest.ts     # 虫巢操作hooks
│   │   └── useWork.ts        # 工作操作hooks
│   ├── utils/                # 工具函数（对应原app/）
│   │   ├── global_ability.ts # 全局能力函数
│   │   └── helpers.ts        # 辅助函数
│   ├── plugins/              # 插件系统（为创意工坊预留）
│   │   ├── index.ts          # 插件管理器
│   │   └── types.ts          # 插件类型定义
│   ├── assets/               # 资源文件
│   │   ├── css/              # 样式文件
│   │   └── img/              # 图片资源
│   └── views/                # 页面视图
│       └── GameView.vue      # 游戏主视图
├── server.js                 # Express开发服务器（保留）
├── vite.config.ts            # Vite配置
├── tsconfig.json             # TypeScript配置
├── package.json              # 依赖配置
└── README.md                 # 项目说明
```

### 2.2 与原项目的对应关系

| 原项目路径 | 新项目路径 | 说明 |
|-----------|-----------|------|
| `src/js/Object/` | `src/core/objects/` | 游戏对象类 |
| `src/js/State/` | `src/core/state/` | 状态系统 |
| `src/js/Tiles/` | `src/components/tiles/` | UI组件 |
| `src/js/Modules/` | `src/components/common/` | 通用模块 |
| `src/js/library/` | `src/library/` | 数据和函数库 |
| `src/js/app/` | `src/utils/` | 工具函数 |

---

## 三、组件拆分方案

### 3.1 Tile组件层次结构

```
Tile.vue (基础Tile容器)
├── props: { 名称, 功能配置 }
├── slots: { header, content, footer }
└── emits: { close, minimize, clear }

具体Tile组件继承Tile.vue:
├── LogTile.vue          # 日志栏
├── BugNestTile.vue      # 虫巢信息
├── BugGroupTile.vue     # 虫群信息
├── WorkTile.vue         # 工作信息
├── OrderTile.vue        # 命令信息
├── FacilityTile.vue     # 设施信息
├── EventTile.vue        # 事件信息
├── BuildTile.vue        # 建设信息
└── ChooseTile.vue       # 选择界面
```

### 3.2 组件设计原则

**高度可配置**
- 所有Tile组件接受统一的props接口
- 支持插槽自定义内容
- 功能开关通过props控制

**创意工坊扩展支持**
- 组件注册机制：允许动态注册新Tile
- 数据驱动：组件内容由JSON配置
- 事件总线：组件间通信标准化

**示例：Tile组件接口设计**
```typescript
interface TileProps {
  名称: string
  功能?: {
    关闭?: boolean | 'cube'  // 关闭按钮配置
    最小化?: boolean
    清空?: boolean
    自定义按钮?: Array<{
      名称: string
      图标?: string
      处理函数: () => void
    }>
  }
  初始状态?: 'normal' | 'minimized' | 'cube'
}
```

---

## 四、状态管理方案

### 4.1 Pinia Store设计

**game.ts - 游戏全局状态**
```typescript
export const useGameStore = defineStore('game', () => {
  // 当前聚焦的虫巢
  const focusingBugNest = ref<BugNest | null>(null)

  // 游戏回合数
  const 回合数 = ref(0)

  // 所有区域
  const areas = ref<Area[]>([])

  // 方法
  function moveToBugNest(bugNest: BugNest) {
    focusingBugNest.value = bugNest
  }

  function nextTurn() {
    回合数.value++
    // 触发回合结算逻辑
  }

  return {
    focusingBugNest,
    回合数,
    areas,
    moveToBugNest,
    nextTurn
  }
})
```

**log.ts - 日志状态**
```typescript
export const useLogStore = defineStore('log', () => {
  const logs = ref<LogEntry[]>([])

  function appendLog(information: any[]) {
    logs.value.push({
      时间: Date.now(),
      内容: information
    })
  }

  function clearLog() {
    logs.value = []
  }

  return { logs, appendLog, clearLog }
})
```

### 4.2 响应式数据处理

**关键问题：原项目的对象是普通JS对象，需要转换为响应式**

方案选择：
1. **方案A（推荐）**：保持核心对象为普通类实例，在Store中用ref包装
   - 优点：最小改动，保持原有逻辑
   - 缺点：需要手动触发更新

2. **方案B**：将对象转为reactive
   - 优点：自动响应式
   - 缺点：可能破坏原有的类方法

**我的建议：采用方案A**，在关键操作后手动触发UI更新。

---

## 五、TypeScript类型定义结构

### 5.1 核心类型定义

**object.types.ts**
```typescript
// 基础对象接口
export interface GameObject {
  type: 'object'
  key: string
  属性: GameObjectAttributes
  单位: Record<string, string>
  隐藏: Record<string, any>
  行为: Record<string, Function>
}

// 对象属性接口
export interface GameObjectAttributes {
  名称: string | null
  数量?: number
  参数?: Record<string, any>
  系数?: Record<string, any>
  特殊?: Record<string, any>
  状态?: any[]
  特性?: any[]
  词条?: any[]
  信息?: string | null
  所属?: any[]
  来源?: any[]
}

// Bug对象接口
export interface Bug extends GameObject {
  属性: BugAttributes
  单位: {
    寿命: string
    占据: string
    储备: string
    生产: string
    消耗: string
    饥饿: string
    回复: string
  }
  隐藏: {
    被占有: Array<{
      占有数量: number
      占有来源: any
    }>
  }
}

// 其他对象类型...
```

**state.types.ts**
```typescript
// 状态类型
export type StateType = '数值' | '字典' | '数组' | '无'

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

// 影响接口
export interface Impact {
  来源: any
  数值: any
  优先级: number | string
}
```

### 5.2 类型定义策略

- 保留中文属性名
- 使用interface而非type（更易扩展）
- 为创意工坊预留泛型支持

---

## 六、迁移步骤规划

### 阶段一：基础架构搭建（预计需要你确认3-4次）

**步骤1.1：初始化Vue3项目**
- 使用Vite创建项目
- 配置TypeScript
- 安装依赖（Vue3, Pinia, lodash等）
- **等待你的确认**

**步骤1.2：搭建目录结构**
- 创建所有目录
- 设置路径别名
- 配置Vite
- **等待你的确认**

**步骤1.3：配置开发环境**
- 保留并调整server.js
- 配置热更新
- 设置CSS预处理器
- **等待你的确认**

### 阶段二：核心系统迁移（预计需要你确认8-10次）

**步骤2.1：State系统迁移**
- State.ts
- Impact.ts
- Hidden.ts
- 编写单元测试验证功能一致性
- **等待你的确认**

**步骤2.2：基础Object类迁移**
- Object.ts（initObject等核心函数）
- 类型定义
- **等待你的确认**

**步骤2.3：具体对象类迁移（逐个进行）**
- Bug.ts → 测试 → **确认**
- BugNest.ts → 测试 → **确认**
- Work.ts → 测试 → **确认**
- Facility.ts → 测试 → **确认**
- Event.ts → 测试 → **确认**
- Area.ts → 测试 → **确认**

**步骤2.4：数据库迁移**
- 迁移所有JSON文件
- 迁移函数库
- **等待你的确认**

### 阶段三：UI组件迁移（预计需要你确认10-12次）

**步骤3.1：基础组件**
- Tile.vue基础组件
- ObjectDiv.vue
- **等待你的确认**

**步骤3.2：Tile组件（逐个迁移）**
每个组件迁移流程：
1. 创建Vue组件
2. 迁移逻辑
3. 对比原版UI和行为
4. **等待你的确认**

迁移顺序：
- LogTile → **确认**
- BugNestTile → **确认**
- BugGroupTile → **确认**
- WorkTile → **确认**
- OrderTile → **确认**
- FacilityTile → **确认**
- EventTile → **确认**
- BuildTile → **确认**
- ChooseTile → **确认**

**步骤3.3：样式迁移**
- 迁移CSS文件
- 调整为Vue Scoped CSS
- **等待你的确认**

### 阶段四：游戏流程整合（预计需要你确认3-5次）

**步骤4.1：游戏初始化**
- 迁移start.js逻辑到Vue
- 创建GameView.vue
- **等待你的确认**

**步骤4.2：Pinia Store集成**
- 创建所有Store
- 连接组件和Store
- **等待你的确认**

**步骤4.3：事件系统**
- 迁移事件处理
- 测试交互功能
- **等待你的确认**

### 阶段五：测试和验证（预计需要你确认2-3次）

**步骤5.1：功能对比测试**
- 逐项对比原版功能
- 记录差异
- **等待你的确认**

**步骤5.2：修复差异**
- 修复发现的问题
- 再次测试
- **等待你的确认**

**步骤5.3：性能优化**
- 检查性能
- 必要的优化
- **等待你的确认**

---

## 七、预计的技术难点

### 7.1 状态系统的复杂性

**难点描述：**
原项目的State系统非常复杂，包含：
- 递归的属性查找（findState/findStatePath）
- 多来源影响的优先级计算
- 字典类型的嵌套State

**解决方案：**
- 完全保留原有逻辑，只做语法转换
- 增加详细的类型注解
- 编写单元测试确保行为一致

### 7.2 jQuery到Vue的DOM操作转换

**难点描述：**
原项目大量使用jQuery的DOM操作和事件委托

**解决方案：**
- 使用Vue的模板语法替代DOM操作
- 使用@click等指令替代事件委托
- 保持相同的事件处理逻辑

### 7.3 对象引用和响应式

**难点描述：**
原项目对象间有大量相互引用，Vue的响应式可能导致问题

**解决方案：**
- 核心对象保持为普通类实例
- 只在Store层面使用ref/reactive
- 关键操作后手动触发更新

### 7.4 中文命名的TypeScript支持

**难点描述：**
TypeScript对中文属性名的支持需要特殊处理

**解决方案：**
- 使用字符串字面量类型
- 接口定义使用引号包裹中文属性
- 示例：`interface Bug { "名称": string }`

### 7.5 创意工坊的插件系统设计

**难点描述：**
需要设计一个灵活的插件系统

**解决方案（初步设想，需要你的意见）：**
```typescript
// 插件接口
interface BugWorldPlugin {
  name: string
  version: string

  // 注册新的对象类型
  registerObjectType?: (type: string, definition: any) => void

  // 注册新的Tile组件
  registerTile?: (component: Component) => void

  // 添加新的数据
  addData?: (type: string, data: any) => void

  // 生命周期钩子
  onGameStart?: () => void
  onTurnEnd?: () => void
}
```

---

## 八、决策记录（已确认）

### ✅ 决策1：响应式方案
**采用方案A** — 核心对象保持普通JS类实例，Store中用ref包装，改动最小。

### ✅ 决策2：迁移顺序
**同意** — State系统 → Object类 → UI组件。

### ✅ 决策3：测试策略
**一次性全部迁移完成**，不做逐模块停顿测试。

### ✅ 决策4：旧代码处理
**新建独立项目目录**，原项目完整保留不动。

### ✅ 决策5：创意工坊
**先完成基础迁移**，但必须在架构上预留足够的创意工坊接口，不能事后难以扩展。

---

## 九、创意工坊接口设计（必须预留）

根据决策5，虽然第一版不实现完整的创意工坊功能，但必须在架构层面预留足够的扩展接口。

### 9.1 插件系统接口

**核心插件接口定义**
```typescript
// src/plugins/types.ts
export interface BugWorldPlugin {
  // 插件元信息
  name: string
  version: string
  author?: string
  description?: string

  // 数据扩展
  data?: {
    bugs?: Record<string, any>          // 新虫群类型
    facilities?: Record<string, any>    // 新设施类型
    works?: Record<string, any>         // 新工作类型
    events?: Record<string, any>        // 新事件类型
    characteristics?: Record<string, any> // 新特性
  }

  // 函数库扩展
  functions?: {
    bugFunctions?: Record<string, any>
    facilityFunctions?: Record<string, any>
    workFunctions?: Record<string, any>
    eventFunctions?: Record<string, any>
  }

  // 组件扩展
  components?: {
    tiles?: Record<string, Component>   // 新Tile组件
    menus?: Record<string, Component>   // 新菜单组件
  }

  // 生命周期钩子
  hooks?: {
    onGameStart?: () => void
    onGameLoad?: (saveData: any) => void
    onTurnStart?: (turn: number) => void
    onTurnEnd?: (turn: number) => void
    onBugNestCreate?: (bugNest: any) => void
  }
}

// 插件管理器
export interface PluginManager {
  // 注册插件
  register(plugin: BugWorldPlugin): void

  // 卸载插件
  unregister(pluginName: string): void

  // 获取所有插件
  getAll(): BugWorldPlugin[]

  // 获取指定插件
  get(pluginName: string): BugWorldPlugin | undefined

  // 触发钩子
  triggerHook(hookName: string, ...args: any[]): void
}
```

### 9.2 数据扩展接口

**library模块必须支持动态注册**
```typescript
// src/library/registry.ts
export class DataRegistry {
  private static bugs = new Map<string, any>()
  private static facilities = new Map<string, any>()
  private static works = new Map<string, any>()

  // 注册新数据
  static registerBug(key: string, data: any) {
    this.bugs.set(key, data)
  }

  // 获取数据（包含插件数据）
  static getBug(key: string) {
    return this.bugs.get(key)
  }

  // 类似的方法用于其他类型...
}
```

### 9.3 组件扩展接口

**Tile组件必须支持动态注册**
```typescript
// src/components/registry.ts
export class ComponentRegistry {
  private static tiles = new Map<string, Component>()

  // 注册新Tile
  static registerTile(name: string, component: Component) {
    this.tiles.set(name, component)
  }

  // 获取Tile
  static getTile(name: string) {
    return this.tiles.get(name)
  }

  // 获取所有Tile
  static getAllTiles() {
    return Array.from(this.tiles.entries())
  }
}
```

### 9.4 事件总线接口

**标准化的事件通信机制**
```typescript
// src/utils/eventBus.ts
export interface GameEvent {
  type: string
  data?: any
  timestamp: number
}

export class EventBus {
  private static listeners = new Map<string, Function[]>()

  // 订阅事件
  static on(eventType: string, handler: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(handler)
  }

  // 发布事件
  static emit(eventType: string, data?: any) {
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  // 取消订阅
  static off(eventType: string, handler: Function) {
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
}
```

### 9.5 必须实现的扩展点

在第一版迁移中，以下扩展点必须实现：

1. ✅ **数据注册机制** - DataRegistry类
2. ✅ **组件注册机制** - ComponentRegistry类
3. ✅ **事件总线** - EventBus类
4. ✅ **插件接口定义** - BugWorldPlugin接口
5. ✅ **插件管理器骨架** - PluginManager基础实现（可以是空的，但接口要定义好）

### 9.6 文档要求

必须在第一版完成时提供：
- 插件开发文档模板
- 数据格式说明文档
- 扩展接口API文档

---

## 十、下一步行动

请你审阅这份方案，并：

1. **确认或修改**目录结构设计
2. **回答**第八章节的5个决策问题
3. **指定**希望我首先开始的工作

在你批准方案并给出指示之前，我不会开始编写任何代码。

---

## 附录：关键文件对照表

| 功能 | 原文件 | 新文件 | 优先级 |
|-----|-------|-------|--------|
| 状态系统 | State/State.js | core/state/State.ts | 高 |
| 影响系统 | State/Impact.js | core/state/Impact.ts | 高 |
| 基础对象 | Object/Object.js | core/objects/Object.ts | 高 |
| 虫群对象 | Object/Bug.js | core/objects/Bug.ts | 高 |
| 虫巢对象 | Object/BugNest.js | core/objects/BugNest.ts | 高 |
| 工作对象 | Object/Work.js | core/objects/Work.ts | 高 |
| 设施对象 | Object/Facility.js | core/objects/Facility.ts | 中 |
| 事件对象 | Object/Event.js | core/objects/Event.ts | 中 |
| 日志组件 | Tiles/logTile.js | components/tiles/LogTile.vue | 高 |
| 虫巢信息 | Tiles/bugNestTile.js | components/tiles/BugNestTile.vue | 高 |
| 工作信息 | Tiles/work_tile/workTile.js | components/tiles/WorkTile.vue | 中 |
| 游戏启动 | app/start.js | views/GameView.vue | 高 |
