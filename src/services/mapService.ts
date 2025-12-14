import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export interface OfficeMap {
  imageUrl: string
  uploadedBy: string
  uploadedAt: any
  name: string
}

const MAPS_COLLECTION = 'maps'
const DEFAULT_MAP_ID = 'default'

// デフォルトマップを取得
export async function getDefaultMap(): Promise<OfficeMap | null> {
  const docRef = doc(db, MAPS_COLLECTION, DEFAULT_MAP_ID)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return docSnap.data() as OfficeMap
  }
  return null
}

// デフォルトマップをリアルタイムで監視
export function subscribeToDefaultMap(callback: (map: OfficeMap | null) => void) {
  const docRef = doc(db, MAPS_COLLECTION, DEFAULT_MAP_ID)
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as OfficeMap)
    } else {
      callback(null)
    }
  })
}

// マップを保存
export async function saveMap(imageUrl: string, userId: string, name: string = 'オフィスマップ') {
  const docRef = doc(db, MAPS_COLLECTION, DEFAULT_MAP_ID)
  await setDoc(docRef, {
    imageUrl,
    uploadedBy: userId,
    uploadedAt: serverTimestamp(),
    name
  })
}
