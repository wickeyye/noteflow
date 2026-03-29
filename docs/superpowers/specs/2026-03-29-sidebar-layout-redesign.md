# NoteFlow 侧边栏布局重设计

## 概述

重新设计 NoteFlow 的左侧边栏布局，参考印象笔记的层级结构，实现固定分类 + 紧凑列表的设计，提高空间利用率，在有限空间内显示更多笔记。

## 设计目标

1. **层级结构**：添加可折叠的固定分类区域（最近、收藏、全部笔记）
2. **紧凑显示**：笔记列表项只显示标题和日期，去掉内容预览
3. **空间优化**：减少内边距和间距，在相同空间内显示更多笔记（从 ~6 条增加到 ~12 条）
4. **功能保持**：保留现有的搜索、排序、标签筛选功能

## 用户需求

- 在有限的侧边栏空间中看到更多笔记列表
- 清晰的层级结构，方便快速定位笔记
- 支持收藏重要笔记，快速访问
- 查看最近编辑的笔记

## 架构设计

### 1. 数据模型变化

在 `Note` 接口中添加 `isFavorite` 字段：

```typescript
interface Note {
  id: number
  title: string
  content: string
  updatedAt: string
  tags?: string[]
  isFavorite?: boolean  // 新增：收藏标记
}
```

### 2. 组件结构

**Sidebar 组件重构：**

```
Sidebar
├── SidebarHeader (顶部固定区域)
│   ├── 应用标题和统计
│   ├── 新建按钮
│   └── 搜索框
├── CollapsibleSection (可复用组件)
│   ├── 📌 最近 (最近 7 天编辑的笔记)
│   ├── ⭐ 收藏 (标记为收藏的笔记)
│   └── 📚 全部笔记 (所有笔记 + 标签筛选 + 排序)
└── CompactNoteItem (紧凑笔记项)
    ├── 标题
    ├── 日期
    └── 收藏按钮
```

### 3. 左侧边栏布局结构

**顶部区域（固定）：**
- 应用标题："📝 NoteFlow"
- 笔记统计："共 X 条笔记"
- 新建按钮："+ 新建笔记"
- 搜索框："🔍 搜索笔记..."

**分类区域（可滚动）：**

1. **📌 最近**
   - 显示最近 7 天编辑的笔记
   - 按时间倒序排列
   - 可折叠/展开

2. **⭐ 收藏**
   - 显示标记为收藏的笔记
   - 按时间倒序排列
   - 可折叠/展开

3. **📚 全部笔记**
   - 显示所有笔记
   - 包含排序选项（按时间/按标题）
   - 包含标签筛选
   - 可折叠/展开

## 视觉设计

### 1. 笔记列表项样式变化

**当前样式：**
- 内边距：16px 18px
- 间距：8px
- 标题字号：16px
- 显示：标题 + 内容预览 + 日期
- 高度：约 80px

**新样式：**
- 内边距：10px 14px
- 间距：4px
- 标题字号：14px
- 显示：标题 + 日期（在同一行）
- 高度：约 40px
- 收藏按钮：右侧星标图标

### 2. 分类区域样式

**分类标题：**
- 字号：14px
- 字重：600
- 颜色：var(--text-primary)
- 内边距：12px 16px
- 背景：var(--bg-tertiary)
- 带折叠箭头图标

**分类内容：**
- 折叠动画：max-height + opacity transition
- 展开状态：显示笔记列表
- 折叠状态：隐藏笔记列表

### 3. 空间优化效果

**优化前：**
- 侧边栏高度：约 600px
- 单个笔记项高度：约 80px
- 可见笔记数：约 6 条

**优化后：**
- 侧边栏高度：约 600px
- 单个笔记项高度：约 40px
- 可见笔记数：约 12 条
- 空间利用率提升：100%

## 功能设计

### 1. 收藏功能

**收藏操作：**
- 点击笔记项右侧的星标图标
- 未收藏：☆ (空心星)
- 已收藏：⭐ (实心星)
- 收藏状态实时保存到 LocalStorage

**收藏逻辑：**
- 收藏的笔记同时出现在"收藏"和"全部笔记"分类中
- 取消收藏后从"收藏"分类中移除
- 收藏数量显示在"收藏"分类标题旁

### 2. 折叠/展开功能

**折叠状态管理：**
- 使用 LocalStorage 持久化折叠状态
- 键名：`noteflow_collapsed_sections`
- 值：`{ recent: boolean, favorite: boolean, all: boolean }`

**默认状态：**
- 全部展开

**交互行为：**
- 点击分类标题切换折叠/展开
- 折叠时显示向右箭头 (▶)
- 展开时显示向下箭头 (▼)

### 3. 最近笔记逻辑

