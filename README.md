# 在庫管理システム (Zaiko)

React + Go + SQLite を使用したシンプルな在庫管理システムです。

## 機能

- **ダッシュボード**: 在庫状況の統計、グラフ表示、最近の入出庫履歴
- **商品管理**: 商品の登録・編集・削除、カテゴリ分類、検索・フィルター
- **倉庫管理**: 複数倉庫の登録・管理
- **在庫管理**: 入庫・出庫処理、在庫一覧、入出庫履歴
- **認証**: JWT認証によるログイン機能

## 技術スタック

### バックエンド
- Go 1.21+
- Gin (HTTPフレームワーク)
- SQLite (データベース)
- JWT (認証)

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts (グラフ)
- Zustand (状態管理)

## セットアップ

### 必要条件
- Go 1.21以上
- Node.js 18以上
- npm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/zaiko.git
cd zaiko

# バックエンドの依存関係をインストール
cd backend
go mod download

# フロントエンドの依存関係をインストール
cd ../frontend
npm install
```

### 起動

**バックエンド** (ターミナル1)
```bash
cd backend
go run cmd/server/main.go
```
サーバーが http://localhost:8080 で起動します。

**フロントエンド** (ターミナル2)
```bash
cd frontend
npm run dev
```
http://localhost:5173 でアクセスできます。

### 初期ログイン
- ユーザー名: `admin`
- パスワード: `admin`

## プロジェクト構造

```
zaiko/
├── backend/
│   ├── cmd/server/          # エントリーポイント
│   └── internal/
│       ├── config/          # 設定管理
│       ├── database/        # DB接続・マイグレーション
│       ├── models/          # データモデル
│       ├── handlers/        # APIハンドラー
│       ├── repository/      # データアクセス層
│       ├── service/         # ビジネスロジック
│       └── middleware/      # ミドルウェア
└── frontend/
    └── src/
        ├── components/      # UIコンポーネント
        ├── pages/           # ページコンポーネント
        ├── services/        # API呼び出し
        ├── store/           # 状態管理
        ├── types/           # 型定義
        └── hooks/           # カスタムフック

```

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報

### 商品
- `GET /api/products` - 商品一覧
- `POST /api/products` - 商品登録
- `PUT /api/products/:id` - 商品更新
- `DELETE /api/products/:id` - 商品削除

### カテゴリ
- `GET /api/categories` - カテゴリ一覧
- `POST /api/categories` - カテゴリ登録

### 倉庫
- `GET /api/warehouses` - 倉庫一覧
- `POST /api/warehouses` - 倉庫登録
- `PUT /api/warehouses/:id` - 倉庫更新
- `DELETE /api/warehouses/:id` - 倉庫削除

### 在庫
- `GET /api/stock` - 在庫一覧
- `POST /api/stock/in` - 入庫
- `POST /api/stock/out` - 出庫
- `GET /api/stock/transactions` - 入出庫履歴

### ダッシュボード
- `GET /api/dashboard/summary` - 統計サマリー

## ライセンス

MIT
