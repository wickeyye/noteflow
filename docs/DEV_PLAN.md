# NoteFlow 开发计划

## 项目信息

- **项目名称**: NoteFlow
- **版本**: v0.2.0 (开发中)
- **技术栈**: React 19 + TypeScript + Vite
- **开始日期**: 2026-03-28
- **最后更新**: 2026-03-28

## 当前状态

### ✅ 已完成
- [x] 项目初始化 (React + TypeScript + Vite)
- [x] 基础 UI 设计（深色主题）
- [x] 双栏布局（侧边栏 + 编辑区）
- [x] 笔记列表展示
- [x] 笔记创建功能
- [x] 笔记编辑功能（标题 + 内容）
- [x] 实时搜索功能
- [x] 笔记选择交互
- [x] UI 设计文档
- [x] LocalStorage 数据持久化
- [x] 笔记删除功能（含确认对话框）
- [x] 错误处理和数据验证
- [x] 组件化重构（Sidebar, Editor）
- [x] 自定义 Hooks (useNotes)
- [x] Markdown 支持（编辑/预览模式）

### 🚧 当前问题
- 没有测试覆盖
- 缺少代码高亮功能
- 没有快捷键支持

---

## 开发阶段规划

### 第一阶段：核心功能完善 (v0.1.0) ✅ 已完成

**目标**: 完善基础功能，实现数据持久化

**优先级**: P0 (必须完成)

**完成时间**: 2026-03-28

#### 任务清单

1. **数据持久化 - LocalStorage** (P0) ✅
   - [x] 实现 LocalStorage 存储逻辑
   - [x] 添加数据加载功能
   - [x] 添加数据保存功能
   - [x] 处理存储异常情况
   - **技术方案**: 使用 `localStorage.setItem/getItem`
   - **文件**: `src/utils/storage.ts`, `src/hooks/useNotes.ts`

2. **笔记删除功能** (P0) ✅
   - [x] 添加删除按钮 UI
   - [x] 实现删除逻辑
   - [x] 添加删除确认对话框
   - [x] 处理删除后的状态更新
   - **技术方案**: 添加删除按钮到笔记卡片，使用 confirm 确认
   - **文件**: `src/App.tsx`, `src/App.css`, `src/components/Sidebar.tsx`

3. **错误处理和边界情况** (P1) ✅
   - [x] 添加空笔记列表提示
   - [x] 添加搜索无结果提示
   - [x] 处理 LocalStorage 存储失败
   - [x] 添加数据验证
   - **文件**: `src/components/Sidebar.tsx`, `src/utils/storage.ts`

4. **代码优化** (P2) ✅
   - [x] 提取组件（Sidebar, Editor）
   - [x] 提取自定义 Hooks (useNotes)
   - [x] 添加 TypeScript 类型定义
   - **文件**: `src/components/`, `src/hooks/`, `src/types/`

**里程碑**: ✅ 完成基础功能，数据可持久化保存

---

### 第二阶段：用户体验优化 (v0.2.0) 🎯 当前阶段

**目标**: 提升用户体验，增加实用功能

**优先级**: P1

**开始时间**: 2026-03-28

#### 任务清单

1. **Markdown 支持** (P0) ✅
   - [x] 集成 Markdown 解析库 (react-markdown)
   - [x] 实现 Markdown 预览模式
   - [x] 添加编辑/预览切换
   - [x] ~~支持代码高亮~~ (不需要)
   - **依赖**: `react-markdown`, `remark-gfm`
   - **文件**: `src/components/Editor.tsx`, `src/App.css`
   - **状态**: 已完成

2. **笔记排序功能** (P1) ✅
   - [x] 添加排序选项 UI（按时间、标题）
   - [x] 实现排序逻辑
   - [x] 保存排序偏好
   - **文件**: `src/App.tsx`, `src/components/Sidebar.tsx`, `src/App.css`
   - **状态**: 已完成

