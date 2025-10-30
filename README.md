# Kashiwanoha Kids Lab - 運動能力評価システム

子どもの運動能力を科学的に評価し、発達段階を可視化するWebアプリケーションです。

## 🎯 プロジェクト概要

7つの基礎動作（走る、平均台移動、跳ぶ、投げる、捕る、つく、転がる）とSMC-Kidsの測定結果を記録し、レーダーチャート付きA4 PDFレポートを自動生成します。

### 主な機能

- ✅ 7つの基礎動作の5段階評価
- ✅ SMC-Kids測定（10m折り返し走、紙ボール投げ）
- ✅ レーダーチャートでの可視化
- ✅ A4 PDFレポート自動生成
- ✅ 共有リンク機能（期限付き・ワンタイム対応）
- ✅ 役割ベースアクセス制御（admin/coach/parent）
- ✅ 時系列での成長追跡
- ⚠️ 比較機能（時系列・2回比較）【実装途中】
- ⚠️ 親招待機能【実装途中】

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **チャート**: Recharts
- **PDF生成**: @react-pdf/renderer
- **データベース**: Supabase (Postgres + RLS)
- **認証**: Supabase Auth (Magic Link)
- **バリデーション**: Zod
- **フォーム**: React Hook Form
- **デプロイ**: Vercel

## 📊 データベース設計

### テーブル構成

#### profiles
- ユーザープロファイル（auth.usersの拡張）
- role: 'admin' | 'coach' | 'parent'

#### children
- 子どもの基本情報
- owner_profile_id: 保護者ID（RLS用）

#### assessments
- 評価記録
- child_id, coach_id, assessed_at, memo

#### fms_scores
- 7つの基礎動作スコア（1-5段階）
- run, balance_beam, jump, throw, catch, dribble, roll

#### smc_scores
- SMC-Kids測定結果
- shuttle_run_sec, paper_ball_throw_m

#### shared_links
- 共有リンク管理
- token, expires_at, one_time, accessed_at

### RLS (Row Level Security) ポリシー

- **admin/coach**: 全データの閲覧・編集可能
- **parent**: 自分の子どものデータのみ閲覧可能（編集不可）
- **共有リンク**: トークンベースでの認証不要アクセス

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQLエディタでマイグレーションを実行:
   ```bash
   supabase/migrations/00001_initial_schema.sql
   ```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、Supabaseの接続情報を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 📝 初期データのセットアップ

### 管理者アカウントの作成

1. `/auth/login`でメール認証リンクでログイン
2. Supabaseダッシュボードで`profiles`テーブルに手動でレコード追加:
   ```sql
   INSERT INTO profiles (id, role, full_name, email)
   VALUES (
     'your-user-id-from-auth-users',
     'admin',
     '管理者名',
     'admin@example.com'
   );
   ```

### テストデータの投入

SupabaseのSQLエディタで以下を実行:

```sql
-- コーチ用プロファイル作成（実際のauth.usersのIDを使用）
INSERT INTO profiles (id, role, full_name, email)
VALUES (
  'your-coach-user-id',
  'coach',
  '山田 太郎',
  'coach@example.com'
);

-- 子どもデータのサンプル
INSERT INTO children (owner_profile_id, first_name, last_name, birthdate, grade)
VALUES
  ('your-coach-user-id', '太郎', '田中', '2017-04-15', '小学1年生'),
  ('your-coach-user-id', '花子', '佐藤', '2018-06-20', '年長'),
  ('your-coach-user-id', '次郎', '鈴木', '2016-09-10', '小学2年生');
```

## 🎨 デザインシステム

### カラーパレット

```css
/* プライマリ */
--primary: #0ea5e9 (sky-500)
--primary-dark: #0284c7 (sky-600)

/* テキスト */
--text-primary: #111827 (gray-900)
--text-secondary: #6b7280 (gray-500)

/* 背景 */
--background: #f8fafc (slate-50)
--background-alt: #ffffff (white)

/* ボーダー */
--border: #e2e8f0 (slate-200)
```

### 角丸・間隔

```css
--radius-sm: 0.375rem (6px)
--radius: 0.625rem (10px)
--radius-lg: 1rem (16px)
--radius-xl: 1.5rem (24px)
```

## 📖 API エンドポイント

### 評価 (Assessments)

- `POST /api/assessments` - 新規評価作成
- `GET /api/assessments` - 評価一覧取得

### PDF生成

- `GET /api/pdf?id={assessment_id}` - PDFダウンロード

### 共有リンク

- `POST /api/share` - 共有リンク作成
  ```json
  {
    "assessment_id": "uuid",
    "expires_in_days": 7,
    "one_time": false
  }
  ```
- `GET /api/share?assessment_id={id}` - 共有リンク一覧取得

## 🚢 本番デプロイ (Vercel)

### 1. Vercelプロジェクトの作成

```bash
npm install -g vercel
vercel
```

### 2. 環境変数の設定

Vercelダッシュボードで以下を設定:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (本番URL)

### 3. デプロイ

```bash
vercel --prod
```

## 🔒 セキュリティ考慮事項

1. **RLS有効化**: 全テーブルでRow Level Securityを有効化
2. **共有リンク**: トークンベースの一時アクセス（署名付き、期限付き）
3. **API認証**: すべてのAPIエンドポイントで認証チェック
4. **XSS対策**: Next.jsのデフォルトエスケープ機能を使用
5. **CSRF対策**: SameSite Cookieとトークン検証

## 📊 パフォーマンス最適化

- **画像最適化**: Next.js Image コンポーネント使用
- **コード分割**: App Routerの自動コード分割
- **キャッシング**: ISR (Incremental Static Regeneration)
- **CDN配信**: Vercel Edge Network

## 🧪 テスト（準備中）

```bash
# ユニットテスト
npm run test

# E2Eテスト（Playwright）
npm run test:e2e
```

## 📦 バックアップ・リストア

### Supabaseデータベースのバックアップ

```bash
# pgdumpを使用（SupabaseダッシュボードのDatabase > Backups）
# または CLI経由
supabase db dump -f backup.sql
```

### リストア

```bash
supabase db reset
psql -h your-db-host -U postgres -d postgres -f backup.sql
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

## 👥 開発チーム

**Kashiwanoha Kids Lab 開発チーム**

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesセクションでお知らせください。

---

© 2025 Kashiwanoha Kids Lab. All rights reserved.
