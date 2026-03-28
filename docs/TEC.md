# NoteFlow 技术方案文档

## 文档说明

本文档提供详细的技术选型和实现方案，**优先使用成熟的开源组件和库**，避免重复造轮子。每个功能模块都提供具体的技术方案、推荐库和代码示例。

**最后更新**: 2026-03-28

---

## 核心技术栈

### 基础框架
- **React 19**: 最新版本，支持 Server Components
- **TypeScript 5.9**: 类型安全
- **Vite 8**: 快速构建工具

### 包管理器
- **推荐**: pnpm (更快、更节省空间)
- **备选**: npm / yarn

---

## 第一阶段：核心功能技术方案

### 1. 数据持久化方案

#### 方案选择：LocalStorage + IndexedDB

**推荐库**: `localforage` (⭐ 24k+)
- 统一的 API，自动选择最佳存储方式
- 支持 IndexedDB、WebSQL、LocalStorage
- 异步 API，不阻塞主线程
- 支持存储大量数据

**安装**:
```bash
pnpm add localforage
```

**实现方案**:

```typescript
// src/utils/storage.ts
import localforage from 'localforage';

// 配置 localforage
localforage.config({
  name: 'NoteFlow',
  storeName: 'notes',
  description: 'NoteFlow 笔记存储'
});

export const storage = {
  async getNotes() {
    return await localforage.getItem('notes') || [];
  },

  async saveNotes(notes: Note[]) {
    await localforage.setItem('notes', notes);
  },

  async clear() {
    await localforage.clear();
  }
};
```

