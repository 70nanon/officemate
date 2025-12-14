import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export interface Seat {
  id: string
  x: number
  y: number
  occupiedBy: string | null
  occupiedAt: Timestamp | null
  mapId: string
}

const SEATS_COLLECTION = 'seats'

// リアルタイムで座席データを監視
export function subscribeToSeats(callback: (seats: Seat[]) => void) {
  const q = query(collection(db, SEATS_COLLECTION))
  
  return onSnapshot(q, (snapshot) => {
    const seats: Seat[] = []
    snapshot.forEach((doc) => {
      seats.push({
        id: doc.id,
        ...doc.data()
      } as Seat)
    })
    callback(seats)
  })
}

// 座席を作成
export async function createSeat(seat: Omit<Seat, 'id'>) {
  const docRef = await addDoc(collection(db, SEATS_COLLECTION), seat)
  return docRef.id
}

// 座席を更新（占有/解放）
export async function updateSeat(seatId: string, userId: string | null) {
  const seatRef = doc(db, SEATS_COLLECTION, seatId)
  await updateDoc(seatRef, {
    occupiedBy: userId,
    occupiedAt: userId ? serverTimestamp() : null
  })
}

// 座席を削除
export async function deleteSeat(seatId: string) {
  const seatRef = doc(db, SEATS_COLLECTION, seatId)
  await deleteDoc(seatRef)
}

// 座席の位置を更新
export async function updateSeatPosition(seatId: string, x: number, y: number) {
  const seatRef = doc(db, SEATS_COLLECTION, seatId)
  await updateDoc(seatRef, { x, y })
}