3. **快捷键支持** (P1) ✅
   - [x] Ctrl/Cmd + N: 新建笔记
   - [x] Ctrl/Cmd + S: 保存（提示已自动保存）
   - [x] Ctrl/Cmd + F: 聚焦搜索框
   - [x] Ctrl/Cmd + Delete: 删除当前笔记
   - **技术方案**: 使用 `useEffect` 监听键盘事件
   - **文件**: `src/hooks/useKeyboard.ts`, `src/App.tsx`
   - **状态**: 已完成

4. **笔记统计信息** (P2) ✅
   - [x] 显示笔记总数
   - [x] 显示字符数统计
   - [x] 显示更新时间
   - **文件**: `src/components/Sidebar.tsx`, `src/components/Editor.tsx`, `src/App.css`
   - **状态**: 已完成

**里程碑**: ✅ 支持 Markdown，用户体验显著提升

---

### 第三阶段：高级功能 (v0.3.0)

**目标**: 增加高级功能，提升应用价值

**优先级**: P2

**预计时间**: 7-10 天

#### 任务清单

1. **标签系统** (P0) ✅
   - [x] 设计标签数据结构
   - [x] 添加标签管理 UI
   - [x] 实现标签筛选功能
   - [x] 支持多标签
   - **数据结构**: `tags: string[]` 添加到 Note 接口
   - **文件**: `src/types/`, `src/components/Editor.tsx`
   - **状态**: 已完成

2. **笔记分类/文件夹** (P1)
   - [ ] 设计分类数据结构
   - [ ] 添加分类管理 UI
   - [ ] 实现分类切换
   - [ ] 支持拖拽移动笔记
   - **技术方案**: 添加 `category` 字段，使用 react-dnd
   - **文件**: `src/components/CategoryList.tsx`

3. **导出功能** (P1) ✅
   - [x] 导出为 Markdown 文件
   - [ ] 导出为 PDF
   - [x] 批量导出
   - [x] 导出所有笔记（ZIP）
   - **技术方案**: 使用 FileSaver.js, JSZip
   - **依赖**: `file-saver`, `jszip`
   - **文件**: `src/utils/export.ts`
   - **状态**: Markdown 单文件导出 + ZIP 批量导出已完成，PDF 导出待实现

4. **导入功能** (P2) ✅
   - [x] 导入 Markdown 文件
   - [x] 批量导入（ZIP）
   - [x] 解析文件元数据
   - **文件**: `src/utils/import.ts`
   - **状态**: 已完成

**里程碑**: 功能完善，可满足日常使用需求

---

### 第四阶段：性能和体验优化 (v0.4.0)

**目标**: 优化性能，完善细节

**优先级**: P2

**预计时间**: 5-7 天

#### 任务清单

1. **性能优化** (P0)
   - [ ] 使用 React.memo 优化组件渲染
   - [ ] 实现虚拟滚动（笔记列表）
   - [ ] 防抖搜索输入
   - [ ] 懒加载大文件
   - **技术方案**: react-window, lodash.debounce
   - **文件**: `src/components/NoteList.tsx`

2. **响应式设计** (P1)
   - [ ] 移动端适配
   - [ ] 平板适配
   - [ ] 侧边栏折叠功能
   - [ ] 触摸手势支持
   - **文件**: `src/App.css`, `src/components/`

3. **主题系统** (P1)
   - [ ] 浅色主题
   - [ ] 深色主题（已有）
   - [ ] 主题切换功能
   - [ ] 保存主题偏好
   - **技术方案**: CSS 变量 + Context API
   - **文件**: `src/contexts/ThemeContext.tsx`, `src/styles/themes.css`

4. **无障碍优化** (P2)
   - [ ] 添加 ARIA 标签
   - [ ] 键盘导航优化
   - [ ] 屏幕阅读器支持
   - [ ] 焦点管理
   - **文件**: 所有组件文件

