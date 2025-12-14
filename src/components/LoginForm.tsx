import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthForm.css'

interface LoginFormProps {
  onToggleMode: () => void
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(email, password)
    } catch (err) {
      console.error(err)
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>🔐 ログイン</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="auth-toggle">
          アカウントをお持ちでない方は
          <button onClick={onToggleMode} className="link-button">
            新規登録
          </button>
        </div>
      </div>
    </div>
  )
}