**参考**: [localforage 文档](https://localforage.github.io/localForage/)

---

### 2. 状态管理方案

#### 方案选择：Zustand

**推荐库**: `zustand` (⭐ 47k+)
- 极简 API，学习成本低
- 无需 Provider 包裹
- 支持 TypeScript
- 性能优秀，自动优化渲染
- 体积小（~1KB）

**安装**:
```bash
pnpm add zustand
```

**实现方案**:

```typescript
// src/store/noteStore.ts
import { create } from 'zustand';
import { storage } from '../utils/storage';

interface NoteStore {
  notes: Note[];
  selectedNote: Note | null;
  searchQuery: string;

  // Actions
  loadNotes: () => Promise<void>;
  createNote: () => void;
  updateNote: (id: number, updates: Partial<Note>) => void;
  deleteNote: (id: number) => void;
  selectNote: (note: Note | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  selectedNote: null,
  searchQuery: '',

  loadNotes: async () => {
    const notes = await storage.getNotes();
    set({ notes });
  },

  createNote: () => {
    const newNote: Note = {
      id: Date.now(),
      title: '新建笔记',
      content: '',
      updatedAt: new Date().toISOString()
    };
    const notes = [newNote, ...get().notes];
    set({ notes, selectedNote: newNote });
    storage.saveNotes(notes);
  },

  updateNote: (id, updates) => {
    const notes = get().notes.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    );
    set({ notes });
    storage.saveNotes(notes);
  },

  deleteNote: (id) => {
    const notes = get().notes.filter(note => note.id !== id);
    set({ notes, selectedNote: null });
    storage.saveNotes(notes);
  },

  selectNote: (note) => set({ selectedNote: note }),
  setSearchQuery: (query) => set({ searchQuery: query })
}));
```

**参考**: [Zustand 文档](https://zustand-demo.pmnd.rs/)

---

### 3. UI 组件库方案

#### 方案选择：Headless UI + Tailwind CSS

**推荐方案 1**: `@headlessui/react` + `tailwindcss` (轻量级)
- Headless UI 提供无样式的可访问组件
- Tailwind CSS 提供样式系统
- 完全自定义，符合当前深色主题设计

**推荐方案 2**: `shadcn/ui` (推荐 ⭐)
- 基于 Radix UI + Tailwind CSS
- 复制组件到项目中，完全可控
- 优秀的设计和可访问性
- 包含对话框、下拉菜单等常用组件

**安装 shadcn/ui**:
```bash
pnpm dlx shadcn@latest init
```

**需要的组件**:
```bash
pnpm dlx shadcn@latest add dialog button input textarea
```

**实现方案 - 删除确认对话框**:

```typescript
// 使用 shadcn/ui 的 Dialog 组件
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function DeleteNoteDialog({ note, onConfirm, onCancel }) {
  return (
    <AlertDialog open={!!note}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除笔记 "{note?.title}" 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**参考**:
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Radix UI 文档](https://www.radix-ui.com/)

---

### 4. 图标方案

#### 方案选择：Lucide React

**推荐库**: `lucide-react` (⭐ 11k+)
- 现代化图标库
- Tree-shakable，只打包使用的图标
- 一致的设计风格
- 支持自定义大小和颜色

**安装**:
```bash
pnpm add lucide-react
```

**使用示例**:
```typescript
import { Plus, Search, Trash2, Edit, Save } from 'lucide-react';

<button onClick={createNote}>
  <Plus size={16} /> 新建笔记
</button>
```

**参考**: [Lucide 图标库](https://lucide.dev/)

---

## 第二阶段：Markdown 编辑器方案

### 方案选择：MDXEditor (推荐 ⭐⭐⭐)

**推荐库**: `@mdxeditor/editor` (⭐ 1.8k+)
- 所见即所得的 Markdown 编辑器
- 支持工具栏、快捷键
- 支持代码高亮、表格、图片
- 开箱即用，功能完整

**安装**:
```bash
pnpm add @mdxeditor/editor
```

**实现方案**:

```typescript
// src/components/MarkdownEditor.tsx
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  linkPlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  BlockTypeSelect
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  return (
    <MDXEditor
      markdown={content}
      onChange={onChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', ts: 'TypeScript', py: 'Python' } }),
        tablePlugin(),
        linkPlugin(),
        imagePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ListsToggle />
              <BlockTypeSelect />
            </>
          )
        })
      ]}
      contentEditableClassName="prose dark:prose-invert"
    />
  );
}
```

**备选方案**: `react-markdown` + `react-simplemde-editor`
- 更轻量，但需要自己实现编辑器功能

**参考**: [MDXEditor 文档](https://mdxeditor.dev/)

---

## 第三阶段：高级功能技术方案

### 1. 标签系统方案

#### 方案选择：react-tag-input-component

**推荐库**: `react-tag-input-component` (⭐ 200+)
- 简单易用的标签输入组件
- 支持自动完成
- 可自定义样式

**安装**:
```bash
pnpm add react-tag-input-component
```

**实现方案**:

```typescript
// src/components/TagInput.tsx
import { TagsInput } from 'react-tag-input-component';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  return (
    <TagsInput
      value={tags}
      onChange={onChange}
      placeHolder="添加标签..."
    />
  );
}
```

**数据结构更新**:
```typescript
interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];  // 新增
  category?: string;  // 新增
  updatedAt: string;
  createdAt: string;  // 新增
}
```

---

### 2. 拖拽功能方案

#### 方案选择：dnd-kit

**推荐库**: `@dnd-kit/core` + `@dnd-kit/sortable` (⭐ 12k+)
- 现代化的拖拽库
- 性能优秀
- 支持触摸设备
- 可访问性好

**安装**:
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**实现方案 - 笔记排序**:

```typescript
// src/components/SortableNoteList.tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableNoteItem({ note }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: note.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* 笔记卡片内容 */}
    </div>
  );
}

export function SortableNoteList({ notes, onReorder }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={notes} strategy={verticalListSortingStrategy}>
        {notes.map(note => <SortableNoteItem key={note.id} note={note} />)}
      </SortableContext>
    </DndContext>
  );
}
```

**参考**: [dnd-kit 文档](https://docs.dndkit.com/)

---

### 3. 导出功能方案

#### Markdown 导出

**推荐库**: `file-saver` (⭐ 21k+)

**安装**:
```bash
pnpm add file-saver
pnpm add -D @types/file-saver
```

**实现方案**:

```typescript
// src/utils/export.ts
import { saveAs } from 'file-saver';

