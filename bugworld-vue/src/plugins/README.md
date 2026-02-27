# BugWorld 插件系统

BugWorld 提供了完整的插件系统，允许开发者扩展游戏功能，添加自定义内容。

## 核心功能

### 1. 数据注册表 (DataRegistry)

用于注册自定义游戏数据，包括：
- 虫群 (Bug)
- 设施 (Facility)
- 工作 (Work)
- 事件 (Event)
- 特性 (Characteristic)
- 区域 (Area)

### 2. 组件注册表 (ComponentRegistry)

用于注册自定义 Vue 组件：
- Tile 组件（游戏面板）
- UI 组件（界面元素）

### 3. 事件总线 (EventBus)

用于监听和响应游戏事件：
- 游戏生命周期事件
- 回合事件
- 虫巢/虫群事件
- 工作/设施事件
- UI 事件

### 4. 插件管理器 (PluginManager)

用于管理插件的安装、卸载和配置。

## 快速开始

### 创建插件

```typescript
import { Plugin, PluginContext } from '@/plugins'

const myPlugin: Plugin = {
  id: 'my-plugin',
  name: '我的插件',
  version: '1.0.0',
  description: '插件描述',
  author: '作者名',

  // 可选：声明依赖的其他插件
  dependencies: ['other-plugin-id'],

  // 安装函数
  install(context: PluginContext) {
    // 注册数据
    context.dataRegistry.registerBug('custom_bug', { ... })

    // 注册组件
    context.componentRegistry.registerTile('custom-tile', MyComponent, '自定义面板')

    // 监听事件
    context.eventBus.on('bug:create', (event) => {
      console.log('虫子创建:', event.bug)
    })
  },

  // 可选：卸载函数
  uninstall() {
    // 清理资源
  }
}

export default myPlugin
```

### 注册插件

```typescript
import { pluginManager } from '@/plugins'
import myPlugin from './myPlugin'

// 设置插件配置（可选）
pluginManager.setConfig('my-plugin', {
  enableDebugLog: true,
  customOption: 'value'
})

// 注册插件
await pluginManager.register(myPlugin)
```

### 卸载插件

```typescript
await pluginManager.unregister('my-plugin')
```

## API 参考

### DataRegistry

```typescript
// 注册虫群
dataRegistry.registerBug(key: string, data: any)

// 注册设施
dataRegistry.registerFacility(key: string, data: any)

// 注册工作
dataRegistry.registerWork(key: string, data: any)

// 注册事件
dataRegistry.registerEvent(key: string, data: any)

// 注册特性
dataRegistry.registerCharacteristic(key: string, data: any)

// 注册区域
dataRegistry.registerArea(key: string, data: any)

// 获取数据
dataRegistry.getBug(key: string)
dataRegistry.getAllBugs()
```

### ComponentRegistry

```typescript
// 注册 Tile 组件
componentRegistry.registerTile(
  key: string,
  component: Component,
  name: string,
  description?: string,
  category?: string
)

// 注册 UI 组件
componentRegistry.registerUIComponent(
  key: string,
  component: Component,
  name: string,
  description?: string,
  category?: string
)

// 获取组件
componentRegistry.getTile(key: string)
componentRegistry.getAllTiles()
componentRegistry.getTilesByCategory(category: string)
```

### EventBus

```typescript
// 监听事件
eventBus.on('bug:create', (event) => { ... })

// 监听一次性事件
eventBus.once('game:start', () => { ... })

// 取消监听
eventBus.off('bug:create', handler)

// 发送事件
eventBus.emit('bug:create', { bug: myBug })
```

### 可用事件列表

- `game:start` - 游戏开始
- `game:pause` - 游戏暂停
- `game:resume` - 游戏恢复
- `game:end` - 游戏结束
- `turn:start` - 回合开始
- `turn:end` - 回合结束
- `bugNest:create` - 虫巢创建
- `bugNest:focus` - 虫巢聚焦
- `bug:create` - 虫子创建
- `bug:join` - 虫子加入
- `work:start` - 工作开始
- `work:stop` - 工作停止
- `work:complete` - 工作完成
- `facility:create` - 设施创建
- `facility:join` - 设施加入
- `event:start` - 事件开始
- `event:end` - 事件结束
- `ui:tileOpen` - 面板打开
- `ui:tileClose` - 面板关闭

## 示例

查看 `src/plugins/examples/examplePlugin.ts` 获取完整的插件示例。

## 注意事项

1. **插件 ID 唯一性**：每个插件必须有唯一的 ID
2. **依赖管理**：如果插件依赖其他插件，需要在 `dependencies` 中声明
3. **资源清理**：在 `uninstall` 函数中清理插件创建的资源
4. **错误处理**：插件安装失败会抛出异常，需要妥善处理
5. **中文命名**：保持项目特色，数据注册时使用中文命名

## 开发建议

1. 使用 TypeScript 开发插件以获得类型提示
2. 遵循游戏原有的数据结构和命名规范
3. 充分利用事件系统实现松耦合
4. 为插件提供详细的文档和示例
5. 测试插件的安装、运行和卸载流程
