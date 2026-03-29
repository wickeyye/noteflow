import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthProps {
  onAuthSuccess: () => void
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) {
          // 特殊处理邮箱未验证的错误
          if (error.message.includes('Email not confirmed')) {
            throw new Error('邮箱未验证！请检查你的邮箱（包括垃圾邮件箱），点击验证链接后再登录。')
          }
          throw error
        }
      } else {
        // 注册
        const { error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        alert('注册成功！\n\n请检查邮箱（包括垃圾邮件箱）中的验证链接。\n验证后即可登录。')
        setIsLogin(true) // 切换到登录模式
        return // 不调用 onAuthSuccess，等待用户验证邮箱
      }
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">📝 NoteFlow</h1>
        <p className="auth-subtitle">
          {isLogin ? '登录以同步你的笔记' : '创建账户开始使用'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <button
          className="auth-toggle"
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
          }}
          disabled={loading}
        >
          {isLogin ? '还没有账户？点击注册' : '已有账户？点击登录'}
        </button>

        <div className="auth-divider">
          <span>或</span>
        </div>

        <button
          className="auth-guest"
          onClick={onAuthSuccess}
          disabled={loading}
        >
          继续使用本地模式（不同步）
        </button>
      </div>
    </div>
  )
}