**筛选规则：**
- 显示最近 7 天内编辑的笔记
- 按 `updatedAt` 字段倒序排列
- 如果没有最近笔记，显示空状态提示

### 4. 搜索和筛选

**搜索行为：**
- 搜索框在顶部固定位置
- 搜索时在所有分类中搜索
- 搜索结果高亮显示匹配的分类

**标签筛选：**
- 标签筛选移到"全部笔记"分类内部
- 只影响"全部笔记"分类的显示
- 不影响"最近"和"收藏"分类

**排序选项：**
- 排序选项移到"全部笔记"分类内部
- 只影响"全部笔记"分类的显示
- 不影响"最近"和"收藏"分类（始终按时间排序）

## 技术实现

### 1. 数据结构变化

**Note 接口更新：**
```typescript
interface Note {
  id: number
  title: string
  content: string
  updatedAt: string  // YYYY-MM-DD 格式
  tags?: string[]
  isFavorite?: boolean  // 新增
}
```

**折叠状态接口：**
```typescript
interface CollapsedSections {
  recent: boolean
  favorite: boolean
  all: boolean
}
```

### 2. 组件实现

**CollapsibleSection 组件：**
```typescript
interface CollapsibleSectionProps {
  title: string
  icon: string
  count: number
  isCollapsed: boolean
  onToggle: () => void
  children: React.ReactNode
}
```

**CompactNoteItem 组件：**
```typescript
interface CompactNoteItemProps {
  note: Note
  isActive: boolean
  onSelect: () => void
  onToggleFavorite: () => void
  onDelete: (e: React.MouseEvent) => void
}
```

### 3. 状态管理

**新增状态：**
- `collapsedSections: CollapsedSections` - 折叠状态
- 在 `useNotes` Hook 中添加 `toggleFavorite` 方法

**LocalStorage 键：**
- `noteflow_notes` - 笔记数据（已存在）
- `noteflow_sort` - 排序选项（已存在）
- `noteflow_collapsed_sections` - 折叠状态（新增）

### 4. 文件修改清单

**需要修改的文件：**
1. `src/types/index.ts` - 添加 `isFavorite` 字段和 `CollapsedSections` 接口
2. `src/components/Sidebar.tsx` - 重构为分类结构
3. `src/App.css` - 更新样式为紧凑设计
4. `src/hooks/useNotes.ts` - 添加 `toggleFavorite` 方法
5. `src/App.tsx` - 添加折叠状态管理

**不需要修改的文件：**
- `src/components/Editor.tsx` - 编辑器组件保持不变
- `src/hooks/useKeyboard.ts` - 快捷键逻辑保持不变
- `src/utils/storage.ts` - 存储工具保持不变

## 实现步骤

1. **更新类型定义**
   - 在 `types/index.ts` 中添加 `isFavorite` 字段
   - 添加 `CollapsedSections` 接口

2. **更新 useNotes Hook**
   - 添加 `toggleFavorite` 方法
   - 确保新笔记默认 `isFavorite: false`

3. **创建 CollapsibleSection 组件**
   - 实现折叠/展开动画
   - 显示分类标题和笔记数量

4. **重构 Sidebar 组件**
   - 实现三个分类区域
   - 实现紧凑的笔记列表项
   - 添加收藏按钮

5. **更新样式**
   - 减少内边距和间距
   - 添加分类区域样式
   - 添加折叠动画

6. **添加折叠状态管理**
   - 在 App.tsx 中管理折叠状态
   - 持久化到 LocalStorage

7. **测试**
   - 测试收藏/取消收藏功能
   - 测试折叠/展开功能
   - 测试最近笔记筛选
   - 测试搜索和标签筛选

## 兼容性和迁移

**数据迁移：**
- 现有笔记自动添加 `isFavorite: false`
- 不需要手动迁移数据

**向后兼容：**
- 保持现有功能不变
- 只是改变布局和显示方式

## 成功标准

1. ✅ 侧边栏显示三个可折叠分类区域
2. ✅ 笔记列表项只显示标题和日期
3. ✅ 在相同空间内可见笔记数量翻倍（从 6 条到 12 条）
4. ✅ 收藏功能正常工作
5. ✅ 折叠/展开状态持久化
6. ✅ 最近笔记自动筛选（7 天内）
7. ✅ 搜索、排序、标签筛选功能正常
8. ✅ 所有现有功能保持不变

## 风险和注意事项

**潜在风险：**
1. 紧凑设计可能影响可读性 - 通过合理的间距和字号平衡
2. 折叠动画可能影响性能 - 使用 CSS transition 而非 JavaScript 动画
3. 分类过多可能导致混乱 - 限制为三个固定分类

**注意事项：**
- 保持现有功能不变
- 确保数据持久化正常工作
- 测试所有用户交互流程
- 保持深色主题设计一致性
