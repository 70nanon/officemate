# 🪑 OfficeMate

フリーアドレスなオフィスでの座席管理をサポートするWebアプリケーションです。

## ✨ 機能

- 📍 オフィスマップ画像のアップロード
- 🎯 座席位置へのアイコン配置
- 👤 ワンクリックで座席の使用状況を更新
- 🔄 リアルタイムで他の社員の座席状況を確認
- 🔐 Firebase認証によるユーザー管理

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **バックエンド**: Firebase
  - **Authentication**: ユーザー認証・アカウント管理
  - **Firestore**: リアルタイムデータベース
  - **Storage**: 画像ファイル保存
- **スタイル**: CSS Modules

---

## 🏗️ アーキテクチャ設計

### 認証・アカウント管理

**Firebase Authentication** を使用：

- **推奨認証方法**: Google/Microsoft ログイン（社内アカウント連携）
- **代替手段**: メール/パスワード認証、匿名認証
- **メリット**: パスワード管理不要、シングルサインオン

### プロフィール管理

**Firestore** でユーザー情報を管理：

```typescript
users (コレクション)
  └── {userId} (ドキュメント)
      ├── displayName: string      // 表示名
      ├── email: string            // メールアドレス
      ├── avatarURL: string        // プロフィール画像URL
      ├── department: string       // 部署
      ├── position: string         // 役職
      └── createdAt: timestamp     // 作成日時
```

### アイコン画像アップロード

**Firebase Storage** でファイル管理：

```
avatars/
  └── {userId}.jpg  // ユーザーごとのプロフィール画像

maps/
  └── {mapId}.jpg   // オフィスマップ画像
```

**実装フロー**:
1. ユーザーが画像を選択
2. Firebase Storage にアップロード
3. ダウンロードURLを取得
4. Firestore のユーザードキュメントに URL を保存

### 座席データ構造

**Firestore** で座席情報を管理：

```typescript
seats (コレクション)
  └── {seatId} (ドキュメント)
      ├── id: string              // 座席ID
      ├── x: number               // X座標
      ├── y: number               // Y座標
      ├── occupiedBy: string | null  // 使用中のユーザーID
      ├── occupiedAt: timestamp | null  // 占有開始時刻
      └── mapId: string           // 所属するマップID
```

### アクセス制御

**Firestore Security Rules** で権限管理：

```javascript
// 自分のプロフィールのみ編集可能
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// 座席は全員読み書き可（ログイン必須）
match /seats/{seatId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

---

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Firebaseアカウント

---

## 📅 開発計画

このプロジェクトは段階的に機能を実装していきます。以下の順序で進めることを推奨します。

### フェーズ1: 環境構築とローカル開発環境の整備 ✅

**目標**: プロジェクトの基本構造を構築し、ローカルで動作確認できる状態にする

- [x] Vite + React + TypeScript プロジェクトの初期化
- [x] 必要な依存関係のインストール
- [x] 基本的なUI コンポーネントの作成（ヘッダー、座席マップ）
- [x] スタイルの適用
- [x] 開発サーバーでの動作確認

**確認方法**:
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開き、アプリが表示されることを確認

---

### フェーズ2: Firebase プロジェクトのセットアップ 🔄

**目標**: Firebase プロジェクトを作成し、アプリケーションと接続する

#### ステップ2-1: Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `seat-management-app`）
4. Google アナリティクスの設定（任意）
5. プロジェクトを作成

#### ステップ2-2: Webアプリの追加

1. プロジェクト概要ページで「Web」アイコン（`</>`）をクリック
2. アプリのニックネームを入力（例: `座席管理Web`）
3. Firebase Hosting の設定はスキップ（後で設定可能）
4. 表示される設定情報（`firebaseConfig`）をコピー

#### ステップ2-3: Firestore Databaseの有効化

1. 左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（推奨: `asia-northeast1` - 東京）
4. **テストモードで開始**を選択（開発中のみ、後で変更）
5. 「有効にする」をクリック

#### ステップ2-4: Firebase Authenticationの有効化

1. 左メニューから「Authentication」を選択
2. 「始める」をクリック
3. ログイン方法タブで「メール/パスワード」を選択
4. 「メール/パスワード」を有効にして保存

#### ステップ2-5: 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` ファイルを開いて、ステップ2-2でコピーした設定情報を記入:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**または** `src/firebase.ts` ファイルに直接記入することも可能です。

#### ステップ2-6: 接続テスト

開発サーバーを再起動して、Firebaseとの接続を確認:

```bash
npm run dev
```

ブラウザのコンソールでエラーが出ないことを確認。

---

### フェーズ3: Firebase Authentication の実装 📝

**目標**: ユーザー登録・ログイン機能を実装する

#### 実装内容:

- [ ] ログイン/サインアップフォームの作成
- [ ] Firebase Auth を使ったメール/パスワード認証の実装
- [ ] ログイン状態の管理（React Context または状態管理ライブラリ）
- [ ] ログアウト機能
- [ ] ログイン状態に応じたUI表示切り替え

#### 新規作成ファイル:
- `src/contexts/AuthContext.tsx` - 認証状態管理
- `src/components/LoginForm.tsx` - ログインフォーム
- `src/components/SignupForm.tsx` - サインアップフォーム

**確認方法**: ユーザー登録してログインできることを確認

---

### フェーズ4: Firestore データベースとの連携 📝

**目標**: 座席情報をFirestoreに保存し、リアルタイムで同期する

#### ステップ4-1: Firestoreデータ構造の設計

```
seats (コレクション)
  └── {seatId} (ドキュメント)
      ├── id: string
      ├── x: number
      ├── y: number
      ├── occupiedBy: string | null
      ├── occupiedAt: timestamp | null
      └── mapId: string (将来的に複数マップ対応)
```