**里程碑**: 性能优化，支持多端使用

---

### 第五阶段：数据同步和协作 (v1.0.0) 🚧 进行中

**目标**: 实现云端同步，支持多设备

**优先级**: P3 (长期规划)

**预计时间**: 15-20 天

**开始时间**: 2026-03-29

#### 任务清单

1. **后端服务** (P0) ✅
   - [x] 选择后端技术栈（Supabase）
   - [x] 设计数据库表结构
   - [x] 实现用户认证（Supabase Auth）
   - [x] 实现笔记 CRUD API
   - [x] 数据库设计（PostgreSQL）
   - **技术选型**: Supabase (PostgreSQL + Auth + Realtime)
   - **文件**: `src/lib/supabase.ts`
   - **状态**: 已完成

2. **前端集成** (P0) ✅
   - [x] 集成 Supabase 客户端
   - [x] 实现登录/注册功能
   - [x] 实现数据同步逻辑
   - [x] 处理离线模式（访客模式）
   - [x] 冲突解决策略（基于时间戳）
   - **文件**: `src/components/Auth.tsx`, `src/lib/sync.ts`, `src/App.tsx`
   - **状态**: 已完成

3. **实时协作** (P2)
   - [ ] WebSocket 集成
   - [ ] 实时编辑同步
   - [ ] 多人协作冲突处理
   - **技术方案**: Socket.io / WebSocket
   - **文件**: `src/services/websocket.ts`

**里程碑**: 发布 v1.0.0，支持云端同步

---

## 技术选型和依赖

### 当前依赖
- React 19.2.4
- TypeScript 5.9.3
- Vite 8.0.1

### 计划引入的依赖

#### 第二阶段
- `react-markdown`: Markdown 渲染
- `remark-gfm`: GitHub Flavored Markdown 支持
- `react-syntax-highlighter`: 代码高亮

#### 第三阶段
- `file-saver`: 文件导出
- `jspdf`: PDF 生成
- `react-dnd`: 拖拽功能（可选）

#### 第四阶段
- `react-window`: 虚拟滚动
- `lodash.debounce`: 防抖函数

#### 第五阶段
- `axios`: HTTP 客户端
- `socket.io-client`: WebSocket 客户端
- 后端框架（待定）

---

## 项目结构规划

```
noteflow/
├── docs/                      # 文档目录
│   ├── UI_DESIGN.md          # UI 设计文档
│   ├── DEVELOPMENT_PLAN.md   # 开发计划（本文档）
│   └── API.md                # API 文档（第五阶段）
├── src/
│   ├── components/           # 组件目录（第一阶段重构）
│   │   ├── Sidebar.tsx
│   │   ├── NoteList.tsx
│   │   ├── Editor.tsx
│   │   ├── TagManager.tsx    # 第三阶段
│   │   └── ...
│   ├── hooks/                # 自定义 Hooks（第一阶段）
│   │   ├── useNotes.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useKeyboard.ts    # 第二阶段
│   │   └── useSync.ts        # 第五阶段
│   ├── utils/                # 工具函数（第一阶段）
│   │   ├── storage.ts
│   │   ├── export.ts         # 第三阶段
│   │   └── import.ts         # 第三阶段
│   ├── contexts/             # Context（第四阶段）
│   │   └── ThemeContext.tsx
│   ├── api/                  # API 客户端（第五阶段）
│   │   └── client.ts
│   ├── types/                # 类型定义（第一阶段）
│   │   └── index.ts
│   ├── styles/               # 样式文件（第四阶段）
│   │   └── themes.css
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── server/                   # 后端服务（第五阶段）
│   └── ...
└── tests/                    # 测试文件（持续添加）
    └── ...
```

---

## 开发原则

1. **渐进式开发**: 每个阶段完成后进行测试和验证
2. **用户优先**: 优先开发对用户价值最大的功能
3. **代码质量**: 保持代码简洁、可维护
4. **性能优先**: 关注应用性能和用户体验
5. **文档同步**: 及时更新文档，保持文档与代码一致