export const exportUtils = {
  // 导出单个笔记为 Markdown
  exportAsMarkdown(note: Note) {
    const content = `# ${note.title}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${note.title}.md`);
  },

  // 导出所有笔记为 ZIP
  async exportAllAsZip(notes: Note[]) {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    notes.forEach(note => {
      const content = `# ${note.title}\n\n${note.content}`;
      zip.file(`${note.title}.md`, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'noteflow-export.zip');
  }
};
```

**需要安装**:
```bash
pnpm add jszip
```

---

#### PDF 导出

**推荐库**: `jspdf` + `html2canvas` (⭐ 29k+ / 30k+)

**安装**:
```bash
pnpm add jspdf html2canvas
```

**实现方案**:

```typescript
// src/utils/export.ts (续)
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportUtils = {
  // ... 前面的方法

  // 导出为 PDF
  async exportAsPDF(note: Note, elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${note.title}.pdf`);
  }
};
```

**参考**:
- [jsPDF 文档](https://github.com/parallax/jsPDF)
- [html2canvas 文档](https://html2canvas.hertzen.com/)

---

### 4. 导入功能方案

**实现方案**:

```typescript
// src/utils/import.ts
export const importUtils = {
  // 导入 Markdown 文件
  async importMarkdown(file: File): Promise<Partial<Note>> {
    const content = await file.text();
    const lines = content.split('\n');

    // 提取标题（第一行如果是 # 开头）
    let title = file.name.replace('.md', '');
    let noteContent = content;

    if (lines[0].startsWith('# ')) {
      title = lines[0].replace('# ', '').trim();
      noteContent = lines.slice(1).join('\n').trim();
    }

    return {
      title,
      content: noteContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  // 批量导入
  async importMultiple(files: FileList): Promise<Partial<Note>[]> {
    const promises = Array.from(files).map(file => this.importMarkdown(file));
    return await Promise.all(promises);
  }
};
```

**使用示例**:

```typescript
// 文件上传组件
<input
  type="file"
  accept=".md,.markdown"
  multiple
  onChange={async (e) => {
    const files = e.target.files;
    if (files) {
      const importedNotes = await importUtils.importMultiple(files);
      // 添加到笔记列表
    }
  }}
/>
```

---

## 第四阶段：性能优化技术方案

### 1. 虚拟滚动方案

#### 方案选择：react-window

**推荐库**: `react-window` (⭐ 16k+)
- 高性能虚拟滚动
- 只渲染可见区域的元素
- 支持大量数据

**安装**:
```bash
pnpm add react-window
pnpm add -D @types/react-window
```

**实现方案**:

```typescript
// src/components/VirtualNoteList.tsx
import { FixedSizeList } from 'react-window';

interface VirtualNoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  selectedNoteId?: number;
}

export function VirtualNoteList({ notes, onSelectNote, selectedNoteId }: VirtualNoteListProps) {
  const Row = ({ index, style }) => {
    const note = notes[index];
    const isSelected = note.id === selectedNoteId;

    return (
      <div
        style={style}
        className={`note-item ${isSelected ? 'active' : ''}`}
        onClick={() => onSelectNote(note)}
      >
        <h3>{note.title}</h3>
        <p>{note.content.substring(0, 50)}...</p>
        <span>{note.updatedAt}</span>
      </div>
    );
  };

  return (
    <FixedSizeList
      height={600}
      itemCount={notes.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**参考**: [react-window 文档](https://react-window.vercel.app/)

---

### 2. 防抖和节流方案

#### 方案选择：usehooks-ts

**推荐库**: `usehooks-ts` (⭐ 7k+)
- 提供常用的 React Hooks
- 包含 useDebounce, useThrottle 等
- TypeScript 支持

**安装**:
```bash
pnpm add usehooks-ts
```

**实现方案**:

```typescript
// 搜索防抖
import { useDebounce } from 'usehooks-ts';

function SearchBox() {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    // 执行搜索
    performSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="搜索笔记..."
    />
  );
}
```

**参考**: [usehooks-ts 文档](https://usehooks-ts.com/)

---

### 3. 主题系统方案

#### 方案选择：next-themes

**推荐库**: `next-themes` (⭐ 5k+)
- 完美的主题切换
- 避免闪烁
- 支持系统主题
- 自动持久化

**安装**:
```bash
pnpm add next-themes
```

**实现方案**:

```typescript
// src/main.tsx
import { ThemeProvider } from 'next-themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <App />
    </ThemeProvider>
  </StrictMode>
);

// src/components/ThemeToggle.tsx
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

**CSS 配置**:

```css
/* src/index.css */
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #4a9eff;
}

.dark {
  --background: #1a1a1a;
  --foreground: #e0e0e0;
  --primary: #4a9eff;
}
```

**参考**: [next-themes 文档](https://github.com/pacocoursey/next-themes)

---

## 第五阶段：云端同步技术方案

### 架构设计：本地优先 + 云端同步

**设计理念**:
- 📱 **本地优先** - 数据首先保存在本地（LocalStorage/IndexedDB）
- ☁️ **可选云端同步** - 用户可选择是否同步到云端
- 🔄 **离线可用** - 没有网络也能正常使用
- 🚀 **快速响应** - 本地操作立即生效，后台同步

---

### 1. 云端方案选择：Supabase (强烈推荐 ⭐⭐⭐)

#### 为什么选择 Supabase？

**推荐库**: `@supabase/supabase-js` (⭐ 3k+)

**优势**:
- ✅ **完全免费** - 免费额度：500MB 数据库、50MB 文件存储、2GB 带宽/月
- ✅ **无需自己搭建服务器** - 云端托管，开箱即用
- ✅ **无需写后端代码** - 前端直接调用 API
- ✅ **内置认证系统** - 支持邮箱、Google、GitHub 登录
- ✅ **实时同步** - 内置 Realtime 功能，多设备自动同步
- ✅ **PostgreSQL 数据库** - 成熟稳定，支持复杂查询
- ✅ **Row Level Security** - 数据安全，用户只能访问自己的数据
- ✅ **简单易用** - 5 分钟即可完成配置

**安装**:
```bash
pnpm add @supabase/supabase-js
```

---

### 2. Supabase 配置步骤

#### 步骤 1: 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册账号（免费）
3. 创建新项目
4. 记录 `Project URL` 和 `anon public key`

#### 步骤 2: 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 创建笔记表
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  tags text[] default '{}',
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 Row Level Security
alter table notes enable row level security;

-- 创建策略：用户只能访问自己的笔记
create policy "Users can view their own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on notes for delete
  using (auth.uid() = user_id);

-- 创建索引
create index notes_user_id_idx on notes(user_id);
create index notes_updated_at_idx on notes(updated_at desc);

-- 自动更新 updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_notes_updated_at
  before update on notes
  for each row
  execute procedure update_updated_at_column();
```

#### 步骤 3: 配置环境变量

```bash
# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### 3. Supabase 客户端实现

#### 初始化 Supabase 客户端

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}
```

---

### 4. 本地优先 + 云端同步实现

#### 混合存储策略

```typescript
// src/store/noteStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { storage } from '../utils/storage';

interface NoteStore {
  notes: Note[];
  isOnline: boolean;
  isSyncing: boolean;
  user: User | null;

  // 本地操作
  loadLocalNotes: () => Promise<void>;
  saveLocalNotes: () => Promise<void>;

  // 云端操作
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;

  // CRUD 操作
  createNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  user: null,

  // 加载本地笔记
  loadLocalNotes: async () => {
    const localNotes = await storage.getNotes();
    set({ notes: localNotes });
  },

  // 保存到本地
  saveLocalNotes: async () => {
    await storage.saveNotes(get().notes);
  },

  // 同步到云端
  syncToCloud: async () => {
    const { user, notes } = get();
    if (!user) return;

    set({ isSyncing: true });

    try {
      // 获取云端笔记
      const { data: cloudNotes } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      // 合并策略：以最新的 updated_at 为准
      const merged = mergeNotes(notes, cloudNotes || []);

      // 上传本地新增/修改的笔记
      for (const note of merged) {
        const cloudNote = cloudNotes?.find(n => n.id === note.id);

        if (!cloudNote) {
          // 新笔记，插入到云端
          await supabase.from('notes').insert({
            id: note.id,
            user_id: user.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            category: note.category,
            created_at: note.created_at,
            updated_at: note.updated_at
          });
        } else if (new Date(note.updated_at) > new Date(cloudNote.updated_at)) {
          // 本地更新，更新云端
          await supabase
            .from('notes')
            .update({
              title: note.title,
              content: note.content,
              tags: note.tags,
              category: note.category,
              updated_at: note.updated_at
            })
            .eq('id', note.id);
        }
      }

      set({ notes: merged });
      await get().saveLocalNotes();
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  // 从云端同步
  syncFromCloud: async () => {
    const { user } = get();
    if (!user) return;

    set({ isSyncing: true });

    try {
      const { data: cloudNotes } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (cloudNotes) {
        set({ notes: cloudNotes });
        await get().saveLocalNotes();
      }
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  // 创建笔记（本地优先）
  createNote: async (noteData) => {
    const { user, notes } = get();

    const newNote: Note = {
      id: crypto.randomUUID(),
      user_id: user?.id || 'local',
      title: noteData.title || '新建笔记',
      content: noteData.content || '',
      tags: noteData.tags || [],
      category: noteData.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. 立即更新本地状态
    set({ notes: [newNote, ...notes] });

    // 2. 保存到本地存储
    await get().saveLocalNotes();

    // 3. 如果在线且已登录，后台同步到云端
    if (user && navigator.onLine) {
      supabase.from('notes').insert(newNote).then(() => {
        console.log('笔记已同步到云端');
      });
    }
  },

  // 更新笔记（本地优先）
  updateNote: async (id, updates) => {
    const { user, notes } = get();

    // 1. 立即更新本地状态
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updated_at: new Date().toISOString() }
        : note
    );
    set({ notes: updatedNotes });

    // 2. 保存到本地存储
    await get().saveLocalNotes();

    // 3. 如果在线且已登录，后台同步到云端
    if (user && navigator.onLine) {
      supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .then(() => {
          console.log('笔记已同步到云端');
        });
    }
  },

  // 删除笔记（本地优先）
  deleteNote: async (id) => {
    const { user, notes } = get();

    // 1. 立即更新本地状态
    set({ notes: notes.filter(note => note.id !== id) });

    // 2. 保存到本地存储
    await get().saveLocalNotes();

    // 3. 如果在线且已登录，后台同步到云端
    if (user && navigator.onLine) {
      supabase.from('notes').delete().eq('id', id).then(() => {
        console.log('笔记已从云端删除');
      });
    }
  }
}));

// 合并笔记的辅助函数
function mergeNotes(localNotes: Note[], cloudNotes: Note[]): Note[] {
  const merged = new Map<string, Note>();

  // 添加所有笔记
  [...localNotes, ...cloudNotes].forEach(note => {
    const existing = merged.get(note.id);
    if (!existing || new Date(note.updated_at) > new Date(existing.updated_at)) {
      merged.set(note.id, note);
    }
  });

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
```

---

### 5. Supabase 认证实现

```typescript
// src/components/Auth.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('注册成功！请查收邮件验证。');
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) alert(error.message);
  };

  return (
    <div className="auth-container">
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignIn} disabled={loading}>登录</button>
      <button onClick={handleSignUp} disabled={loading}>注册</button>
      <button onClick={handleGoogleSignIn}>使用 Google 登录</button>
    </div>
  );
}

// src/App.tsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <Auth />;
  }

  return <div>{/* 应用主界面 */}</div>;
}
```

---

### 6. 实时同步功能

```typescript
// src/hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNoteStore } from '../store/noteStore';

