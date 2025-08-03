"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Activity,
  Clock,
  Download,
  RefreshCw,
  BarChart3,
  PieChartIcon,
  AlertCircle,
} from "lucide-react"
import Sidebar from "../../components/sidebar"
import { useAuth } from "../../contexts/auth-context"
import { recordsApi, timerRecordsApi, bigGoalsApi, smallGoalsApi } from "../../lib/supabase"

export default function DataPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPeriod, setSelectedPeriod] = useState("month") // month, quarter, year
  const [chartType, setChartType] = useState("line") // line, bar, area
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // データ状態
  const [records, setRecords] = useState([])
  const [timerRecords, setTimerRecords] = useState([])
  const [bigGoals, setBigGoals] = useState([])
  const [smallGoals, setSmallGoals] = useState([])

  // 統計データ
  const [monthlyData, setMonthlyData] = useState({
    moodEnergyData: [],
    goalProgress: { current: 0, previous: 0, change: 0 },
    totalRecords: 0,
    averageMood: 0,
    averageEnergy: 0,
    timerStats: { totalTime: 0, sessions: 0, averageSession: 0 },
    goalStats: { completed: 0, active: 0, completionRate: 0 },
    categoryStats: [],
    weeklyTrends: [],
    productivityScore: 0,
  })

  // 月のタブデータ
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  const periods = [
    { value: "month", label: "月別" },
    { value: "quarter", label: "四半期" },
    { value: "year", label: "年別" },
  ]

  // グラフの色設定
  const colors = {
    mood: "#f59e0b",
    energy: "#8b5cf6",
    focus: "#10b981",
    break: "#ef4444",
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  }

  const pieColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"]

  // データ読み込み
  useEffect(() => {
    if (!user) return
    loadAllData()
  }, [user, selectedMonth, selectedYear, selectedPeriod])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("データ読み込み開始...")

      // 個別にAPI呼び出しをして、どれが失敗するかを特定
      let recordsData, timerData, bigGoalsData, smallGoalsData;

      try {
        console.log("記録データを取得中...")
        recordsData = await recordsApi.getByMonth(selectedYear, selectedMonth + 1)
        console.log("記録データ取得成功:", recordsData?.length || 0, "件")
      } catch (err) {
        console.error("記録データ取得エラー:", err)
        recordsData = []
      }

      try {
        console.log("タイマーデータを取得中...")
        timerData = await timerRecordsApi.getMonthlyStats(selectedYear, selectedMonth + 1)
        console.log("タイマーデータ取得成功:", timerData?.length || 0, "件")
      } catch (err) {
        console.error("タイマーデータ取得エラー:", err)
        timerData = []
      }

      try {
        console.log("ビッグゴールデータを取得中...")
        bigGoalsData = await bigGoalsApi.getAll()
        console.log("ビッグゴールデータ取得成功:", bigGoalsData?.length || 0, "件")
      } catch (err) {
        console.error("ビッグゴールデータ取得エラー:", err)
        bigGoalsData = []
      }

      try {
        console.log("スモールゴールデータを取得中...")
        smallGoalsData = await smallGoalsApi.getAll()
        console.log("スモールゴールデータ取得成功:", smallGoalsData?.length || 0, "件")
      } catch (err) {
        console.error("スモールゴールデータ取得エラー:", err)
        smallGoalsData = []
      }

      setRecords(recordsData || [])
      setTimerRecords(timerData || [])
      setBigGoals(bigGoalsData || [])
      setSmallGoals(smallGoalsData || [])

      console.log("全データ読み込み完了")
    } catch (err) {
      console.error("データ読み込みエラー:", err)
      console.error("エラーメッセージ:", err.message)
      console.error("エラー詳細:", JSON.stringify(err, null, 2))
      setError(`データの読み込みに失敗しました: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // 統計データの計算
  useEffect(() => {
    if (!records.length && !timerRecords.length) return
    calculateStatistics()
  }, [records, timerRecords, bigGoals, smallGoals, selectedMonth, selectedYear])

  const calculateStatistics = () => {
    // 選択された月のデータをフィルタリング
    const currentMonthRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear
    })

    // 前月のデータ（比較用）
    const previousMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
    const previousYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
    const previousMonthRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear
    })

    // 気分とエネルギーの推移データ
    const moodEnergyData = currentMonthRecords
      .map((record) => ({
        date: new Date(record.date).getDate(),
        mood: record.mood || 0,
        energy: record.energy || 0,
        dateStr: new Date(record.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
        fullDate: record.date,
      }))
      .sort((a, b) => a.date - b.date)

    // 目標進捗の計算
    const currentGoalProgress = calculateGoalProgress(currentMonthRecords)
    const previousGoalProgress = calculateGoalProgress(previousMonthRecords)
    const progressChange = currentGoalProgress - previousGoalProgress

    // 平均値計算
    const averageMood =
      currentMonthRecords.length > 0
        ? currentMonthRecords.reduce((sum, record) => sum + (record.mood || 0), 0) / currentMonthRecords.length
        : 0
    const averageEnergy =
      currentMonthRecords.length > 0
        ? currentMonthRecords.reduce((sum, record) => sum + (record.energy || 0), 0) / currentMonthRecords.length
        : 0

    // タイマー統計
    const timerStats = calculateTimerStats(timerRecords)

    // 目標統計
    const goalStats = calculateGoalStats(smallGoals)

    // カテゴリ別統計
    const categoryStats = calculateCategoryStats(bigGoals, smallGoals)

    // 週別トレンド
    const weeklyTrends = calculateWeeklyTrends(currentMonthRecords)

    // 生産性スコア（独自指標）
    const productivityScore = calculateProductivityScore(
      averageMood,
      averageEnergy,
      currentGoalProgress,
      timerStats.totalTime,
    )

    setMonthlyData({
      moodEnergyData,
      goalProgress: {
        current: currentGoalProgress,
        previous: previousGoalProgress,
        change: progressChange,
      },
      totalRecords: currentMonthRecords.length,
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      timerStats,
      goalStats,
      categoryStats,
      weeklyTrends,
      productivityScore,
    })
  }

  // 目標進捗計算
  const calculateGoalProgress = (monthRecords) => {
    if (monthRecords.length === 0) return 0

    let totalProgress = 0
    let goalCount = 0

    monthRecords.forEach((record) => {
      if (record.record_goals && record.record_goals.length > 0) {
        record.record_goals.forEach((goal) => {
          if (goal.value !== undefined) {
            totalProgress += goal.value
            goalCount++
          }
        })
      }
    })

    return goalCount > 0 ? Math.round((totalProgress / goalCount) * 10) / 10 : 0
  }

  // タイマー統計計算
  const calculateTimerStats = (timerData) => {
    if (!timerData.length) return { totalTime: 0, sessions: 0, averageSession: 0 }

    const totalTime = timerData.reduce((sum, record) => sum + (record.duration || 0), 0)
    const sessions = timerData.length
    const averageSession = sessions > 0 ? Math.round(totalTime / sessions) : 0

    return { totalTime, sessions, averageSession }
  }

  // 目標統計計算
  const calculateGoalStats = (goals) => {
    const completed = goals.filter((goal) => goal.is_completed).length
    const active = goals.filter((goal) => !goal.is_completed && !goal.is_archived).length
    const total = completed + active
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, active, completionRate }
  }

  // カテゴリ別統計計算
  const calculateCategoryStats = (bigGoalsData, smallGoalsData) => {
    const categoryMap = new Map()

    bigGoalsData.forEach((goal) => {
      const categoryName = goal.categories?.name || "未分類"
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { name: categoryName, bigGoals: 0, smallGoals: 0, completed: 0 })
      }
      categoryMap.get(categoryName).bigGoals++
    })

    smallGoalsData.forEach((goal) => {
      const bigGoal = bigGoalsData.find((bg) => bg.id === goal.big_goal_id)
      const categoryName = bigGoal?.categories?.name || "未分類"

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, { name: categoryName, bigGoals: 0, smallGoals: 0, completed: 0 })
      }

      const category = categoryMap.get(categoryName)
      category.smallGoals++
      if (goal.is_completed) category.completed++
    })

    return Array.from(categoryMap.values())
  }

  // 週別トレンド計算
  const calculateWeeklyTrends = (monthRecords) => {
    const weeks = [
      { week: "第1週", mood: 0, energy: 0, records: 0 },
      { week: "第2週", mood: 0, energy: 0, records: 0 },
      { week: "第3週", mood: 0, energy: 0, records: 0 },
      { week: "第4週", mood: 0, energy: 0, records: 0 },
      { week: "第5週", mood: 0, energy: 0, records: 0 },
    ]

    monthRecords.forEach((record) => {
      const date = new Date(record.date)
      const weekIndex = Math.floor((date.getDate() - 1) / 7)

      if (weekIndex < 5) {
        weeks[weekIndex].mood += record.mood || 0
        weeks[weekIndex].energy += record.energy || 0
        weeks[weekIndex].records++
      }
    })

    return weeks
      .map((week) => ({
        ...week,
        mood: week.records > 0 ? Math.round((week.mood / week.records) * 10) / 10 : 0,
        energy: week.records > 0 ? Math.round((week.energy / week.records) * 10) / 10 : 0,
      }))
      .filter((week) => week.records > 0)
  }

  // 生産性スコア計算（独自指標）
  const calculateProductivityScore = (mood, energy, goalProgress, timerTime) => {
    const moodScore = (mood / 5) * 25
    const energyScore = (energy / 5) * 25
    const goalScore = (goalProgress / 100) * 30
    const timerScore = Math.min((timerTime / 3600) * 20, 20) // 1時間で満点

    return Math.round(moodScore + energyScore + goalScore + timerScore)
  }

  // データエクスポート
  const exportData = () => {
    const exportData = {
      period: `${selectedYear}年${months[selectedMonth]}`,
      summary: {
        totalRecords: monthlyData.totalRecords,
        averageMood: monthlyData.averageMood,
        averageEnergy: monthlyData.averageEnergy,
        productivityScore: monthlyData.productivityScore,
      },
      goals: monthlyData.goalStats,
      timer: monthlyData.timerStats,
      categories: monthlyData.categoryStats,
      weeklyTrends: monthlyData.weeklyTrends,
      dailyData: monthlyData.moodEnergyData,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `goal-planner-stats-${selectedYear}-${selectedMonth + 1}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 変化率の表示コンポーネント
  const ChangeIndicator = ({ value, suffix = "%" }) => {
    if (value === 0) {
      return (
        <div className="flex items-center text-slate-500">
          <Minus className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">変化なし</span>
        </div>
      )
    }

    const isPositive = value > 0
    return (
      <div className={`flex items-center ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        <span className="text-sm font-medium">
          {isPositive ? "+" : ""}
          {value}
          {suffix}
        </span>
      </div>
    )
  }

  // ローディング状態
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">データを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  // エラー状態
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-4">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-violet-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    詳細統計
                  </h1>
                  <p className="text-slate-600 mt-1">Supabaseデータを活用した包括的な分析</p>
                </div>
              </div>

              {/* コントロールパネル */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>

                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="line">線グラフ</option>
                  <option value="bar">棒グラフ</option>
                  <option value="area">エリアグラフ</option>
                </select>

                <button
                  onClick={exportData}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  エクスポート
                </button>
              </div>
            </div>

            {/* 月選択タブ */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 mb-8 backdrop-blur-sm">
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex border-b border-slate-200/50 min-w-max">
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMonth(index)}
                        className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-300 ${
                          selectedMonth === index
                            ? "border-violet-500 bg-gradient-to-r from-violet-50/80 to-purple-50/50 text-violet-700"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/30"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* 生産性スコア */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-800">{monthlyData.productivityScore}</p>
                <p className="text-sm text-slate-600">生産性スコア</p>
                <p className="text-xs text-slate-500">100点満点</p>
              </div>
            </div>

            {/* 目標取り組み度 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <ChangeIndicator value={monthlyData.goalProgress.change} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-800">{monthlyData.goalProgress.current}%</p>
                <p className="text-sm text-slate-600">目標取り組み度</p>
                <p className="text-xs text-slate-500">先月: {monthlyData.goalProgress.previous}%</p>
              </div>
            </div>

            {/* 記録日数 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-800">{monthlyData.totalRecords}</p>
                <p className="text-sm text-slate-600">記録日数</p>
                <p className="text-xs text-slate-500">今月の記録</p>
              </div>
            </div>

            {/* 平均気分 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-800">{monthlyData.averageMood}</p>
                <p className="text-sm text-slate-600">平均気分</p>
                <p className="text-xs text-slate-500">5段階評価</p>
              </div>
            </div>

            {/* タイマー使用時間 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-800">{Math.round(monthlyData.timerStats.totalTime / 60)}</p>
                <p className="text-sm text-slate-600">総フォーカス時間</p>
                <p className="text-xs text-slate-500">分</p>
              </div>
            </div>
          </div>

          {/* グラフエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 気分とエネルギーの推移 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">気分とエネルギーの推移</h3>
                    <p className="text-sm text-slate-600">{months[selectedMonth]}の日別データ</p>
                  </div>
                </div>
              </div>

              {monthlyData.moodEnergyData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" && (
                      <LineChart data={monthlyData.moodEnergyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dateStr" stroke="#64748b" fontSize={12} />
                        <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke={colors.mood}
                          strokeWidth={3}
                          dot={{ fill: colors.mood, strokeWidth: 2, r: 4 }}
                          name="気分"
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke={colors.energy}
                          strokeWidth={3}
                          dot={{ fill: colors.energy, strokeWidth: 2, r: 4 }}
                          name="エネルギー"
                        />
                      </LineChart>
                    )}
                    {chartType === "bar" && (
                      <BarChart data={monthlyData.moodEnergyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dateStr" stroke="#64748b" fontSize={12} />
                        <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="mood" fill={colors.mood} name="気分" />
                        <Bar dataKey="energy" fill={colors.energy} name="エネルギー" />
                      </BarChart>
                    )}
                    {chartType === "area" && (
                      <AreaChart data={monthlyData.moodEnergyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="dateStr" stroke="#64748b" fontSize={12} />
                        <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          stackId="1"
                          stroke={colors.mood}
                          fill={colors.mood}
                          fillOpacity={0.6}
                          name="気分"
                        />
                        <Area
                          type="monotone"
                          dataKey="energy"
                          stackId="2"
                          stroke={colors.energy}
                          fill={colors.energy}
                          fillOpacity={0.6}
                          name="エネルギー"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">データがありません</p>
                    <p className="text-sm text-slate-500 mt-1">{months[selectedMonth]}の記録を追加してください</p>
                  </div>
                </div>
              )}
            </div>

            {/* カテゴリ別目標分布 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg mr-3">
                  <PieChartIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700">カテゴリ別目標分布</h3>
                  <p className="text-sm text-slate-600">スモールゴールの分布</p>
                </div>
              </div>

              {monthlyData.categoryStats.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyData.categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="smallGoals"
                      >
                        {monthlyData.categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <PieChartIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">カテゴリデータがありません</p>
                    <p className="text-sm text-slate-500 mt-1">目標を設定してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 週別トレンド */}
          {monthlyData.weeklyTrends.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg mb-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg mr-3">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700">週別トレンド</h3>
                  <p className="text-sm text-slate-600">週ごとの気分とエネルギーの変化</p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                    <YAxis domain={[0, 5]} stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="mood" fill={colors.mood} name="平均気分" />
                    <Bar dataKey="energy" fill={colors.energy} name="平均エネルギー" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 詳細統計テーブル */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 目標統計 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4">目標統計</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <span className="text-emerald-700 font-medium">完了した目標</span>
                  <span className="text-emerald-600 font-bold">{monthlyData.goalStats.completed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-blue-700 font-medium">進行中の目標</span>
                  <span className="text-blue-600 font-bold">{monthlyData.goalStats.active}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                  <span className="text-violet-700 font-medium">達成率</span>
                  <span className="text-violet-600 font-bold">{monthlyData.goalStats.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* タイマー統計 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4">タイマー統計</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                  <span className="text-red-700 font-medium">総フォーカス時間</span>
                  <span className="text-red-600 font-bold">{Math.round(monthlyData.timerStats.totalTime / 60)}分</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                  <span className="text-orange-700 font-medium">セッション数</span>
                  <span className="text-orange-600 font-bold">{monthlyData.timerStats.sessions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-green-700 font-medium">平均セッション時間</span>
                  <span className="text-green-600 font-bold">
                    {Math.round(monthlyData.timerStats.averageSession / 60)}分
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 月間サマリー */}
          {monthlyData.moodEnergyData.length > 0 && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4">月間サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{monthlyData.totalRecords}</p>
                  <p className="text-sm text-blue-700">記録日数</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{monthlyData.averageMood}</p>
                  <p className="text-sm text-orange-700">平均気分</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{monthlyData.averageEnergy}</p>
                  <p className="text-sm text-purple-700">平均エネルギー</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{monthlyData.productivityScore}</p>
                  <p className="text-sm text-emerald-700">生産性スコア</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
