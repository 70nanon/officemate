import { useState, useRef, useEffect } from 'react'
import './SeatMap.css'
import { useSeats } from '../hooks/useSeats'
import { updateSeat } from '../services/seatService'
import { useAuth } from '../contexts/AuthContext'
import { uploadImageWithRedirect } from '../services/imageUploadService'
import { saveMap, subscribeToDefaultMap } from '../services/mapService'

interface SeatMapProps {
  currentUser: string
}

function SeatMap({ currentUser }: SeatMapProps) {
  const { seats, loading, error } = useSeats()
  const { currentUser: authUser } = useAuth()
  const [mapImage, setMapImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Firestoreからマップ画像を取得
  useEffect(() => {
    const unsubscribe = subscribeToDefaultMap((map) => {
      if (map?.imageUrl) {
        setMapImage(map.imageUrl)
      }
    })
    return unsubscribe
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !authUser) return

    if (!window.confirm('オフィスマップをアップロードしますか？全ユーザーに共有されます。')) {
      return
    }

    try {
      setUploading(true)

      // Google Drive経由でアップロード
      const { url } = await uploadImageWithRedirect(file)
      
      // FirestoreにURLを保存
      await saveMap(url, authUser.uid, file.name)
      
      // 画面に反映
      setMapImage(url)
      
      alert('マップをアップロードしました！')
    } catch (err) {
      console.error('Upload error:', err)
      alert('アップロードに失敗しました。GASの設定を確認してください。')
    } finally {
      setUploading(false)
    }
  }

  const handleSeatClick = async (seatId: string, currentOccupant: string | null) => {
    if (!authUser) {
      alert('座席を選択するにはログインしてください')
      return
    }

    try {
      if (!currentOccupant) {
        await updateSeat(seatId, authUser.uid)
      } else if (currentOccupant === authUser.uid) {
        await updateSeat(seatId, null)
      } else {
        alert('この座席は既に使用されています')
      }
    } catch (err) {
      console.error('Error updating seat:', err)
      alert('座席の更新に失敗しました')
    }
  }

  const initializeSeats = async () => {
    if (!window.confirm('初期座席データを作成しますか？（既存データは残ります）')) {
      return
    }

    const { createSeat } = await import('../services/seatService')
    const initialSeats = [
      { x: 100, y: 100, occupiedBy: null, occupiedAt: null, mapId: 'default' },
      { x: 250, y: 100, occupiedBy: null, occupiedAt: null, mapId: 'default' },
      { x: 400, y: 100, occupiedBy: null, occupiedAt: null, mapId: 'default' },
      { x: 100, y: 250, occupiedBy: null, occupiedAt: null, mapId: 'default' },
      { x: 250, y: 250, occupiedBy: null, occupiedAt: null, mapId: 'default' },
      { x: 400, y: 250, occupiedBy: null, occupiedAt: null, mapId: 'default' },
    ]

    try {
      for (const seat of initialSeats) {
        await createSeat(seat)
      }
      alert('座席データを作成しました！')
    } catch (err) {
      console.error('Error creating seats:', err)
      alert('座席データの作成に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="seat-map-container">
        <div className="loading">座席データを読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="seat-map-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  // 座席がない場合は初期化ボタンを表示
  if (seats.length === 0) {
    return (
      <div className="seat-map-container">
        <div className="placeholder">
          <p>📍 座席データがありません</p>
          <button onClick={initializeSeats} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            初期座席データを作成
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="seat-map-container">
      <div className="controls">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ アップロード中...' : '📁 オフィスマップを読み込む'}
        </button>
        <div className="legend">
          <span className="legend-item">
            <span className="seat-icon available">🪑</span> 空席
          </span>
          <span className="legend-item">
            <span className="seat-icon occupied">🪑</span> 使用中
          </span>
          <span className="legend-item">
            <span className="seat-icon my-seat">🪑</span> 自分の席
          </span>
        </div>
      </div>

      <div className="map-area">
        {mapImage ? (
          <div className="map-with-seats">
            <img src={mapImage} alt="オフィスマップ" className="office-map" />
            <svg className="seats-overlay">
              {seats.map(seat => (
                <g
                  key={seat.id}
                  onClick={() => handleSeatClick(seat.id, seat.occupiedBy)}
                  className={`seat ${
                    seat.occupiedBy === authUser?.uid
                      ? 'my-seat'
                      : seat.occupiedBy
                      ? 'occupied'
                      : 'available'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r="20"
                    className="seat-circle"
                  />
                  <text
                    x={seat.x}
                    y={seat.y + 5}
                    textAnchor="middle"
                    className="seat-emoji"
                  >
                    🪑
                  </text>
                  {seat.occupiedBy && (
                    <text
                      x={seat.x}
                      y={seat.y + 40}
                      textAnchor="middle"
                      className="seat-label"
                    >
                      {seat.occupiedBy}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="placeholder">
            <p>📍 オフィスマップをアップロードして座席を配置しましょう</p>
            <button onClick={() => fileInputRef.current?.click()}>
              画像を選択
            </button>
          </div>
        )}
      </div>

      <div className="seat-list">
        <h3>座席一覧</h3>
        <ul>
          {seats.map(seat => (
            <li key={seat.id}>
              {seat.id}: {seat.occupiedBy || '空席'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SeatMap
