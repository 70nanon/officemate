import { useState, useEffect } from 'react'
import { subscribeToSeats, Seat } from '../services/seatService'

export function useSeats() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Firestoreの座席データをリアルタイムで監視
      const unsubscribe = subscribeToSeats((updatedSeats) => {
        setSeats(updatedSeats)
        setLoading(false)
      })

      // クリーンアップ
      return () => unsubscribe()
    } catch (err) {
      console.error('Error subscribing to seats:', err)
      setError('座席データの取得に失敗しました')
      setLoading(false)
    }
  }, [])

  return { seats, loading, error }
}
