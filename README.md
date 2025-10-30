# Kashiwanoha Kids Lab - 運動能力評価システム

子どもの運動能力を科学的に評価し、発達段階を可視化するWebアプリケーションです。

## 🌐 本番環境

- **Production URL**: https://kashiwanoha-kids-lab.vercel.app
- **GitHub Repository**: https://github.com/somu0202/kashiwanoha-kids-lab
- **Status**: ✅ デプロイ済み・稼働中

## 🎯 プロジェクト概要

7つの基礎動作（走る、平均台移動、跳ぶ、投げる、捕る、つく、転がる）とSMC-Kidsの測定結果を記録し、レーダーチャートで可視化します。

### ✅ 実装済み機能

- ✅ **認証システム**: Supabase Magic Link認証
- ✅ **ダッシュボード**: 役割別（admin/coach/parent）ダッシュボード
- ✅ **子ども管理**: 登録・一覧表示・詳細表示
- ✅ **評価フォーム**: 7つの基礎動作の5段階評価（1-5）
- ✅ **SMC-Kids測定**: 10m折り返し走（秒）、紙ボール投げ（メートル）
- ✅ **レーダーチャート**: Rechartsによる可視化
- ✅ **共有リンク機能**: 期限付き・ワンタイム対応のシェアリンク生成
- ✅ **Row Level Security**: Supabase RLSによる役割ベースアクセス制御
- ✅ **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

### 🔄 実装予定機能（優先順位順）

#### 高優先度
1. **PDF生成機能**: A4レポート自動生成（現在準備中）
   - Next.js 16互換ライブラリの選定中
   - 代替案: Puppeteer/jsPDF検討中

#### 中優先度
2. **比較機能**: 時系列での成長追跡
   - 同じ子どもの過去評価との比較
   - 2つの評価の並列レーダーチャート表示

3. **保護者招待システム**: メール招待機能
   - 保護者専用ダッシュボード
   - 子どもとの紐付け機能

#### 低優先度
4. **データ分析機能**
   - 年齢別平均値表示
   - 成長トレンドグラフ
   - グループ間比較

## 🏗️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (17コンポーネント実装)
  - Button, Card, Form, Input, Label, Select, Textarea
  - Badge, Avatar, Dropdown Menu, Dialog, Toast
  - Tabs, Alert, Progress, Separator, Skeleton
- **Charts**: Recharts 2.10
- **Form Management**: React Hook Form 7.49
- **Validation**: Zod 3.22
- **Date Handling**: date-fns 3.0

### バックエンド
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage（将来実装予定）
- **API**: Next.js API Routes (App Router)

### デプロイ・インフラ
- **Hosting**: Vercel (Edge Network)
- **CI/CD**: GitHub Actions（自動デプロイ）
- **Domain**: vercel.app
- **SSL**: Vercel自動SSL証明書

### 開発ツール
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier (設定済み)
- **Git**: GitHub
- **Version Control**: Git Flow

## 📊 データベース設計

### テーブル構成（6テーブル）