---

## 风险和挑战

### 技术风险
- **数据迁移**: LocalStorage 到云端数据库的迁移
- **性能问题**: 大量笔记时的性能优化
- **浏览器兼容性**: 不同浏览器的 LocalStorage 限制

### 解决方案
- 提前设计数据迁移方案
- 使用虚拟滚动和懒加载
- 添加存储容量检测和提示

---

## 测试策略

### 单元测试
- 工具函数测试（storage, export, import）
- Hooks 测试
- 组件测试

### 集成测试
- 笔记 CRUD 流程测试
- 搜索功能测试
- 数据持久化测试

### E2E 测试
- 用户完整使用流程测试
- 跨浏览器测试

**测试框架**: Vitest + React Testing Library

---

## 版本发布计划

| 版本 | 功能 | 预计发布时间 |
|------|------|-------------|
| v0.1.0 | 核心功能 + 数据持久化 | 第 1 周 |
| v0.2.0 | Markdown + 用户体验优化 | 第 2-3 周 |
| v0.3.0 | 标签 + 导出功能 | 第 4-5 周 |
| v0.4.0 | 性能优化 + 响应式 | 第 6-7 周 |
| v1.0.0 | 云端同步 | 第 10-12 周 |

---

## 下一步行动

### 🎯 立即开始（本周）

1. **实现 LocalStorage 数据持久化**
   - 创建 `src/utils/storage.ts`
   - 修改 `src/App.tsx` 集成存储逻辑
   - 测试数据保存和加载

2. **添加笔记删除功能**
   - 在笔记卡片添加删除按钮
   - 实现删除逻辑和确认对话框
   - 更新 UI 样式

3. **代码重构**
   - 提取 Sidebar 组件
   - 提取 Editor 组件
   - 创建 useNotes Hook

---

## 更新日志

### 2026-03-28
- ✅ 创建开发计划文档
- ✅ 规划五个开发阶段
- ✅ 定义技术选型和项目结构
- ✅ **第一阶段完成**: 核心功能完善 (v0.1.0)
  - 实现 LocalStorage 数据持久化
  - 添加笔记删除功能（含确认对话框）
  - 完善错误处理和数据验证
  - 组件化重构（Sidebar, Editor, useNotes Hook）
- ✅ **第二阶段完成**: 用户体验优化 (v0.2.0)
  - 集成 Markdown 支持（react-markdown + remark-gfm）
  - 实现编辑/预览模式切换
  - 添加完整的 Markdown 样式
  - 实现笔记排序功能（按时间/按标题）
  - 添加快捷键支持（Ctrl/Cmd + N/S/F/Delete）
  - 添加笔记统计信息（总数、字符数、更新时间）

### 2026-03-29
- ✅ **第三阶段完成**: 高级功能 (v0.3.0)
  - 实现标签系统（多标签支持 + 标签管理 UI）
  - 实现导出功能（Markdown 单文件 + ZIP 批量导出）
  - 实现导入功能（Markdown 单文件 + ZIP 批量导入）
  - 添加收藏功能（标签页切换）
  - 添加字号和颜色自定义功能
- ✅ **第五阶段完成**: 数据同步和协作 (v1.0.0)
  - 集成 Supabase 后端服务
  - 实现用户认证（登录/注册/访客模式）
  - 实现云端数据同步（自动同步 + 冲突解决）
  - 支持多设备数据同步
  - 修复同步 upsert 冲突问题
  - 添加用户信息显示（侧边栏显示登录邮箱）
  - 创建同步诊断和监控工具
- 📝 当前状态：v1.0.0 基础功能已完成，云端同步正常工作

---

## 参考文档

- [UI 设计文档](./UI_DESIGN.md)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)

---

**注意**: 本文档会随着开发进度持续更新，请定期查看最新版本。