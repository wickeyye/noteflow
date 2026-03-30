# NoteFlow 项目指南

## 项目概述

NoteFlow 是一个简洁高效的笔记应用，采用深色主题设计。

- **当前版本**: v1.0.0-beta (云端同步已启用)
- **技术栈**: React 19 + TypeScript 5.9 + Vite 8
- **包管理器**: npm
- **数据存储**: LocalStorage (按用户隔离) + Supabase (云端同步已启用)

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
- ✅ 标签系统 (多标签支持)
- ✅ 收藏功能 (标签页切换)

### 导入导出
- ✅ 导出单个笔记为 Markdown
- ✅ 导出所有笔记为 ZIP
- ✅ 导入单个 Markdown 文件
- ✅ 导入 ZIP 批量笔记

### 云端同步
- ✅ Supabase 用户认证 (登录/注册)
- ✅ 访客模式 (离线使用)
- ✅ LocalStorage 按用户隔离 (每个账户独立存储空间)
- ✅ 云端数据同步 (已启用，30秒自动同步)
- ✅ 冲突解决策略 (Last Write Wins)
- ✅ 初始同步 (登录时自动同步)
- ✅ 定时同步 (每30秒自动同步)

### 用户体验
- ✅ 快捷键支持:
  - Ctrl/Cmd + N: 新建笔记
  - Ctrl/Cmd + S: 保存提示
  - Ctrl/Cmd + F: 聚焦搜索
  - Ctrl/Cmd + Delete: 删除笔记
- ✅ 删除确认对话框
- ✅ 错误处理和数据验证
- ✅ 字号自定义 (12-32px)
- ✅ 文字颜色自定义

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

## 当前问题和待修复事项

### 🚧 Supabase 云端同步问题（优先级：P0）

**问题描述**：
- Supabase RLS (Row Level Security) 策略配置不正确
- 导致笔记无法同步到云端（"new row violates row-level security policy" 错误）

**已完成的工作**：
- ✅ 实现 LocalStorage 按用户隔离（`noteflow_notes_<userId>`）
- ✅ 实现 Last Write Wins 同步策略
- ✅ 修复多账户笔记混淆问题
- ✅ 创建 `fix-rls-final.sql` 脚本
- ✅ 重新启用云端同步代码（`App.tsx` 第56-80行）
- ✅ 创建测试工具 `test-cloud-sync.html`
- ✅ 创建测试计划 `docs/SYNC_TEST_PLAN.md`

**下一步修复步骤**：
1. 在 Supabase Dashboard 执行 `fix-rls-final.sql` 脚本
   - 确保 `user_id` 字段类型为 `uuid`（不是 `text`）
   - 创建正确的 RLS 策略（`auth.uid() = user_id`，无需类型转换）
2. 验证 RLS 策略是否正确创建
3. 使用 `test-cloud-sync.html` 测试 CRUD 操作
4. 测试完整流程：
   - 登录 → 创建笔记 → 登出 → 再登录 → 验证笔记是否还在
   - 检查 Supabase 表中是否有数据
   - 验证多设备同步是否正常

**相关文件**：
- `fix-rls-final.sql` - RLS 策略修复脚本
- `src/App.tsx` - 同步代码（第56-80行已注释）
- `src/lib/sync.ts` - 同步逻辑实现
- `src/utils/storage.ts` - LocalStorage 工具函数

---

## 下一阶段计划 (v1.0.0)

### 待实现功能
- [ ] 完成 Supabase 云端同步（当前优先级 P0）
- [ ] 导出为 PDF
- [ ] 笔记分类/文件夹
- [ ] 实时协作 (WebSocket)
- [ ] 笔记分享功能

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
- 所有笔记数据存储在 LocalStorage（按用户隔离）
- 存储键格式：`noteflow_notes_<userId>` 或 `noteflow_notes_guest`（访客模式）
- 使用 `storage.ts` 工具函数进行读写
- 每次修改自动保存
- 云端同步暂时禁用（见下方"当前问题"）

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
