// Google Drive経由で画像をアップロードするサービス

const GAS_UPLOAD_URL = import.meta.env.VITE_GAS_UPLOAD_URL

export async function uploadImageToGoogleDrive(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async () => {
      try {
        const base64Image = reader.result as string
        
        await fetch(GAS_UPLOAD_URL, {
          method: 'POST',
          mode: 'no-cors', // GASはCORS制限があるため
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            fileName: file.name
          })
        })

        // no-corsモードでは詳細なレスポンスが取得できないため
        // uploadImageWithRedirect関数を使用することを推奨
        
        setTimeout(() => {
          // 仮のURL（実装によって変更が必要）
          resolve('uploaded-successfully')
        }, 2000)
        
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// GASへのアップロード（修正版）
export async function uploadImageWithRedirect(file: File): Promise<{ url: string; fileId: string }> {
  const reader = new FileReader()
  
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64Image = reader.result as string
        
        // FormDataを使用してPOST
        const formData = new FormData()
        formData.append('image', base64Image)
        formData.append('fileName', file.name)
        
        // GASにPOSTリクエスト
        const response = await fetch(GAS_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        })

        // レスポンスのテキストを取得
        const text = await response.text()
        
        try {
          const data = JSON.parse(text)
          
          if (data.success) {
            resolve({
              url: data.url,
              fileId: data.fileId
            })
          } else {
            reject(new Error(data.error || data.message || 'Upload failed'))
          }
        } catch (parseError) {
          // JSONパースに失敗した場合
          console.error('Response text:', text)
          reject(new Error('Invalid response from server'))
        }
        
      } catch (error) {
        console.error('Upload error:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