#### 1. profiles
ユーザープロファイル（auth.usersの拡張）
```sql
- id: UUID (PRIMARY KEY, auth.users.idへのFK)
- role: ENUM('admin', 'coach', 'parent')
- full_name: TEXT
- email: TEXT UNIQUE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. children
子どもの基本情報
```sql
- id: UUID (PRIMARY KEY)
- owner_profile_id: UUID (FK → profiles.id)
- first_name: TEXT
- last_name: TEXT
- birthdate: DATE
- grade: TEXT (nullable)
- notes: TEXT (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. assessments
評価記録
```sql
- id: UUID (PRIMARY KEY)
- child_id: UUID (FK → children.id)
- coach_id: UUID (FK → profiles.id)
- assessed_at: DATE
- memo: TEXT (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. fms_scores
7つの基礎動作スコア（1-5段階）
```sql
- id: UUID (PRIMARY KEY)
- assessment_id: UUID (UNIQUE, FK → assessments.id)
- run: INTEGER (1-5)
- balance_beam: INTEGER (1-5)
- jump: INTEGER (1-5)
- throw: INTEGER (1-5)
- catch: INTEGER (1-5)
- dribble: INTEGER (1-5)
- roll: INTEGER (1-5)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. smc_scores
SMC-Kids測定結果
```sql
- id: UUID (PRIMARY KEY)
- assessment_id: UUID (UNIQUE, FK → assessments.id)
- shuttle_run_sec: DECIMAL(5,2) (nullable)
- paper_ball_throw_m: DECIMAL(5,2) (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 6. shared_links
共有リンク管理
```sql
- id: UUID (PRIMARY KEY)
- assessment_id: UUID (FK → assessments.id)
- token: UUID (UNIQUE)
- expires_at: TIMESTAMP
- one_time: BOOLEAN
- accessed_at: TIMESTAMP (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### RLS (Row Level Security) ポリシー

#### Admin/Coach
- ✅ 全データの閲覧可能
- ✅ 子ども・評価データの作成・編集・削除可能
- ✅ 共有リンクの作成・管理可能

#### Parent
- ✅ 自分の子どものデータのみ閲覧可能
- ❌ 編集・削除不可
- ❌ 共有リンク作成不可

#### 共有リンク（認証不要）
- ✅ トークンベースでの特定評価閲覧
- ✅ 有効期限チェック
- ✅ ワンタイムアクセス制限

### データベーストリガー

1. **updated_at自動更新**: 全テーブルで更新日時を自動設定
2. **カスケード削除**: assessments削除時にfms_scores/smc_scores/shared_linksも削除

## 🚀 セットアップ手順

### 前提条件

- Node.js 18.17 以降
- npm 9.0 以降
- Supabaseアカウント
- Vercelアカウント（本番デプロイ用）

### 1. リポジトリのクローン

```bash
git clone https://github.com/somu0202/kashiwanoha-kids-lab.git
cd kashiwanoha-kids-lab
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクト設定から以下を取得:
   - Project URL
   - Anon/Public Key
   - Service Role Key（管理者操作用）

### 4. データベースマイグレーション

Supabase SQL Editorで以下のファイルを実行:

```bash
supabase/migrations/00001_initial_schema.sql
```

マイグレーションには以下が含まれます:
- 6テーブルの作成
- RLSポリシーの設定
- トリガーの設定
- インデックスの作成

### 5. 環境変数の設定

`.env.local`ファイルを作成:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 📝 初期データのセットアップ

### 管理者アカウントの作成

#### ステップ1: ユーザー登録
1. `/auth/login` にアクセス
2. 管理者用メールアドレスを入力
3. 受信したMagic Linkをクリック

#### ステップ2: プロファイル作成
Supabase SQL Editorで実行:

```sql
-- auth.users テーブルから自分のIDを確認
SELECT id, email FROM auth.users;

-- プロファイルを作成（上記で確認したIDを使用）
INSERT INTO profiles (id, role, full_name, email)
VALUES (
  'your-user-id-from-auth-users',  -- ← ここに実際のIDを貼り付け
  'admin',
  'システム管理者',
  'admin@example.com'
);
```

### テストデータの投入（任意）

```sql
-- コーチ用プロファイル（別のauth.usersを作成後）
INSERT INTO profiles (id, role, full_name, email)
VALUES (
  'coach-user-id',
  'coach',
  '山田 太郎',
  'coach@example.com'
);

-- 子どもデータのサンプル
INSERT INTO children (owner_profile_id, first_name, last_name, birthdate, grade, notes)
VALUES
  ('your-profile-id', '太郎', '田中', '2017-04-15', '小学1年生', 'テストデータ'),
  ('your-profile-id', '花子', '佐藤', '2018-06-20', '年長', 'テストデータ'),
  ('your-profile-id', '次郎', '鈴木', '2016-09-10', '小学2年生', 'テストデータ');

-- 評価データのサンプル
INSERT INTO assessments (child_id, coach_id, assessed_at, memo)
SELECT 
  c.id, 
  'your-coach-id', 
  CURRENT_DATE,
  '初回評価です'
FROM children c LIMIT 1
RETURNING id;

-- FMSスコアのサンプル（上記のassessment_idを使用）
INSERT INTO fms_scores (assessment_id, run, balance_beam, jump, throw, catch, dribble, roll)
VALUES ('assessment-id-from-above', 3, 4, 3, 4, 3, 3, 4);

-- SMCスコアのサンプル
INSERT INTO smc_scores (assessment_id, shuttle_run_sec, paper_ball_throw_m)
VALUES ('assessment-id-from-above', 45.5, 8.2);
```

## 🎨 デザインシステム

### カラーパレット

```css
/* プライマリカラー */
--primary: #0ea5e9 (sky-500)
--primary-hover: #0284c7 (sky-600)
--primary-light: #7dd3fc (sky-300)

/* テキスト */
--text-primary: #111827 (gray-900)
--text-secondary: #6b7280 (gray-500)
--text-muted: #9ca3af (gray-400)

/* 背景 */
--background: #f8fafc (slate-50)
--background-alt: #ffffff (white)
--background-hover: #f1f5f9 (slate-100)

/* ボーダー */
--border: #e2e8f0 (slate-200)
--border-light: #f1f5f9 (slate-100)

/* ステータスカラー */
--success: #10b981 (green-500)
--warning: #f59e0b (amber-500)
--error: #ef4444 (red-500)
--info: #3b82f6 (blue-500)
```

### タイポグラフィ

```css
/* 見出し */
h1: text-3xl (30px) font-bold
h2: text-2xl (24px) font-bold
h3: text-xl (20px) font-semibold
h4: text-lg (18px) font-semibold

/* 本文 */
body: text-base (16px)
small: text-sm (14px)
xs: text-xs (12px)
```

### 角丸・シャドウ

```css
/* 角丸 */
--radius-sm: 0.375rem (6px)
--radius: 0.625rem (10px)
--radius-lg: 1rem (16px)
--radius-xl: 1.5rem (24px)

/* シャドウ */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

## 📖 API エンドポイント

### 認証
- `GET /auth/login` - ログインページ
- Supabase Auth APIを使用（Magic Link）

### 評価 (Assessments)
- `POST /api/assessments` - 新規評価作成
  ```json
  {
    "child_id": "uuid",
    "assessed_at": "2025-01-15",
    "memo": "評価所見",
    "fms_scores": {
      "run": 4,
      "balance_beam": 3,
      "jump": 4,
      "throw": 3,
      "catch": 4,
      "dribble": 3,
      "roll": 4
    },
    "smc_scores": {
      "shuttle_run_sec": 45.5,
      "paper_ball_throw_m": 8.2
    }
  }
  ```
- `GET /api/assessments` - 評価一覧取得（認証必須）

### PDF生成
- `GET /api/pdf?id={assessment_id}` - PDFダウンロード
  - ⚠️ 現在準備中：JSONデータを返却

### 共有リンク
- `POST /api/share` - 共有リンク作成
  ```json
  {
    "assessment_id": "uuid",
    "expires_in_days": 7,
    "one_time": false
  }
  ```
  レスポンス:
  ```json
  {
    "id": "uuid",
    "token": "uuid",
    "expires_at": "2025-01-22T00:00:00Z",
    "one_time": false,
    "share_url": "https://your-app.vercel.app/share/{token}"
  }
  ```
- `GET /api/share?assessment_id={id}` - 共有リンク一覧取得

### 公開ページ
- `GET /share/{token}` - 共有リンク経由での評価閲覧（認証不要）

## 🚢 本番デプロイ (Vercel)

### 自動デプロイ設定済み

- ✅ GitHub連携済み
- ✅ `main`ブランチへのpushで自動デプロイ
- ✅ プレビューデプロイ対応（PRごと）

### 環境変数の設定

Vercel Dashboardで以下を設定:

1. Project Settings → Environment Variables
2. 以下の変数を追加:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://kashiwanoha-kids-lab.vercel.app
```

### デプロイコマンド

```bash
# プロダクションビルド
npm run build

# Vercel CLI経由でのデプロイ
vercel --prod
```

### デプロイ後の確認事項

- [ ] 本番URLへのアクセス確認
- [ ] 環境変数の設定確認
- [ ] Supabaseデータベース接続確認
- [ ] Magic Link認証動作確認
- [ ] RLSポリシー動作確認

## 🔒 セキュリティ考慮事項

### 実装済みセキュリティ対策

1. **Row Level Security (RLS)**
   - 全テーブルでRLS有効化
   - 役割ベースアクセス制御（RBAC）
   - ポリシー単位でのアクセス制限

2. **認証・認可**
   - Supabase Auth（Magic Link）
   - JWTトークンベース認証
   - API全エンドポイントで認証チェック

3. **共有リンク**
   - UUID v4トークン（推測不可能）
   - 有効期限設定必須
   - ワンタイムアクセス対応
   - アクセス履歴記録

4. **XSS対策**
   - Next.jsデフォルトエスケープ
   - dangerouslySetInnerHTML未使用
   - Content Security Policy設定

5. **CSRF対策**
   - SameSite Cookie設定
   - Supabase JWTトークン検証

6. **入力バリデーション**
   - Zodスキーマによるサーバーサイド検証
   - React Hook Formによるクライアントサイド検証
   - SQL Injection対策（パラメータ化クエリ）

7. **環境変数管理**
   - `.env.local`はGitignore対象
   - 本番環境変数はVercel Secret管理
   - Service Role Keyはサーバーサイドのみ使用

### 推奨セキュリティ設定

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## 📊 パフォーマンス最適化

### 実装済み最適化

1. **Next.js App Router**
   - 自動コード分割
   - Server Components活用
   - Streaming SSR

2. **画像最適化**
   - Next.js Image コンポーネント
   - WebP自動変換
   - 遅延ロード

3. **バンドルサイズ削減**
   - Tree Shaking
   - Dynamic Import
   - shadcn/ui（必要コンポーネントのみ）

4. **CDN配信**
   - Vercel Edge Network
   - 自動キャッシング
   - グローバルエッジロケーション

5. **データベース最適化**
   - インデックス設定
   - 効率的なクエリ設計
   - Connection Pooling

### パフォーマンス目標

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s

## 🧪 テスト（今後実装予定）

### テストフレームワーク候補

```bash
# ユニットテスト
npm run test            # Jest + React Testing Library

# E2Eテスト
npm run test:e2e        # Playwright

# 型チェック
npm run type-check      # TypeScript

# リント
npm run lint            # ESLint
```

## 📦 プロジェクト構成

```
kashiwanoha-kids-lab/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── assessments/          # 評価API
│   │   ├── pdf/                  # PDF生成API（準備中）
│   │   └── share/                # 共有リンクAPI
│   ├── auth/                     # 認証ページ
│   │   └── login/                # ログインページ
│   ├── dashboard/                # ダッシュボード（認証必須）
│   │   ├── assessments/          # 評価管理
│   │   └── children/             # 子ども管理
│   ├── share/                    # 共有ページ（認証不要）
│   │   └── [token]/              # トークンベースアクセス
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # トップページ
├── components/                   # Reactコンポーネント
│   ├── dashboard/                # ダッシュボード用コンポーネント
│   │   ├── assessment-form.tsx   # 評価フォーム
│   │   └── radar-chart.tsx       # レーダーチャート
│   └── ui/                       # shadcn/ui コンポーネント
├── lib/                          # ユーティリティ・設定
│   ├── constants/                # 定数定義
│   │   ├── fms.ts                # 7つの基礎動作定義
│   │   └── smc.ts                # SMC-Kids定義
│   ├── supabase/                 # Supabase設定
│   │   ├── client.ts             # クライアントサイド
│   │   ├── server.ts             # サーバーサイド
│   │   └── middleware.ts         # セッション管理
│   ├── utils/                    # ヘルパー関数
│   │   ├── age.ts                # 年齢計算
│   │   └── token.ts              # トークン生成・検証
│   └── validations/              # Zodスキーマ
│       └── schemas.ts            # バリデーションスキーマ
├── supabase/                     # Supabaseマイグレーション
│   └── migrations/               # SQLマイグレーションファイル
│       └── 00001_initial_schema.sql
├── types/                        # TypeScript型定義
│   └── database.ts               # Supabaseデータベース型
├── public/                       # 静的ファイル
├── .env.local.example            # 環境変数テンプレート
├── .gitignore                    # Git除外設定
├── next.config.ts                # Next.js設定
├── package.json                  # 依存関係
├── proxy.ts                      # Next.js 16プロキシ（認証）
├── tailwind.config.ts            # Tailwind CSS設定
├── tsconfig.json                 # TypeScript設定
└── README.md                     # このファイル
```

## 🐛 既知の問題・制限事項

### 現在の制限
1. **PDF生成機能**: 準備中（Next.js 16 Turbopack互換性の問題）
   - 代替案検討中（Puppeteer / jsPDF）
2. **比較機能**: 未実装
3. **保護者招待システム**: 未実装

### 既知の問題
- なし（現時点）

### 解決済みの問題
- ✅ Supabase型エラー（as any型アサーションで解決）
- ✅ Next.js 16設定警告（turbo設定削除）
- ✅ middleware警告（proxy.tsに移行）

## 🔄 バックアップ・リストア

### Supabaseデータベースのバックアップ

#### 方法1: Supabaseダッシュボード
1. Database → Backups
2. "Create Backup" をクリック
3. 自動バックアップも利用可能

#### 方法2: CLI経由
```bash
# pgdumpを使用
supabase db dump -f backup.sql

# 特定テーブルのみ
pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
  -t public.children -t public.assessments \
  -f backup_partial.sql
```

### リストア

```bash
# データベースリセット
supabase db reset

# SQLファイルから復元
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

## 🤝 コントリビューション

プルリクエストを歓迎します！以下の手順に従ってください:

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更をコミット
   ```bash
   git commit -m 'Add: 素晴らしい機能を追加'
   ```
4. ブランチにプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
5. プルリクエストを作成

### コミットメッセージ規約

```
Add: 新機能追加
Fix: バグ修正
Update: 既存機能の更新
Refactor: リファクタリング
Docs: ドキュメント更新
Style: コードスタイル修正
Test: テスト追加・修正
```

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

## 👥 開発チーム

**Kashiwanoha Kids Lab 開発チーム**
- GitHub: [@somu0202](https://github.com/somu0202)

## 📞 サポート・お問い合わせ

### 質問・バグレポート
GitHubのIssuesセクションでお知らせください:
https://github.com/somu0202/kashiwanoha-kids-lab/issues

### 機能リクエスト
新機能のリクエストもIssuesで受け付けています。

## 📅 更新履歴

### 2025-10-30
- ✅ 初回リリース
- ✅ Next.js 14 + Supabaseで基本機能実装
- ✅ Vercelへのデプロイ完了
- ✅ RLS設定完了
- ✅ 共有リンク機能実装

### 今後の予定
- 📅 2025-11: PDF生成機能実装
- 📅 2025-12: 比較機能実装
- 📅 2026-01: 保護者招待システム実装

---

© 2025 Kashiwanoha Kids Lab. All rights reserved.