export function useRealtimeSync() {
  const { syncFromCloud } = useNoteStore();

  useEffect(() => {
    // 订阅笔记表的变化
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          console.log('检测到云端变化:', payload);
          // 重新同步
          syncFromCloud();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncFromCloud]);
}

// 在 App.tsx 中使用
function App() {
  useRealtimeSync(); // 启用实时同步
  // ...
}
```

---

### 7. 离线检测和自动同步

```typescript
// src/hooks/useOnlineStatus.ts
import { useEffect } from 'react';
import { useNoteStore } from '../store/noteStore';

export function useOnlineStatus() {
  const { syncToCloud } = useNoteStore();

  useEffect(() => {
    const handleOnline = () => {
      console.log('网络已连接，开始同步...');
      syncToCloud();
    };

    const handleOffline = () => {
      console.log('网络已断开，切换到离线模式');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncToCloud]);
}
```

**参考**: [Supabase 文档](https://supabase.com/docs)

---

### 8. 其他免费云端方案对比

| 方案 | 优势 | 劣势 | 免费额度 | 推荐度 |
|------|------|------|----------|--------|
| **Supabase** | 功能完整、易用、实时同步 | 需要学习 PostgreSQL | 500MB 数据库 | ⭐⭐⭐⭐⭐ |
| **Firebase** | Google 支持、文档丰富 | NoSQL 学习曲线 | 1GB 存储 | ⭐⭐⭐⭐ |
| **PocketBase** | 单文件部署、极简 | 需要自己部署服务器 | 自己部署 | ⭐⭐⭐ |
| **Appwrite** | 开源、功能全面 | 需要自己部署 | 自己部署 | ⭐⭐⭐ |
| **Railway** | 简单易用 | 免费额度较少 | $5/月额度 | ⭐⭐⭐ |

**结论**: Supabase 是最佳选择，无需自己搭建服务器，免费额度充足。

---

### 9. 完整的数据流程图

```
用户操作
   ↓
本地状态更新 (Zustand) ← 立即响应
   ↓
保存到 LocalStorage/IndexedDB ← 离线可用
   ↓
后台同步到 Supabase (如果在线) ← 异步同步
   ↓
Realtime 通知其他设备 ← 多设备同步
```

---

### 10. 冲突解决策略

当本地和云端数据冲突时，采用"最后写入获胜"策略：

```typescript
function resolveConflict(localNote: Note, cloudNote: Note): Note {
  // 比较 updated_at 时间戳
  const localTime = new Date(localNote.updated_at).getTime();
  const cloudTime = new Date(cloudNote.updated_at).getTime();

  // 返回最新的版本
  return localTime > cloudTime ? localNote : cloudNote;
}
```

**未来优化**: 可以实现更复杂的冲突解决策略，如：
- 显示冲突对话框，让用户选择
- 保留两个版本，创建副本
- 使用 CRDT (Conflict-free Replicated Data Type)

---

### 11. 数据迁移方案

从本地迁移到云端：

```typescript
// src/utils/migration.ts
import { supabase } from '../lib/supabase';
import { storage } from './storage';

export async function migrateToCloud() {
  // 1. 获取所有本地笔记
  const localNotes = await storage.getNotes();

  if (localNotes.length === 0) {
    console.log('没有需要迁移的笔记');
    return;
  }

  // 2. 批量上传到 Supabase
  const { data, error } = await supabase
    .from('notes')
    .insert(localNotes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      category: note.category,
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at
    })));

  if (error) {
    console.error('迁移失败:', error);
    throw error;
  }

  console.log(`成功迁移 ${localNotes.length} 条笔记到云端`);
}
```

---

### 12. 成本估算

**Supabase 免费额度**:
- ✅ 500MB 数据库存储
- ✅ 50MB 文件存储
- ✅ 2GB 带宽/月
- ✅ 50,000 月活用户
- ✅ 无限 API 请求

**估算**:
- 每条笔记平均 5KB (标题 + 内容)
- 500MB ÷ 5KB = **100,000 条笔记**
- 对于个人使用，完全免费！

**如果超出免费额度**:
- Pro 计划: $25/月 (8GB 数据库 + 100GB 带宽)
- 但对于笔记应用，基本不会超出免费额度

---

### 13. 部署清单

#### 前端部署 (Vercel)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. 自动部署完成

#### Supabase 配置

1. 创建项目 (免费)
2. 执行 SQL 创建表
3. 配置认证提供商 (Google/GitHub)
4. 获取 API 密钥
5. 完成！

**总成本**: $0 (完全免费)

---

### 14. 安全最佳实践

1. **Row Level Security (RLS)**
   - 已在 SQL 中配置
   - 用户只能访问自己的数据

2. **API 密钥管理**
   - 使用 `.env` 文件
   - 不要提交到 Git
   - 使用 `anon` 密钥（公开安全）

3. **数据验证**
   ```typescript
   // 使用 Zod 验证数据
   import { z } from 'zod';

   const NoteSchema = z.object({
     title: z.string().min(1).max(200),
     content: z.string().max(100000),
     tags: z.array(z.string()).max(20),
     category: z.string().optional()
   });
   ```

4. **防止 XSS 攻击**
   - React 自动转义内容
   - 使用 DOMPurify 清理 HTML

---

### 15. 监控和日志

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // 可以发送到日志服务 (如 Sentry)
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // 发送错误报告
  },

  sync: (action: string, noteId: string) => {
    console.log(`[SYNC] ${action} - Note: ${noteId}`);
  }
};

// 使用示例
logger.sync('upload', note.id);
logger.error('同步失败', error);
```

