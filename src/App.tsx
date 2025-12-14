import { useState } from 'react'
import './App.css'
import SeatMap from './components/SeatMap'

function App() {
  const [currentUser, setCurrentUser] = useState<string>('')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🪑 OfficeMate</h1>
        <div className="user-info">
          {currentUser ? (
            <span>ログイン中: {currentUser}</span>
          ) : (
            <button onClick={() => setCurrentUser('ゲストユーザー')}>
              ログイン
            </button>
          )}
        </div>
      </header>
      
      <main className="app-main">
        <SeatMap currentUser={currentUser} />
      </main>

      <footer className="app-footer">
        <p>© 2025 OfficeMate</p>
      </footer>
    </div>
  )
}

export default App
