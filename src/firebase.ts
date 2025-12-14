// Firebase設定ファイル
// 使用方法: Firebaseコンソールから取得した設定情報をここに貼り付けてください
// https://console.firebase.google.com/

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TODO: Firebaseプロジェクトの設定情報に置き換えてください
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig)

// Firestoreデータベースのインスタンスを取得
export const db = getFirestore(app)

// Firebase認証のインスタンスを取得
export const auth = getAuth(app)

export default app
