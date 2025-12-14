# Google Apps Script セットアップ手順

## 1. Google Apps Script プロジェクトを作成

1. https://script.google.com/ にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: `OfficeMate Image Upload`

## 2. 以下のコードを貼り付け

```javascript
// コード.gs

function doPost(e) {
  try {
    // CORS対応
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // リクエストからデータを取得
    const data = JSON.parse(e.postData.contents);
    const imageData = data.image; // Base64エンコードされた画像
    const fileName = data.fileName || 'office-map-' + new Date().getTime() + '.png';
    
    // Base64をデコード
    const blob = Utilities.newBlob(
      Utilities.base64Decode(imageData.split(',')[1]), 
      'image/png', 
      fileName
    );
    
    // Google Driveのフォルダを取得または作成
    const folderName = 'OfficeMate Maps';
    const folders = DriveApp.getFoldersByName(folderName);
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    // ファイルをアップロード
    const file = folder.createFile(blob);
    
    // ファイルを公開設定
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 直接アクセス可能なURLを生成
    const fileId = file.getId();
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    return output.setContent(JSON.stringify({
      success: true,
      url: directUrl,
      fileId: fileId,
      fileName: fileName
    }));
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OfficeMate Image Upload API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

## 3. デプロイ

1. 右上の「デプロイ」→「新しいデプロイ」
2. 種類: **ウェブアプリ**
3. 説明: `v1`
4. 実行ユーザー: **自分**
5. アクセスできるユーザー: **全員**
6. 「デプロイ」をクリック
7. **ウェブアプリのURL**をコピー（例: `https://script.google.com/macros/s/...../exec`）

## 4. URLを環境変数に設定

`.env`ファイルにGASのURLを追加：

```env
VITE_GAS_UPLOAD_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

これで準備完了です！
