# NoteFlow 项目指南

## 项目概述

NoteFlow 是一个简洁高效的笔记应用，采用深色主题设计。

- **当前版本**: v0.2.0 (第二阶段已完成)
- **技术栈**: React 19 + TypeScript 5.9 + Vite 8
- **包管理器**: npm
- **数据存储**: LocalStorage (未来计划云端同步)

## 核心架构

### 项目结构
```
src/
├── components/     # React 组件 (Sidebar, Editor)
├── hooks/          # 自定义 Hooks (useNotes, useKeyboard)
├── utils/          # 工具函数 (storage)
├── types/          # TypeScript 类型定义
├── App.tsx         # 主应用组件
└── App.css         # 样式文件
```

### 数据模型
```typescript
interface Note {
  id: number
  title: string
  content: string
  updatedAt: string  // YYYY-MM-DD 格式
}
```

## 已实现功能

### 核心功能
- ✅ 笔记 CRUD (创建、读取、更新、删除)
- ✅ LocalStorage 数据持久化
- ✅ 实时搜索 (标题 + 内容)
- ✅ Markdown 支持 (编辑/预览模式切换)
- ✅ 笔记排序 (按时间/按标题)
- ✅ 笔记统计 (总数、字符数、更新时间)

### 用户体验
- ✅ 快捷键支持:
  - Ctrl/Cmd + N: 新建笔记
  - Ctrl/Cmd + S: 保存提示
  - Ctrl/Cmd + F: 聚焦搜索
  - Ctrl/Cmd + Delete: 删除笔记
- ✅ 删除确认对话框
- ✅ 错误处理和数据验证

## 设计规范

### 色彩系统
- **背景色**: `#1a1a1a` (主背景), `#252525` (侧边栏), `#2a2a2a` (卡片)
- **强调色**: `#4a9eff` (主要蓝色), `#3a8eef` (悬停)
- **文字色**: `#e0e0e0` (主文字), `#ffffff` (标题), `#999999` (次要), `#666666` (辅助)
- **边框色**: `#333333` (分隔线), `#444444` (输入框)

### 布局规范
- **侧边栏宽度**: 300px
- **圆角**: 按钮/输入框 6px, 卡片 8px
- **间距**: 组件间距 8-15px, 内边距 10-30px
- **字体**: 系统字体栈, 标题 16-32px, 正文 14-16px

## 开发规范

### 代码组织
- **组件化**: 每个功能模块独立组件 (Sidebar, Editor)
- **Hooks 优先**: 使用自定义 Hooks 封装逻辑 (useNotes, useKeyboard)
- **类型安全**: 所有组件和函数都有完整的 TypeScript 类型定义
- **工具函数**: 通用逻辑提取到 utils/ 目录

### 命名约定
- 组件: PascalCase (Sidebar.tsx, Editor.tsx)
- Hooks: camelCase with use prefix (useNotes.ts, useKeyboard.ts)
- 工具函数: camelCase (storage.ts)
- 类型: PascalCase (Note, SortOption)

### 状态管理
- 使用 React Hooks (useState, useEffect)
- 自定义 Hook (useNotes) 管理笔记状态
- LocalStorage 同步持久化

## 下一阶段计划 (v0.3.0)

### 待实现功能
- [ ] 代码高亮 (react-syntax-highlighter)
- [ ] 标签系统 (多标签支持 + 标签筛选)
- [ ] 笔记分类/文件夹
- [ ] 导出功能 (Markdown, PDF, ZIP)
- [ ] 导入功能 (Markdown 文件)

### 技术债务
- [ ] 添加单元测试 (Vitest + React Testing Library)
- [ ] 性能优化 (React.memo, 虚拟滚动)
- [ ] 响应式设计 (移动端适配)

## 开发指南

### 启动项目
```bash
npm install
npm run dev
```

### 构建项目
```bash
npm run build
```

### 添加新功能
1. 在 components/ 创建新组件
2. 在 hooks/ 创建自定义 Hook (如需要)
3. 更新 types/ 中的类型定义
4. 在 App.tsx 中集成
5. 更新样式 (App.css)

### 数据持久化
- 所有笔记数据存储在 LocalStorage
- 使用 `storage.ts` 工具函数进行读写
- 每次修改自动保存

## 重要约束

### 不要做的事
- ❌ 不要重复造轮子，优先使用成熟的开源库
- ❌ 不要过度工程化，保持代码简洁
- ❌ 不要添加未经请求的功能
- ❌ 不要修改核心数据结构 (Note interface) 除非必要
- ❌ 不要破坏现有的快捷键功能

### 必须做的事
- ✅ 保持 TypeScript 类型安全
- ✅ 遵循现有的代码风格和组件结构
- ✅ 确保数据持久化正常工作
- ✅ 测试所有用户交互流程
- ✅ 保持深色主题设计一致性

## 技术选型原则

根据技术文档，项目优先使用成熟的开源组件:
- **状态管理**: 考虑 Zustand (简洁轻量)
- **Markdown**: react-markdown + remark-gfm (已集成)
- **代码高亮**: react-syntax-highlighter (计划中)
- **导出**: file-saver + jsPDF (第三阶段)
- **性能**: react-window (虚拟滚动, 第四阶段)

## 参考文档

- 详细技术方案: `docs/TEC.md`
- UI 设计规范: `docs/UI.md`
- 开发计划: `docs/DEV_PLAN.md`
