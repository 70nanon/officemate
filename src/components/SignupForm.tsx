import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthForm.css'

interface SignupFormProps {
  onToggleMode: () => void
}

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      return setError('パスワードが一致しません')
    }

    if (password.length < 6) {
      return setError('パスワードは6文字以上で入力してください')
    }

    try {
      setError('')
      setLoading(true)
      await signup(email, password, displayName)
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています')
      } else if (err.code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません')
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます。より強力なパスワードを設定してください')
      } else {
        setError('アカウントの作成に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>📝 新規登録</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">表示名</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="山田 太郎"
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">パスワード（確認）</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '登録中...' : '新規登録'}
          </button>
        </form>

        <div className="auth-toggle">
          既にアカウントをお持ちの方は
          <button onClick={onToggleMode} className="link-button">
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}
