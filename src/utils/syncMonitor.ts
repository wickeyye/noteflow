import { supabase } from '../lib/supabase'

/**
 * 监控同步状态
 * 在浏览器控制台运行: window.monitorSync()
 */
export async function monitorSync() {
  console.log('🔍 开始监控 Supabase 同步状态...\n')

  try {
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ 未登录')
      return
    }

    console.log('✅ 当前用户:', user.email)
    console.log('📊 开始实时监控云端笔记变化...\n')

    // 查询当前云端笔记
    const { data: initialNotes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    console.log(`📝 当前云端笔记数量: ${initialNotes?.length || 0}`)
    if (initialNotes && initialNotes.length > 0) {
      console.log('最新笔记:')
      initialNotes.slice(0, 3).forEach((note, index) => {
        console.log(`  ${index + 1}. ${note.title} (更新于: ${new Date(note.updated_at).toLocaleString()})`)
      })
    }
    console.log('\n💡 提示: 现在可以在应用中创建或编辑笔记，30秒后会自动同步到云端')
    console.log('💡 运行 window.checkSync() 可以手动检查最新状态\n')

    // 设置实时监听
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const timestamp = new Date().toLocaleTimeString()
          console.log(`\n🔔 [${timestamp}] 检测到云端笔记变化:`)

          if (payload.eventType === 'INSERT') {
            console.log('  ✨ 新增笔记:', payload.new.title)
          } else if (payload.eventType === 'UPDATE') {
            console.log('  📝 更新笔记:', payload.new.title)
          } else if (payload.eventType === 'DELETE') {
            console.log('  🗑️ 删除笔记:', payload.old.title)
          }

          console.log('  详细信息:', payload.new || payload.old)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ 实时监控已启动！')
        }
      })

    // 保存到全局，方便取消订阅
    ;(window as any).syncChannel = channel

    return {
      success: true,
      message: '实时监控已启动，运行 window.stopMonitor() 可以停止监控'
    }

  } catch (error: any) {
    console.error('❌ 监控启动失败:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 停止监控
 */
export async function stopMonitor() {
  const channel = (window as any).syncChannel
  if (channel) {
    await supabase.removeChannel(channel)
    console.log('✅ 已停止监控')
    delete (window as any).syncChannel
  } else {
    console.log('⚠️ 没有正在运行的监控')
  }
}

/**
 * 手动检查同步状态
 */
export async function checkSync() {
  console.log('🔍 检查云端笔记状态...\n')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ 未登录')
      return
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    console.log(`📝 云端笔记总数: ${notes?.length || 0}\n`)

    if (notes && notes.length > 0) {
      console.log('最新的 5 条笔记:')
      notes.slice(0, 5).forEach((note, index) => {
        const updateTime = new Date(note.updated_at).toLocaleString()
        console.log(`  ${index + 1}. ${note.title}`)
        console.log(`     更新时间: ${updateTime}`)
        console.log(`     内容预览: ${note.content.substring(0, 50)}...`)
        console.log('')
      })
    } else {
      console.log('⚠️ 云端还没有笔记')
    }

    return { success: true, count: notes?.length || 0 }

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message)
    return { success: false, error: error.message }
  }
}
