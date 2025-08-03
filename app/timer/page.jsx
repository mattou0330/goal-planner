"use client"

import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Timer,
  TimerIcon as Stopwatch,
  Target,
  Calendar,
  Trash2,
  Settings,
  Edit,
  Save,
  X,
  AlertCircle,
} from "lucide-react"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { useTimer } from "../../contexts/timer-context"
import { timerRecordsApi, smallGoalsApi } from "../../lib/supabase"
import { useAuth } from "../../contexts/auth-context"

export default function TimerPage() {
  const { user } = useAuth()
  const {
    timerType,
    setTimerType,
    isRunning,
    isPaused,
    time,
    selectedGoal,
    setSelectedGoal,
    pomodoroSettings,
    setPomodoroSettings,
    pomodoroSession,
    isBreakTime,
    initializeTimer,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setLastActiveTime,
    showNotification,
    isInitialized,
  } = useTimer()

  const [showSettings, setShowSettings] = useState(false)
  const [records, setRecords] = useState([])
  const [smallGoals, setSmallGoals] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)
  const [editForm, setEditForm] = useState({
    goal_id: null,
    duration: 0,
    comment: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // カスタムタイマー設定
  const [customMinutes, setCustomMinutes] = useState(25)
  const [customSeconds, setCustomSeconds] = useState(0)
  const [previousTimerType, setPreviousTimerType] = useState(timerType)

  // ページがアクティブになったときにタイマーコンテキストに通知
  useEffect(() => {
    setLastActiveTime()
    // ページに戻ったときに通知を非表示にする
    if (showNotification) {
      setLastActiveTime()
    }
  }, [setLastActiveTime, showNotification])

  // スモールゴールを読み込み
  useEffect(() => {
    const loadSmallGoals = async () => {
      if (!user) return

      try {
        const goalsData = await smallGoalsApi.getAll()
        setSmallGoals(goalsData)
      } catch (error) {
        console.error("スモールゴールの読み込みに失敗:", error)
        setError("スモールゴールの読み込みに失敗しました")
      }
    }

    loadSmallGoals()
  }, [user])

  // 今日のタイマー記録を読み込み
  useEffect(() => {
    const loadTodayRecords = async () => {
      if (!user) return

      try {
        setLoading(true)
        const today = new Date().toISOString().split("T")[0]
        const recordsData = await timerRecordsApi.getByDate(today)
        setRecords(recordsData)
        setError(null)
      } catch (error) {
        console.error("タイマー記録の読み込みに失敗:", error)
        setError("タイマー記録の読み込みに失敗しました")

        // フォールバックとしてlocalStorageから読み込み
        const savedRecords = localStorage.getItem("timerRecords")
        if (savedRecords) {
          const localRecords = JSON.parse(savedRecords)
          const todayRecords = localRecords.filter((record) => record.date === new Date().toISOString().split("T")[0])
          setRecords(todayRecords)
        }
      } finally {
        setLoading(false)
      }
    }

    loadTodayRecords()
  }, [user])

  // タイマータイプが変更されたときの処理（実行中でない場合のみ初期化）
  useEffect(() => {
    if (isInitialized && timerType !== previousTimerType) {
      console.log("タイマータイプ変更:", previousTimerType, "→", timerType)

      // タイマーが実行中でない場合のみ初期化
      if (!isRunning) {
        console.log("タイマーが停止中なので初期化します")
        initializeTimer(customMinutes, customSeconds)
      } else {
        console.log("タイマーが実行中なので初期化をスキップします")
      }

      setPreviousTimerType(timerType)
    }
  }, [timerType, isInitialized, isRunning, customMinutes, customSeconds, initializeTimer, previousTimerType])

  const handleStopTimer = async () => {
    const newRecord = await stopTimer()
    if (newRecord) {
      // 新しい記録を追加（Supabaseから返されたデータ構造に対応）
      const formattedRecord = {
        ...newRecord,
        small_goals: newRecord.goal_id ? smallGoals.find((g) => g.id === newRecord.goal_id) : null,
      }
      setRecords((prev) => [formattedRecord, ...prev])
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    }
    return `${secs}秒`
  }

  const deleteRecord = async (recordId) => {
    try {
      // Supabaseから削除（APIが存在する場合）
      // 現在のAPIには削除機能がないため、将来的に追加予定
      console.log("記録削除:", recordId)

      // UIから削除
      const updatedRecords = records.filter((record) => record.id !== recordId)
      setRecords(updatedRecords)

      // フォールバックとしてlocalStorageからも削除
      const savedRecords = localStorage.getItem("timerRecords")
      if (savedRecords) {
        const localRecords = JSON.parse(savedRecords)
        const updatedLocalRecords = localRecords.filter((record) => record.id !== recordId)
        localStorage.setItem("timerRecords", JSON.stringify(updatedLocalRecords))
      }
    } catch (error) {
      console.error("記録の削除に失敗:", error)
      setError("記録の削除に失敗しました")
    }
  }

  const startEditRecord = (record) => {
    setEditingRecord(record.id)
    setEditForm({
      goal_id: record.goal_id || null,
      duration: record.duration,
      comment: record.comment || "",
    })
  }

  const saveEditRecord = async () => {
    try {
      // Supabaseで更新（APIが存在する場合）
      // 現在のAPIには更新機能がないため、将来的に追加予定
      console.log("記録更新:", editingRecord, editForm)

      // UIを更新
      const updatedRecords = records.map((record) => {
        if (record.id === editingRecord) {
          return {
            ...record,
            goal_id: editForm.goal_id,
            duration: editForm.duration,
            comment: editForm.comment,
            small_goals: editForm.goal_id ? smallGoals.find((g) => g.id === editForm.goal_id) : null,
          }
        }
        return record
      })
      setRecords(updatedRecords)

      // フォールバックとしてlocalStorageも更新
      const savedRecords = localStorage.getItem("timerRecords")
      if (savedRecords) {
        const localRecords = JSON.parse(savedRecords)
        const updatedLocalRecords = localRecords.map((record) => {
          if (record.id === editingRecord) {
            return {
              ...record,
              goal: editForm.goal_id ? smallGoals.find((g) => g.id === editForm.goal_id) : null,
              duration: editForm.duration,
              comment: editForm.comment,
            }
          }
          return record
        })
        localStorage.setItem("timerRecords", JSON.stringify(updatedLocalRecords))
      }

      setEditingRecord(null)
    } catch (error) {
      console.error("記録の更新に失敗:", error)
      setError("記録の更新に失敗しました")
    }
  }

  const cancelEdit = () => {
    setEditingRecord(null)
    setEditForm({ goal_id: null, duration: 0, comment: "" })
  }

  const getTimerTypeLabel = (type) => {
    switch (type) {
      case "pomodoro":
        return "ポモドーロ"
      case "custom":
        return "カスタム"
      case "stopwatch":
        return "ストップウォッチ"
      default:
        return type
    }
  }

  const getTimerIcon = (type) => {
    switch (type) {
      case "pomodoro":
        return <Timer className="w-4 h-4" />
      case "custom":
        return <Clock className="w-4 h-4" />
      case "stopwatch":
        return <Stopwatch className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // 初期化が完了していない場合はローディング表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            タイマーを読み込み中...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <MobileHeader />

      <div className="lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
        {/* PC用サイドバー */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* メインコンテンツ */}
        <main className="p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-violet-500/20">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  タイマー
                </h2>
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="text-red-700 font-medium">{error}</div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* タイマーメイン */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-8 backdrop-blur-sm">
                  {/* タイマータイプ選択 */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTimerType("pomodoro")}
                        className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          timerType === "pomodoro"
                            ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30"
                            : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 hover:from-slate-200 hover:to-gray-200"
                        }`}
                      >
                        <Timer className="w-4 h-4 mr-2" />
                        ポモドーロ
                      </button>
                      <button
                        onClick={() => setTimerType("custom")}
                        className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          timerType === "custom"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 hover:from-slate-200 hover:to-gray-200"
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        カスタム
                      </button>
                      <button
                        onClick={() => setTimerType("stopwatch")}
                        className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          timerType === "stopwatch"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 hover:from-slate-200 hover:to-gray-200"
                        }`}
                      >
                        <Stopwatch className="w-4 h-4 mr-2" />
                        ストップウォッチ
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 設定パネル */}
                  {showSettings && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-slate-50/80 to-blue-50/30 rounded-xl border border-slate-200/50">
                      {timerType === "custom" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">分</label>
                            <input
                              type="number"
                              value={customMinutes}
                              onChange={(e) => setCustomMinutes(Number.parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm font-medium"
                              min="0"
                              max="999"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">秒</label>
                            <input
                              type="number"
                              value={customSeconds}
                              onChange={(e) => setCustomSeconds(Number.parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm font-medium"
                              min="0"
                              max="59"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* スモールゴール選択 */}
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      関連するスモールゴール（任意）
                    </label>
                    <select
                      value={selectedGoal?.id || ""}
                      onChange={(e) => {
                        const goalId = e.target.value
                        setSelectedGoal(goalId ? smallGoals.find((g) => g.id === Number.parseInt(goalId)) : null)
                      }}
                      className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                    >
                      <option value="">選択しない</option>
                      {smallGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title} ({goal.big_goals?.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* タイマー表示 */}
                  <div className="text-center mb-8">
                    {/* 固定幅のタイマー表示 */}
                    <div
                      className={`text-8xl font-bold mb-8 font-mono tabular-nums tracking-wider ${
                        timerType === "pomodoro"
                          ? isBreakTime
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                            : "bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
                          : timerType === "custom"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                      }`}
                      style={{ minWidth: "400px" }}
                    >
                      {formatTime(time)}
                    </div>

                    {selectedGoal && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-violet-50/80 to-purple-50/50 rounded-xl border border-violet-200/50">
                        <div className="flex items-center justify-center space-x-2">
                          <Target className="w-5 h-5 text-violet-600" />
                          <span className="font-bold text-violet-800">{selectedGoal.title}</span>
                        </div>
                        <div className="text-sm text-violet-600 font-medium">{selectedGoal.big_goals?.title}</div>
                      </div>
                    )}

                    {/* デバッグ情報 */}
                    <div className="mb-4 text-sm text-slate-500">
                      状態: {isRunning ? "実行中" : "停止中"} | 一時停止: {isPaused ? "はい" : "いいえ"} | 時間: {time}
                      秒
                    </div>

                    {/* コントロールボタン */}
                    <div className="flex justify-center space-x-4">
                      {!isRunning ? (
                        <button
                          onClick={() => {
                            console.log("開始ボタンクリック")
                            startTimer()
                          }}
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/30 text-lg"
                        >
                          <Play className="w-6 h-6 mr-2" />
                          開始
                        </button>
                      ) : isPaused ? (
                        <button
                          onClick={startTimer}
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/30 text-lg"
                        >
                          <Play className="w-6 h-6 mr-2" />
                          再開
                        </button>
                      ) : (
                        <button
                          onClick={pauseTimer}
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg shadow-amber-500/30 text-lg"
                        >
                          <Pause className="w-6 h-6 mr-2" />
                          一時停止
                        </button>
                      )}

                      <button
                        onClick={handleStopTimer}
                        className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg shadow-red-500/30 text-lg"
                      >
                        <Square className="w-6 h-6 mr-2" />
                        ストップ
                      </button>

                      <button
                        onClick={resetTimer}
                        className="flex items-center px-6 py-4 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-300 font-semibold shadow-lg shadow-slate-500/30 text-lg"
                      >
                        <RotateCcw className="w-6 h-6 mr-2" />
                        リセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 今日の記録 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">
                  今日の記録
                </h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">記録を読み込み中...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">まだ記録がありません</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 bg-gradient-to-r from-white/60 to-blue-50/20 rounded-xl border border-slate-200/50 backdrop-blur-sm"
                      >
                        {editingRecord === record.id ? (
                          // 編集モード
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">スモールゴール</label>
                              <select
                                value={editForm.goal_id || ""}
                                onChange={(e) => {
                                  const goalId = e.target.value
                                  setEditForm({
                                    ...editForm,
                                    goal_id: goalId ? Number.parseInt(goalId) : null,
                                  })
                                }}
                                className="w-full px-2 py-1 text-xs border border-slate-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white/50"
                              >
                                <option value="">選択しない</option>
                                {smallGoals.map((goal) => (
                                  <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">時間（分）</label>
                              <input
                                type="number"
                                value={Math.floor(editForm.duration / 60)}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    duration: (Number.parseInt(e.target.value) || 0) * 60,
                                  })
                                }
                                className="w-full px-2 py-1 text-xs border border-slate-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white/50"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">コメント</label>
                              <textarea
                                value={editForm.comment}
                                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                rows={2}
                                className="w-full px-2 py-1 text-xs border border-slate-300/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white/50"
                                placeholder="コメント（任意）"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEditRecord}
                                className="flex items-center px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-xs font-semibold"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                保存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center px-3 py-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-300 text-xs font-semibold"
                              >
                                <X className="w-3 h-3 mr-1" />
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 表示モード
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getTimerIcon(record.type)}
                                <span className="text-sm font-bold text-slate-800">
                                  {getTimerTypeLabel(record.type)}
                                  {record.type === "pomodoro" && record.is_break_time && " (休憩)"}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditRecord(record)}
                                  className="text-slate-400 hover:text-blue-500 transition-colors duration-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteRecord(record.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors duration-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-lg font-bold text-slate-700 mb-1">
                              {formatDuration(record.duration)}
                            </div>

                            {record.small_goals && (
                              <div className="text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-2 py-1 rounded-full border border-violet-200/50 inline-block mb-2">
                                {record.small_goals.title}
                              </div>
                            )}

                            {record.comment && (
                              <div className="text-xs text-slate-600 font-medium mb-2 p-2 bg-slate-50/50 rounded-lg">
                                {record.comment}
                              </div>
                            )}

                            <div className="text-xs text-slate-500 font-medium">
                              {new Date(record.start_time).toLocaleTimeString()} -{" "}
                              {new Date(record.end_time).toLocaleTimeString()}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 今日の合計時間 */}
                {records.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200/50">
                    <div className="text-center p-4 bg-gradient-to-r from-violet-50/50 to-purple-50/30 rounded-xl border border-violet-200/30">
                      <div className="text-sm font-bold text-violet-700 mb-1">今日の合計時間</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {formatDuration(records.reduce((total, record) => total + record.duration, 0))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
