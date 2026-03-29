import { supabase } from '../lib/supabase'
import { syncNotes, uploadNotes, downloadNotes } from '../lib/sync'
import type { Note } from '../types'

/**
 * 测试 Supabase 同步功能
 * 在浏览器控制台中运行: window.testSync()
 */
export async function testSync() {
  console.log('🔍 开始测试 Supabase 同步功能...\n')

  try {
    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...')
    const { error: pingError } = await supabase
      .from('notes')
      .select('id')
      .limit(1)

    if (pingError) {
      console.error('❌ 数据库连接失败:', pingError.message)
      console.log('💡 请检查 Supabase 配置和网络连接\n')
      return { success: false, error: pingError.message }
    }
    console.log('✅ 数据库连接成功\n')

    // 2. 获取当前用户
    console.log('2️⃣ 获取当前登录用户...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ 未登录或获取用户失败')
      console.log('💡 请先登录应用\n')
      return { success: false, error: '用户未登录' }
    }
    console.log('✅ 当前用户:', user.email)
    console.log('   用户 ID:', user.id, '\n')

    // 3. 查询云端笔记
    console.log('3️⃣ 查询云端笔记...')
    const cloudNotes = await downloadNotes(user.id)
    console.log(`✅ 找到 ${cloudNotes.length} 条云端笔记`)
    if (cloudNotes.length > 0) {
      console.log('   最新笔记:', cloudNotes[0].title)
    }
    console.log('')

    // 4. 测试上传功能
    console.log('4️⃣ 测试上传功能...')
    const testNote: Note = {
      id: Date.now(),
      title: `测试笔记 ${new Date().toLocaleString()}`,
      content: '这是一条测试笔记，用于验证 Supabase 同步功能。',
      tags: ['测试'],
      isFavorite: false,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    await uploadNotes([testNote], user.id)
    console.log('✅ 测试笔记上传成功\n')

    // 5. 验证上传结果
    console.log('5️⃣ 验证上传结果...')
    const updatedCloudNotes = await downloadNotes(user.id)
    const uploadedNote = updatedCloudNotes.find(n => n.title === testNote.title)

    if (uploadedNote) {
      console.log('✅ 验证成功！测试笔记已同步到云端')
      console.log('   笔记标题:', uploadedNote.title)
      console.log('   笔记内容:', uploadedNote.content)
      console.log('   标签:', uploadedNote.tags)
      console.log('')
    } else {
      console.error('❌ 验证失败：未找到上传的测试笔记\n')
      return { success: false, error: '上传验证失败' }
    }

    // 6. 测试同步功能
    console.log('6️⃣ 测试完整同步流程...')
    const localNotes: Note[] = [
      {
        id: Date.now() + 1,
        title: '本地笔记 1',
        content: '这是本地笔记内容',
        tags: ['本地'],
        isFavorite: false,
        updatedAt: new Date().toISOString().split('T')[0]
      }
    ]

    const syncedNotes = await syncNotes(localNotes, user.id)
    console.log(`✅ 同步完成！共 ${syncedNotes.length} 条笔记`)
    console.log('')

    // 7. 总结
    console.log('✨ 测试完成！所有功能正常工作\n')
    console.log('📊 测试结果:')
    console.log('   - 数据库连接: ✅')
    console.log('   - 用户认证: ✅')
    console.log('   - 下载笔记: ✅')
    console.log('   - 上传笔记: ✅')
    console.log('   - 同步功能: ✅')
    console.log('')

    return {
      success: true,
      user: user.email,
      cloudNotesCount: updatedCloudNotes.length,
      syncedNotesCount: syncedNotes.length
    }

  } catch (error: any) {
    console.error('❌ 测试过程中出现错误:', error.message)
    console.error('详细信息:', error)
    return { success: false, error: error.message }
  }
}