---

### 16. 性能优化建议

1. **批量同步**
   - 不要每次修改都立即同步
   - 使用防抖，5 秒后批量同步

2. **增量同步**
   - 只同步修改过的笔记
   - 使用 `updated_at` 时间戳

3. **压缩数据**
   - 对大文本内容进行压缩
   - 使用 `pako` 库

4. **缓存策略**
   - 使用 TanStack Query 的缓存
   - 设置合理的 `staleTime`

---

## 总结：推荐的技术栈

### 第一阶段 (本地存储)
```bash
pnpm add localforage zustand lucide-react
```

### 第二阶段 (Markdown)
```bash
pnpm add @mdxeditor/editor usehooks-ts
```

### 第三阶段 (高级功能)
```bash
pnpm add file-saver jszip jspdf html2canvas
```

### 第四阶段 (性能优化)
```bash
pnpm add react-window next-themes
```

### 第五阶段 (云端同步 - Supabase)
```bash
pnpm add @supabase/supabase-js
```

**总计**: 只需要 10 个核心依赖，全部是成熟的开源库！

---

## 快速开始指南

### 1. 本地开发 (第一阶段)

```bash
# 安装依赖
pnpm add localforage zustand

# 实现本地存储
# 参考上面的代码示例

# 运行项目
pnpm dev
```

