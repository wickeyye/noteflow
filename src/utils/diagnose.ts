import { supabase } from '../lib/supabase'

/**
 * 诊断 Supabase 同步问题
 */
export async function diagnoseSync() {
  console.log('🔍 开始诊断 Supabase 同步问题...\n')

  const issues: string[] = []
  const fixes: string[] = []

  try {
    // 1. 检查连接
    console.log('1️⃣ 检查数据库连接...')
    const { error: pingError } = await supabase
      .from('notes')
      .select('id')
      .limit(1)

    if (pingError) {
      console.error('❌ 数据库连接失败:', pingError.message)
      console.error('   错误代码:', pingError.code)
      console.error('   详细信息:', pingError.details)

      if (pingError.code === '42P01') {
        issues.push('数据库表 "notes" 不存在')
        fixes.push('需要在 Supabase 后台创建 notes 表')
      } else if (pingError.code === 'PGRST116') {
        issues.push('表结构或权限问题')
        fixes.push('检查 RLS 策略和表权限')
      }

      console.log('\n')
    } else {
      console.log('✅ 数据库连接成功\n')
    }

    // 2. 检查用户登录
    console.log('2️⃣ 检查用户登录状态...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ 用户未登录')
      issues.push('用户未登录')
      fixes.push('请先登录应用')
      console.log('\n')
    } else {
      console.log('✅ 用户已登录:', user.email)
      console.log('   用户 ID:', user.id)
      console.log('\n')
    }

    // 3. 检查表结构
    if (!pingError && user) {
      console.log('3️⃣ 检查表结构...')

      // 尝试查询表结构
      const { error: tableError } = await supabase
        .from('notes')
        .select('*')
        .limit(0)

      if (tableError) {
        console.error('❌ 无法访问表:', tableError.message)
        issues.push('无法访问 notes 表')
      } else {
        console.log('✅ 表结构正常\n')
      }

      // 4. 检查权限（RLS）
      console.log('4️⃣ 检查数据权限...')
      const { data: testData, error: testError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (testError) {
        console.error('❌ 权限检查失败:', testError.message)
        issues.push('RLS 策略可能配置不正确')
        fixes.push('需要配置 Row Level Security 策略')
      } else {
        console.log('✅ 权限检查通过')
        console.log(`   当前用户的笔记数量: ${testData?.length || 0}\n`)
      }

      // 5. 测试写入
      console.log('5️⃣ 测试写入权限...')
      const testNote = {
        user_id: user.id,
        title: '诊断测试笔记',
        content: '这是一条测试笔记，用于验证写入权限',
        is_favorite: false,
        tags: ['测试'],
        updated_at: new Date().toISOString()
      }

      const { data: insertData, error: insertError } = await supabase
        .from('notes')
        .insert([testNote])
        .select()

      if (insertError) {
        console.error('❌ 写入测试失败:', insertError.message)
        console.error('   错误代码:', insertError.code)
        issues.push('无法写入数据到 notes 表')

        if (insertError.code === '42501') {
          fixes.push('RLS 策略阻止了写入操作，需要添加 INSERT 策略')
        }
      } else {
        console.log('✅ 写入测试成功')
        console.log('   测试笔记 ID:', insertData?.[0]?.id)

        // 清理测试数据
        if (insertData?.[0]?.id) {
          await supabase
            .from('notes')
            .delete()
            .eq('id', insertData[0].id)
          console.log('   已清理测试数据\n')
        }
      }
    }

    // 总结
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 诊断结果\n')

    if (issues.length === 0) {
      console.log('✅ 所有检查通过！同步功能应该正常工作。')
      console.log('\n💡 如果笔记还没有同步，请：')
      console.log('   1. 在应用中创建或编辑一条笔记')
      console.log('   2. 等待 30 秒（自动同步间隔）')
      console.log('   3. 运行 window.checkSync() 查看云端笔记')
    } else {
      console.log('❌ 发现以下问题：')
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`)
      })

      console.log('\n🔧 建议的修复方案：')
      fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`)
      })

      console.log('\n📖 详细修复步骤：')
      console.log('   访问: https://app.supabase.com')
      console.log('   选择你的项目')
      console.log('   按照下面的 SQL 创建表和策略')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // 如果表不存在，提供创建 SQL
    if (issues.some(i => i.includes('不存在'))) {
      console.log('📝 创建表的 SQL 语句：\n')
      console.log(`
-- 创建 notes 表
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON public.notes(updated_at DESC);

-- 启用 RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能查看自己的笔记
CREATE POLICY "Users can view own notes"
  ON public.notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建 RLS 策略：用户可以插入自己的笔记
CREATE POLICY "Users can insert own notes"
  ON public.notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建 RLS 策略：用户可以更新自己的笔记
CREATE POLICY "Users can update own notes"
  ON public.notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建 RLS 策略：用户可以删除自己的笔记
CREATE POLICY "Users can delete own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);
      `)

      console.log('\n💡 复制上面的 SQL，在 Supabase 后台执行：')
      console.log('   1. 打开 https://app.supabase.com')
      console.log('   2. 选择你的项目')
      console.log('   3. 点击左侧 "SQL Editor"')
      console.log('   4. 点击 "New Query"')
      console.log('   5. 粘贴上面的 SQL')
      console.log('   6. 点击 "Run" 执行\n')
    }

    return {
      success: issues.length === 0,
      issues,
      fixes
    }

  } catch (error: any) {
    console.error('❌ 诊断过程出错:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}
