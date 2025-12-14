import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth'
import { uploadImageWithRedirect } from '../services/imageUploadService'
import { saveUserProfile, subscribeToUserProfile, UserProfile } from '../services/userService'
import './ProfileSettings.css'

export default function ProfileSettings() {
  const { currentUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // currentUserが変更されたら初期値を設定
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '')
      setNewEmail(currentUser.email || '')
      
      // Firestoreからユーザープロフィールを購読
      const unsubscribe = subscribeToUserProfile(currentUser.uid, (profile) => {
        setUserProfile(profile)
      })
      
      return () => unsubscribe()
    }
  }, [currentUser])

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    if (!displayName.trim()) {
      setError('表示名を入力してください')
      return
    }

    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await updateProfile(currentUser, {
        displayName: displayName.trim()
      })

      // Firestoreのユーザープロフィールも更新
      await saveUserProfile(currentUser.uid, {
        displayName: displayName.trim()
      })

      setSuccess('プロフィールを更新しました')
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError('プロフィールの更新に失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (newPassword.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await updatePassword(currentUser, newPassword)
      
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('パスワードを変更しました')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        setError('セキュリティのため、再ログインが必要です')
      } else {
        setError('パスワードの変更に失敗しました: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    try {
      setError('')
      setSuccess('')
      setLoading(true)

      await updateEmail(currentUser, newEmail)
      
      setSuccess('メールアドレスを変更しました')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        setError('セキュリティのため、再ログインが必要です')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています')
      } else {
        setError('メールアドレスの変更に失敗しました: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    try {
      setUploading(true)
      setError('')

      const { url } = await uploadImageWithRedirect(file)
      
      // Firestoreのユーザープロフィールに画像URLを保存
      // Firebase Authの photoURL は Data URI が長すぎるため使用しない
      await saveUserProfile(currentUser.uid, {
        photoURL: url
      })

      setSuccess('プロフィール画像を更新しました')
      // 画面をリロードして画像を反映
      window.location.reload()
    } catch (err) {
      console.error(err)
      setError('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  if (!currentUser) {
    return <div className="profile-settings">ログインしてください</div>
  }

  return (
    <div className="profile-settings">
      <h2>プロフィール設定</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* プロフィール画像 */}
      <section className="profile-section">
        <h3>プロフィール画像</h3>
        <div className="profile-image-section">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="プロフィール" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">
              <span>👤</span>
            </div>
          )}
          <label className="upload-button">
            {uploading ? 'アップロード中...' : '画像を変更'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </section>

      {/* 表示名変更 */}
      <section className="profile-section">
        <h3>表示名</h3>
        <form onSubmit={handleUpdateProfile}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '更新中...' : '表示名を更新'}
          </button>
        </form>
      </section>

      {/* メールアドレス変更 */}
      <section className="profile-section">
        <h3>メールアドレス</h3>
        <form onSubmit={handleUpdateEmail}>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="新しいメールアドレス"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '更新中...' : 'メールアドレスを変更'}
          </button>
        </form>
      </section>

      {/* パスワード変更 */}
      <section className="profile-section">
        <h3>パスワード変更</h3>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="新しいパスワード"
            minLength={6}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード（確認）"
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? '更新中...' : 'パスワードを変更'}
          </button>
        </form>
      </section>
    </div>
  )
}