#### ステップ4-2: CRUD操作の実装

- [ ] 座席データの読み込み（`onSnapshot` でリアルタイム取得）
- [ ] 座席の占有（ユーザーが座席をクリック時）
- [ ] 座席の解放（もう一度クリック時）
- [ ] 座席データの作成・更新

#### 新規作成ファイル:
- `src/services/seatService.ts` - Firestore操作のロジック
- `src/hooks/useSeats.ts` - 座席データ取得のカスタムフック

**確認方法**: 
- 複数のブラウザで開き、一方で座席を選択すると他方にもリアルタイムで反映されることを確認
- Firebase Consoleでデータが保存されていることを確認

---

### フェーズ5: オフィスマップ管理機能 📝

**目標**: オフィスマップ画像のアップロードと座席配置の永続化

#### 実装内容:

- [ ] Firebase Storage の有効化
- [ ] マップ画像のアップロード機能
- [ ] アップロードした画像のURL保存
- [ ] マップと座席の紐付け
- [ ] 座席配置の編集モード（ドラッグ&ドロップで座席位置を変更）

#### 新規作成ファイル:
- `src/services/storageService.ts` - Firebase Storage操作
- `src/components/MapUploader.tsx` - マップアップロード
- `src/components/SeatEditor.tsx` - 座席配置編集

**確認方法**: 
- 画像をアップロードし、リロード後も表示されることを確認
- 座席位置を変更して保存、リロード後も反映されることを確認

---

### フェーズ6: 追加機能とUI改善 📝

**目標**: ユーザビリティを向上させる

#### 実装候補:

- [ ] 座席予約機能（未来の日付で予約）
- [ ] 座席履歴の表示（誰がいつ座っていたか）
- [ ] 座席検索機能（特定のユーザーを探す）
- [ ] 通知機能（誰かが座席に着いた時）
- [ ] ダークモード/ライトモードの切り替え
- [ ] レスポンシブデザインの改善
- [ ] 管理者機能（座席の追加/削除、ユーザー管理）
- [ ] 座席の属性設定（窓際、電源あり、モニターありなど）

---

### フェーズ7: セキュリティとデプロイ 📝

**目標**: 本番環境へのデプロイとセキュリティ設定

#### ステップ7-1: Firestoreセキュリティルールの設定

Firebaseコンソールで適切なセキュリティルールを設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /seats/{seatId} {
      // 認証済みユーザーのみ読み取り可能
      allow read: if request.auth != null;
      // 座席の更新は認証済みユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```

#### ステップ7-2: Firebase Hostingへのデプロイ

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトの初期化
firebase init

# ビルド
npm run build

# デプロイ
firebase deploy
```

#### ステップ7-3: 本番環境の環境変数設定

Firebase Hostingの環境変数を設定するか、ビルド時に環境変数を埋め込む。

**確認方法**: 
- デプロイされたURLでアプリケーションが動作することを確認
- セキュリティルールが正しく動作することを確認

---

## 🚀 セットアップ手順

### 1. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 2. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Webアプリを追加して設定情報を取得
4. Firestore Databaseを有効化
5. Firebase Authenticationを有効化（Email/Password認証を推奨）

### 3. 環境変数の設定

\`.env.example\`をコピーして\`.env\`ファイルを作成し、Firebaseの設定情報を記入してください。

\`\`\`bash
cp .env.example .env
\`\`\`

または、\`src/firebase.ts\`ファイルに直接設定情報を記入してください。

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで http://localhost:5173 を開いてアプリケーションを確認できます。

## 📱 使い方

1. **ログイン**: 画面右上の「ログイン」ボタンをクリック
2. **マップアップロード**: 「オフィスマップを読み込む」ボタンからオフィスの画像をアップロード
3. **座席選択**: 座りたい座席のアイコンをクリックして使用状況を更新
4. **座席解除**: 自分が座っている座席をもう一度クリックすると解除されます

## 🏗️ ビルド

本番環境用にビルドする場合:

\`\`\`bash
npm run build
\`\`\`

ビルドされたファイルは\`dist\`フォルダに出力されます。

## 🔍 プレビュー

ビルド後のアプリケーションをプレビューする場合:

\`\`\`bash
npm run preview
\`\`\`

## 📂 プロジェクト構造

\`\`\`
officemate/
├── src/
│   ├── components/
│   │   ├── SeatMap.tsx       # 座席マップコンポーネント
│   │   └── SeatMap.css       # 座席マップのスタイル
│   ├── App.tsx                # メインアプリケーション
│   ├── App.css                # アプリケーションのスタイル
│   ├── main.tsx               # エントリーポイント
│   ├── index.css              # グローバルスタイル
│   └── firebase.ts            # Firebase設定
├── public/                    # 静的ファイル
├── index.html                 # HTMLテンプレート
├── package.json               # 依存関係の定義
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
└── README.md                  # このファイル
\`\`\`

## 🔧 今後の拡張予定

- [ ] Firestoreとの連携（リアルタイム同期）
- [ ] Firebase Authenticationの実装
- [ ] 座席の永続化
- [ ] 座席予約機能
- [ ] 過去の座席履歴表示
- [ ] モバイル対応の改善
- [ ] ダークモード/ライトモードの切り替え
- [ ] 管理者機能（座席の追加/削除）

## 📝 ライセンス

MIT

## 🤝 コントリビューション

プルリクエストは歓迎します！大きな変更を加える場合は、まずissueを開いて変更内容を議論してください。

## 📞 サポート

問題が発生した場合は、GitHubのissueセクションで報告してください。
