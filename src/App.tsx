import { useState } from 'react'
import './App.css'
import SeatMap from './components/SeatMap'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import ProfileSettings from './components/ProfileSettings'
import { useAuth } from './contexts/AuthContext'

type View = 'map' | 'profile'

function App() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [currentView, setCurrentView] = useState<View>('map')
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
        <nav className="nav-menu">
          <button 
            onClick={() => setCurrentView('map')}
            className={currentView === 'map' ? 'active' : ''}
          >
            座席マップ
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={currentView === 'profile' ? 'active' : ''}
          >
            プロフィール
          </button>
        </nav>
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
        {currentView === 'map' ? (
          <SeatMap currentUser={currentUser.displayName || currentUser.email || ''} />
        ) : (
          <ProfileSettings />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 OfficeMate</p>
      </footer>
    </div>
  )
}

export default App
