import { useState, useRef } from 'react'
import './SeatMap.css'

interface Seat {
  id: string
  x: number
  y: number
  occupiedBy: string | null
}

interface SeatMapProps {
  currentUser: string
}

function SeatMap({ currentUser }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([
    { id: 'seat-1', x: 100, y: 100, occupiedBy: null },
    { id: 'seat-2', x: 250, y: 100, occupiedBy: null },
    { id: 'seat-3', x: 400, y: 100, occupiedBy: null },
    { id: 'seat-4', x: 100, y: 250, occupiedBy: null },
    { id: 'seat-5', x: 250, y: 250, occupiedBy: null },
    { id: 'seat-6', x: 400, y: 250, occupiedBy: null },
  ])

  const [mapImage, setMapImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setMapImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSeatClick = (seatId: string) => {
    if (!currentUser) {
      alert('座席を選択するにはログインしてください')
      return
    }

    setSeats(seats.map(seat => {
      if (seat.id === seatId) {
        // 空席の場合は占有、自分が座っている場合は解除
        if (!seat.occupiedBy) {
          return { ...seat, occupiedBy: currentUser }
        } else if (seat.occupiedBy === currentUser) {
          return { ...seat, occupiedBy: null }
        }
      }
      return seat
    }))
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
        />
        <button onClick={() => fileInputRef.current?.click()}>
          📁 オフィスマップを読み込む
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
                  onClick={() => handleSeatClick(seat.id)}
                  className={`seat ${
                    seat.occupiedBy === currentUser
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
