import { useState } from 'react'
import './App.css'
import SeatMap from './components/SeatMap'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import { useAuth } from './contexts/AuthContext'

function App() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const { currentUser, logout } = useAuth()

  // ログインしていない場合は認証画面を表示
  if (!currentUser) {
    return isLoginMode ? (
      <LoginForm onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <SignupForm onToggleMode={() => setIsLoginMode(true)} />
    )
  }

  // ログイン後のメイン画面
  return (
    <div className="app">
      <header className="app-header">
        <h1>🪑 OfficeMate</h1>
        <div className="user-info">
          <span className="user-name">
            👤 {currentUser.displayName || currentUser.email}
          </span>
          <button onClick={logout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <SeatMap currentUser={currentUser.displayName || currentUser.email || ''} />
      </main>

      <footer className="app-footer">
        <p>© 2025 OfficeMate</p>
      </footer>
    </div>
  )
}

export default App
