import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 调试信息（生产环境会被优化掉）
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
}

if (!supabaseUrl || !supabaseAnonKey) {
  const error = `Missing Supabase environment variables: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`
  console.error(error)
  throw new Error(error)
}

// 验证 URL 格式
try {
  new URL(supabaseUrl)
} catch (e) {
  const error = `Invalid Supabase URL: ${supabaseUrl}`
  console.error(error)
  throw new Error(error)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