### 2. 添加云端同步 (第五阶段)

```bash
# 安装 Supabase
pnpm add @supabase/supabase-js

# 创建 Supabase 项目
# 访问 supabase.com

# 配置环境变量
echo "VITE_SUPABASE_URL=your-url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env

# 实现同步逻辑
# 参考上面的代码示例
```

### 3. 部署

```bash
# 部署到 Vercel
vercel

# 完成！
```

---

**参考**: [Supabase 文档](https://supabase.com/docs)

---

### 4. API 客户端方案

#### 方案选择：TanStack Query (React Query)

**推荐库**: `@tanstack/react-query` (⭐ 42k+)
- 强大的数据获取和缓存
- 自动重试、轮询
- 乐观更新
- 离线支持

**安装**:
```bash
pnpm add @tanstack/react-query
pnpm add axios
```

**实现方案**:

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加认证 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// src/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useNotes() {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notes');
      return data;
    }
  });

  const createNote = useMutation({
    mutationFn: async (note: Partial<Note>) => {
      const { data } = await apiClient.post('/notes', note);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data } = await apiClient.patch(`/notes/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  return { notes, isLoading, createNote, updateNote };
}

// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

**参考**: [TanStack Query 文档](https://tanstack.com/query/latest)

---

### 5. 实时同步方案

#### 方案选择：Socket.IO

**推荐库**: `socket.io-client` (⭐ 11k+)
- 实时双向通信
- 自动重连
- 房间和命名空间支持

**安装**:
```bash
pnpm add socket.io-client
```

**实现方案**:

```typescript
// src/services/socket.ts
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: false
});

// 连接管理
export const socketService = {
  connect(token: string) {
    socket.auth = { token };
    socket.connect();
  },

  disconnect() {
    socket.disconnect();
  },

  // 监听笔记更新
  onNoteUpdate(callback: (note: Note) => void) {
    socket.on('note:updated', callback);
  },

  // 发送笔记更新
  emitNoteUpdate(note: Note) {
    socket.emit('note:update', note);
  }
};

// 在组件中使用
useEffect(() => {
  socketService.connect(token);
  socketService.onNoteUpdate((note) => {
    // 更新本地状态
  });

  return () => socketService.disconnect();
}, []);
```

**参考**: [Socket.IO 文档](https://socket.io/docs/v4/)

---

## 测试方案

### 1. 单元测试

**推荐库**: `vitest` + `@testing-library/react`

**安装**:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**配置**:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});

// src/test/setup.ts
import '@testing-library/jest-dom';
```

**测试示例**:

```typescript
// src/utils/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load notes', async () => {
    const notes = [{ id: 1, title: 'Test', content: 'Content' }];
    await storage.saveNotes(notes);
    const loaded = await storage.getNotes();
    expect(loaded).toEqual(notes);
  });
});
```

**参考**: [Vitest 文档](https://vitest.dev/)

---

### 2. E2E 测试

**推荐库**: `playwright` (⭐ 67k+)

**安装**:
```bash
pnpm create playwright
```

**测试示例**:

```typescript
// tests/e2e/notes.spec.ts
import { test, expect } from '@playwright/test';

test('create and edit note', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 点击新建笔记
  await page.click('text=新建笔记');

  // 编辑标题
  await page.fill('input[placeholder="笔记标题"]', '我的笔记');

  // 编辑内容
  await page.fill('textarea', '这是笔记内容');

  // 验证保存
  await expect(page.locator('text=我的笔记')).toBeVisible();
});
```

**参考**: [Playwright 文档](https://playwright.dev/)

---

## 部署方案

### 前端部署

#### 推荐平台：Vercel (⭐⭐⭐)

**特点**:
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 免费额度充足

**部署步骤**:
```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 部署
vercel
```

**备选**: Netlify / Cloudflare Pages

---

### 后端部署

#### 推荐平台：Railway / Render

**Railway** (推荐):
- 简单易用
- 支持 PostgreSQL
- 自动部署
- 免费额度

**部署步骤**:
1. 连接 GitHub 仓库
2. 选择 server 目录
3. 添加环境变量
4. 自动部署

**备选**: Fly.io / AWS / DigitalOcean

---

## 开发工具推荐

### 1. 代码质量

```bash
# ESLint + Prettier
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier

# Husky + lint-staged (Git hooks)
pnpm add -D husky lint-staged
pnpm exec husky init
```

**配置**:

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

### 2. 开发体验

**推荐安装**:
```bash
# 环境变量管理
pnpm add dotenv

# 日期处理
pnpm add date-fns

# UUID 生成
pnpm add uuid
pnpm add -D @types/uuid

# 类名合并
pnpm add clsx
```

---

## 完整依赖清单

### 第一阶段
```json
{
  "dependencies": {
    "localforage": "^1.10.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### 第二阶段
```json
{
  "dependencies": {
    "@mdxeditor/editor": "^3.0.0",
    "usehooks-ts": "^3.0.0"
  }
}
```

### 第三阶段
```json
{
  "dependencies": {
    "react-tag-input-component": "^2.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "file-saver": "^2.0.5",
    "jszip": "^3.10.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.0"
  }
}
```

### 第四阶段
```json
{
  "dependencies": {
    "react-window": "^1.8.0",
    "next-themes": "^0.3.0"
  },
  "devDependencies": {
    "@types/react-window": "^1.8.0"
  }
}
```

### 第五阶段
```json
{
  "dependencies": {
    "@clerk/clerk-react": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "socket.io-client": "^4.7.0"
  }
}
```

---

## 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     前端 (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI 组件    │  │  状态管理    │  │   Hooks      │  │
│  │  (shadcn/ui) │  │  (Zustand)   │  │ (自定义)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          数据层 (TanStack Query)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    后端 (Hono)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   路由层     │  │   业务逻辑   │  │   认证       │  │
│  │   (Hono)     │  │   (Service)  │  │   (JWT)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          数据库层 (Prisma)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                数据库 (PostgreSQL)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 最佳实践

### 1. 代码组织
- 按功能模块组织，不是按文件类型
- 使用 barrel exports (index.ts)
- 保持组件小而专注

### 2. 性能优化
- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 和 useCallback 缓存计算结果
- 懒加载路由和大组件
- 图片优化和懒加载

### 3. 类型安全
- 为所有函数添加类型注解
- 避免使用 any
- 使用 Zod 进行运行时验证

### 4. 错误处理
- 使用 Error Boundary 捕获组件错误
- 统一的错误提示组件
- 日志记录和监控

---

## 参考资源

### 官方文档
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)

### 组件库
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Headless UI](https://headlessui.com/)

### 学习资源
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Web.dev](https://web.dev/)

---

## 更新日志

### 2026-03-28
- ✅ 创建技术方案文档
- ✅ 定义各阶段技术选型
- ✅ 提供完整的代码示例
- ✅ 列出所有推荐的成熟组件和库

---

**注意**: 本文档会随着技术选型的变化持续更新。所有推荐的库都是经过验证的成熟方案，可以放心使用。
