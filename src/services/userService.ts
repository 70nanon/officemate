import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '../firebase'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ユーザープロフィールを作成または更新
 */
export async function saveUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  
  await setDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now()
  }, { merge: true })
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)
  
  if (!snapshot.exists()) {
    return null
  }
  
  return snapshot.data() as UserProfile
}

/**
 * ユーザープロフィールをリアルタイム購読
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  const userRef = doc(db, 'users', uid)
  
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile)
    } else {
      callback(null)
    }
  })
}

/**
 * 新規ユーザーのプロフィールを初期化
 */
export async function initializeUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  
  await setDoc(userRef, {
    uid,
    email,
    displayName,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}
