# ゴールプランナー - 仕様書

## 概要
ゴールプランナーは、個人の目標や夢を達成するために努力するユーザーが使用するツールです。使っていて元気になり、モチベーションが向上するスタイリッシュなデザインを採用しています。

## 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript/JavaScript (JSX)
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **状態管理**: React Hooks (useState, useEffect, useContext)
- **データ永続化**: localStorage

## プロジェクト構成

\`\`\`
app/
├── layout.jsx                 # ルートレイアウト（TimerProvider）
├── page.jsx                   # ダッシュボードページ
├── goals/
│   └── page.jsx              # 目標一覧ページ
├── records/
│   └── page.jsx              # 記録一覧ページ
├── data/
│   └── page.jsx              # データ分析ページ
├── timer/
│   └── page.jsx              # タイマーページ
└── feedback/
    └── page.jsx              # コーチフィードバックページ（準備中表示）

components/
├── sidebar.jsx               # サイドバー（ナビゲーション + タスク管理）
├── mobile-header.jsx         # モバイル用ヘッダー
└── timer-notification.jsx   # タイマー通知コンポーネント

contexts/
└── timer-context.jsx        # タイマー状態管理コンテキスト
\`\`\`

## デザインシステム

### 🎨 カラーパレット

#### メインカラー
- **プライマリグラデーション**: `from-violet-600 via-purple-600 to-blue-600`
- **セカンダリグラデーション**: `from-emerald-500 to-teal-600`
- **アクセントカラー**: `from-slate-700 to-slate-600`

#### 背景色
- **メイン背景**: `bg-gradient-to-br from-slate-50 via-white to-blue-50/30`
- **カード背景**: `bg-gradient-to-br from-white/80 to-slate-50/50`
- **ホバー背景**: `hover:from-slate-50/80 hover:to-blue-50/50`

#### ステータスカラー
- **成功**: `from-emerald-500 to-teal-600`
- **警告**: `from-amber-500 to-orange-600`
- **エラー**: `from-red-500 to-pink-500`
- **情報**: `from-blue-500 to-indigo-600`

### 🎯 コンポーネントスタイル

#### カード
\`\`\`css
.card {
  @apply bg-gradient-to-br from-white/80 to-slate-50/50;
  @apply rounded-2xl shadow-lg shadow-slate-200/50;
  @apply border border-slate-200/50;
  @apply backdrop-blur-sm;
  @apply transition-all duration-300;
}

.card:hover {
  @apply hover:scale-[1.02] hover:shadow-xl;
}
\`\`\`

#### ボタン
\`\`\`css
.btn-primary {
  @apply bg-gradient-to-r from-violet-500 to-purple-600;
  @apply text-white rounded-xl;
  @apply hover:from-violet-600 hover:to-purple-700;
  @apply transition-all duration-300;
  @apply font-semibold shadow-lg shadow-violet-500/30;
}
\`\`\`

#### 入力フィールド
\`\`\`css
.input {
  @apply px-3 py-2 border border-slate-300/50 rounded-xl;
  @apply focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500;
  @apply bg-white/50 backdrop-blur-sm font-medium;
  @apply transition-all duration-300;
}
\`\`\`

#### タイポグラフィ
\`\`\`css
.heading-primary {
  @apply text-4xl font-bold;
  @apply bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600;
  @apply bg-clip-text text-transparent;
}

.heading-secondary {
  @apply text-2xl font-bold;
  @apply bg-gradient-to-r from-slate-700 to-slate-600;
  @apply bg-clip-text text-transparent;
}
\`\`\`

## 機能仕様

### 1. ダッシュボード (`/`)
- **ヘッダー**: Homeアイコン + "ダッシュボード"タイトル
- **ビッグゴール一覧**: 折りたたみ可能なカード表示
- **最近の記録**: 展開可能な記録リスト
- **今週の進行度**: スモールゴールの進捗表示

### 2. 目標一覧 (`/goals`)
- **ヘッダー**: BarChart3アイコン + "目標一覧"タイトル
- **ビッグゴール管理**:
  - 作成・編集・削除・アーカイブ
  - 画像URL設定
  - **カテゴリ管理**: 動的追加可能
  - 期限管理・ステータス表示
- **スモールゴール管理**:
  - ビッグゴールとの関連付け
  - 進捗バー表示
  - 記録追加機能
- **達成済み目標**: 年別表示モーダル
- **アーカイブ機能**: 復元・完全削除

### 3. 記録一覧 (`/records`)
- **ヘッダー**: Calendarアイコン + "記録一覧"タイトル
- **月別タブ**: 記録の月別表示
- **記録作成**:
  - 気分・エネルギーレベル選択（絵文字）
  - 複数目標の同時記録
  - 自由コメント
  - 画像アップロード
- **下書き機能**: 自動保存・編集・削除
- **タイマー連携**: タイマー記録からの自動追加
- **AIフィードバック**: 記録に対するAIコメント表示

### 4. データ分析 (`/data`)
- **ヘッダー**: TrendingUpアイコン + "データ"タイトル
- **月別タブ**: データの月別表示
- **統計カード**:
  - 目標取り組み度（前月比較）
  - 記録日数
  - 平均気分・エネルギー
- **グラフ表示**: 気分とエネルギーの推移（Recharts使用）

### 5. タイマー (`/timer`)
- **ヘッダー**: Clockアイコン + "タイマー"タイトル
- **タイマー種類**:
  - ポモドーロ（25分作業・5分休憩）
  - カスタムタイマー（分・秒設定可能）
  - ストップウォッチ
- **スモールゴール連携**: タイマー実行時の目標選択
- **記録管理**: 今日の記録表示・編集・削除
- **バックグラウンド実行**: ページ離脱時の継続・復元
- **通知機能**: ブラウザ通知・アプリ内通知

### 6. コーチフィードバック (`/feedback`)
- **ヘッダー**: MessageSquareアイコン + "コーチフィードバック"タイトル
- **準備中表示**: 開発中の機能紹介
- **予定機能**:
  - 進捗分析とアドバイス
  - パーソナライズされたコーチング
  - リアルタイム対話機能
  - コミュニティ機能
- **開発状況**: プログレスバーで進捗表示

### 7. サイドバー
- **ナビゲーション**: 全ページへのリンク
- **タスク管理**:
  - タスク追加・完了・削除
  - ドラッグ&ドロップ並び替え
  - 完了タスクの一括アーカイブ
  - アーカイブ表示・非表示

## 状態管理

### TimerContext
\`\`\`javascript
// タイマー関連の状態
{
  timerType: "pomodoro" | "custom" | "stopwatch",
  isRunning: boolean,
  isPaused: boolean,
  time: number, // 秒
  initialTime: number,
  selectedGoal: Goal | null,
  pomodoroSettings: {
    workTime: number,
    shortBreak: number,
    longBreak: number,
    sessionsUntilLongBreak: number
  },
  pomodoroSession: number,
  isBreakTime: boolean,
  showNotification: boolean
}
\`\`\`

### localStorage使用データ
- `timerState`: タイマー状態の永続化
- `timerRecords`: タイマー記録
- `dailyRecords`: 日次記録
- `goals`: 目標データ
- `simpleTasks`: タスクデータ
- `simpleArchivedTasks`: アーカイブされたタスク
- `recordDrafts`: 記録の下書き

## データ構造

### ビッグゴール
\`\`\`javascript
{
  id: number,
  title: string,
  description: string,
  category: string, // 動的追加可能
  deadline: string, // YYYY-MM-DD
  status: "active" | "completed" | "on_hold" | "overdue",
  createdAt: string,
  completedAt: string | null,
  isArchived: boolean,
  imageUrl: string
}
\`\`\`

### スモールゴール
\`\`\`javascript
{
  id: number,
  title: string,
  description: string,
  bigGoalId: number,
  targetValue: number,
  currentValue: number,
  unit: string,
  deadline: string,
  status: "active" | "completed" | "overdue",
  createdAt: string,
  completedAt: string | null,
  isArchived: boolean,
  isCompleted: boolean
}
\`\`\`

### 記録
\`\`\`javascript
{
  id: number,
  date: string, // YYYY-MM-DD
  goals: [{
    goal: string,
    value: number,
    unit: string,
    comment: string
  }],
  dailyComment: string,
  mood: "very_good" | "good" | "neutral" | "bad" | "very_bad",
  energy: "very_high" | "high" | "normal" | "low" | "very_low",
  aiFeedback: string
}
\`\`\`

### タイマー記録
\`\`\`javascript
{
  id: number,
  type: "pomodoro" | "custom" | "stopwatch",
  duration: number, // 秒
  goal: Goal | null,
  startTime: Date,
  endTime: Date,
  date: string, // YYYY-MM-DD
  isBreakTime: boolean,
  comment?: string
}
\`\`\`

## UI/UX特徴

### レスポンシブデザイン
- **モバイル**: ハンバーガーメニュー、スタック表示
- **タブレット**: `md:` ブレークポイント使用
- **デスクトップ**: サイドバー固定、グリッドレイアウト

### アニメーション・エフェクト
- **ホバー効果**: `hover:scale-[1.02]`
- **トランジション**: `transition-all duration-300`
- **ガラス効果**: `backdrop-blur-sm`
- **グラデーション**: 全体的なグラデーション使用

### アクセシビリティ
- **セマンティックHTML**: 適切なHTML要素使用
- **ARIA属性**: 必要箇所にaria-label等設定
- **キーボードナビゲーション**: フォーカス管理
- **スクリーンリーダー**: sr-only クラス使用

## 開発ガイドライン

### 必須要素
1. **背景**: 全ページに統一されたグラデーション背景
2. **カード**: ガラス効果を適用したカードデザイン
3. **ボタン**: 統一されたグラデーションボタンスタイル
4. **タイポグラフィ**: 見出しにグラデーションテキスト
5. **アニメーション**: ホバー時のスケール効果

### 禁止事項
- 単色の背景色の使用
- 角ばったボーダーラディウス（`rounded-lg`以下）
- ガラス効果なしのカード
- グラデーションなしの見出し
- アニメーションなしのインタラクション

### パフォーマンス考慮
- `backdrop-blur`は必要最小限に使用
- アニメーションは`transform`と`opacity`を優先
- グラデーションは`bg-clip-text`で最適化
- localStorageの適切な使用

## 今後の拡張予定

### 未実装機能
- **コーチフィードバックページ**: AI分析とアドバイス（開発中）
- **通知システム**: プッシュ通知
- **データエクスポート**: CSV/JSON出力
- **目標テンプレート**: 事前定義された目標
- **ソーシャル機能**: 進捗共有

### 技術的改善
- **認証システム**: NextAuth.js
- **リアルタイム同期**: WebSocket
- **PWA対応**: オフライン機能
- **テスト実装**: Jest/Testing Library

## 🚀 クイックスタート

### 1. リポジトリのクローン
```bash
git clone https://github.com/YOUR_USERNAME/goal-planner.git
cd goal-planner
```

### 2. 依存関係のインストール
```bash
pnpm install
# または
npm install
```

### 3. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. Project Settings → API から以下をコピー:
   - `Project URL`
   - `anon public key`

### 4. 環境変数の設定
```bash
# .env.local ファイルを作成
cp .env.local.example .env.local
```

`.env.local` に以下を記入:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. データベースのセットアップ
Supabase SQL Editorで以下のスクリプトを**順番に**実行:

```bash
# 1. テーブル作成
scripts/01-create-tables.sql

# 2. セキュリティポリシー設定
scripts/02-create-rls-policies.sql

# 3. データベース関数作成
scripts/03-create-functions.sql

# 4. サンプルデータ追加（オプション）
scripts/04-seed-data-fixed.sql

# 5. デモアカウント作成（オプション）
scripts/05-create-demo-account-simple.sql
```

### 6. アプリケーションの起動
```bash
pnpm dev
# または
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス

## 📖 使用方法

### 🔐 認証
- **新規登録**: 実際のメールアドレスでサインアップ
- **クイックスタート**: デモ用メールアドレスで即座に体験
- **デモモード**: Supabase未設定時は自動的にデモデータで動作

### 🎯 目標管理
1. **ビッグゴール**: 長期的な大きな目標を設定
2. **スモールゴール**: 具体的で測定可能な小さな目標を設定
3. **カテゴリ**: 目標を分類して整理
4. **進捗追跡**: 数値ベースで進捗を記録

### ⏰ タイマー機能
- **ポモドーロテクニック**: 25分集中 + 5分休憩
- **カスタムタイマー**: 自由な時間設定
- **統計**: 集中時間の記録と分析

---

*このゴールプランナーは、ユーザーの目標達成を支援する美しく機能的なインターフェースを提供することを目的としています。*
