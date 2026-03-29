// 测试 Supabase 同步功能
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yzmpnpgorkvydhxarlje.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bXBucGdvcmt2eWRoeGFybGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NTI1OTIsImV4cCI6MjA5MDMyODU5Mn0.y-9-18gHD5mcrApZfNHgbpDmOfwoWcL-SqKEEel7HSk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSync() {
  console.log('🔍 开始测试 Supabase 同步功能...\n')

  try {
    // 1. 测试连接
    console.log('1️⃣ 测试数据库连接...')
    const { data: testData, error: testError } = await supabase
      .from('notes')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message)
      return
    }
    console.log('✅ 数据库连接成功\n')

    // 2. 获取当前用户
    console.log('2️⃣ 获取当前登录用户...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ 未登录或获取用户失败')
      console.log('💡 请先在浏览器中登录应用\n')
      return
    }
    console.log('✅ 当前用户:', user.email)
    console.log('   用户 ID:', user.id, '\n')

    // 3. 查询用户的笔记
    console.log('3️⃣ 查询云端笔记...')
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (notesError) {
      console.error('❌ 查询笔记失败:', notesError.message)
      return
    }
