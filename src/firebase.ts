// Firebase設定ファイル
// 使用方法: Firebaseコンソールから取得した設定情報をここに貼り付けてください
// https://console.firebase.google.com/

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TODO: Firebaseプロジェクトの設定情報に置き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyBFtFB76U_63QAmHC2pRNsBjQ_lmrGVdlg",
  authDomain: "officemate-3d064.firebaseapp.com",
  projectId: "officemate-3d064",
  storageBucket: "officemate-3d064.firebasestorage.app",
  messagingSenderId: "810377340428",
  appId: "1:810377340428:web:11b216d47cbe1b48dd7029",
  measurementId: "G-8S0FEXD3H0"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig)

// Firestoreデータベースのインスタンスを取得
export const db = getFirestore(app)

// Firebase認証のインスタンスを取得
export const auth = getAuth(app)

export default app
