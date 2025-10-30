# デプロイガイド - Kashiwanoha Kids Lab

## 🚀 本番環境へのデプロイ手順

### 前提条件

- GitHubアカウント
- Supabaseアカウント
- Vercelアカウント

## ステップ1: Supabaseプロジェクトのセットアップ

### 1.1 プロジェクト作成

1. [Supabase](https://supabase.com)にログイン
2. "New Project"をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで待機（2-3分）

### 1.2 データベースマイグレーション実行

1. SupabaseダッシュボードのSQL Editorを開く
2. `supabase/migrations/00001_initial_schema.sql`の内容をコピー
3. SQL Editorに貼り付けて実行（RUN）
4. 成功メッセージを確認

### 1.3 認証設定

1. Authentication > Providersに移動
2. Email providerを有効化
3. "Enable email confirmations"をオフにする（Magic Linkのみ使用）

### 1.4 API Keysの取得

1. Settings > APIに移動
2. 以下をメモ:
   - Project URL
   - anon public key

## ステップ2: GitHub リポジトリの準備

### 2.1 リポジトリ作成

```bash
cd /home/user/webapp
git init
git add .
git commit -m "Initial commit: Kashiwanoha Kids Lab"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kashiwanoha-kids-lab.git
git push -u origin main
```

### 2.2 .env.localの除外確認

`.gitignore`に`.env.local`が含まれていることを確認（機密情報の保護）

## ステップ3: Vercel デプロイ

### 3.1 Vercelプロジェクト作成

1. [Vercel](https://vercel.com)にログイン
2. "Add New Project"をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定（例: kashiwanoha-kids-lab）

### 3.2 環境変数の設定

**Environment Variables**セクションで以下を追加:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**重要**: Production、Preview、Developmentすべてにチェックを入れる

### 3.3 デプロイ実行

1. "Deploy"ボタンをクリック
2. ビルドとデプロイが完了するまで待機（5-10分）
3. デプロイURLを確認

## ステップ4: 初期設定

### 4.1 管理者アカウント作成

1. デプロイされたアプリの`/auth/login`にアクセス
2. 管理者用メールアドレスを入力
3. メールのMagic Linkをクリック
4. Supabaseダッシュボードで`auth.users`からUser IDを取得

### 4.2 プロファイル作成

Supabase SQL Editorで実行:

```sql
INSERT INTO profiles (id, role, full_name, email)
VALUES (
  'your-user-id-from-auth-users',  -- auth.usersのID
  'admin',
  '管理者名',
  'admin@example.com'
);
```

### 4.3 動作確認

1. `/dashboard`にアクセス
2. 子どもを登録
3. 評価を作成
4. レーダーチャートが表示されることを確認
5. PDFダウンロードを実行
6. 共有リンクを作成してアクセス

## ステップ5: カスタムドメイン設定（オプション）

### 5.1 ドメイン追加

1. Vercelプロジェクトの"Settings" > "Domains"
2. カスタムドメインを追加（例: kids-lab.example.com）
3. DNSレコードを設定:
   ```
   Type: A
   Name: kids-lab
   Value: 76.76.21.21
   ```

### 5.2 環境変数の更新

```
NEXT_PUBLIC_APP_URL=https://kids-lab.example.com
```

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build

# 型エラーチェック
npm run type-check
```

### データベース接続エラー

- Supabase Project URLが正しいか確認
- Anon Keyが正しいか確認
- RLSポリシーが正しく設定されているか確認

### 認証エラー

- Supabase認証設定でEmail Providerが有効か確認
- Magic Linkのリダイレクト先が正しいか確認

## セキュリティチェックリスト

- [ ] 環境変数が正しく設定されている
- [ ] .env.localがGitに含まれていない
- [ ] Supabase RLSが全テーブルで有効
- [ ] 本番DBパスワードが強力
- [ ] APIキーがコードにハードコードされていない

## パフォーマンス最適化

### 画像最適化

Next.js Imageコンポーネントを使用（既に実装済み）

### キャッシング

```javascript
// app/dashboard/page.tsx
export const revalidate = 60 // 60秒ごとに再検証
```

## モニタリング

### Vercel Analytics

1. Vercelダッシュボードで"Analytics"を有効化
2. ページビュー、パフォーマンスメトリクスを確認

### Supabase Monitoring

1. SupabaseダッシュボードでDatabase > Reportsを確認
2. APIリクエスト数、レスポンスタイムを監視

## バックアップ戦略

### 日次バックアップ

Supabaseの自動バックアップを確認:
- Database > Backups
- Point-in-Time Recovery (PITR)が有効か確認

### 手動エクスポート

```bash
# データベースダンプ（週1回推奨）
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

## アップデート手順

```bash
# 機能追加・修正
git add .
git commit -m "Add new feature"
git push origin main

# Vercelが自動デプロイ
# ダッシュボードでデプロイ状況を確認
```

## サポート

問題が発生した場合:

1. Vercelのデプロイログを確認
2. Supabaseのログを確認
3. GitHubのIssuesで報告

---

© 2025 Kashiwanoha Kids Lab
