"use client"

import { useState, useEffect } from "react"
import { Calendar, MessageSquare, Plus, Save, X, Edit, Trash2 } from "lucide-react"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { recordsApi, draftsApi, timerRecordsApi, smallGoalsApi } from "../../lib/supabase"

export default function RecordsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2024-01")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 記録追加フォームの状態
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedGoals, setSelectedGoals] = useState([{ goalId: "", goal: "", value: "", unit: "", comment: "" }])
  const [dailyComment, setDailyComment] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedEnergy, setSelectedEnergy] = useState("")
  const [selectedImages, setSelectedImages] = useState([])
  const [drafts, setDrafts] = useState([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // 記録追加フォームの状態の後に追加
  const [editingDraftId, setEditingDraftId] = useState(null)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deletingDraftId, setDeletingDraftId] = useState(null)
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("")

  // データベースから取得するデータ
  const [records, setRecords] = useState([])
  const [smallGoals, setSmallGoals] = useState([])
  const [timerRecords, setTimerRecords] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])

  const units = ["分", "回", "ページ", "kg", "km"]

  const moods = [
    { emoji: "😊", label: "とても良い", value: "very_good" },
    { emoji: "🙂", label: "良い", value: "good" },
    { emoji: "😐", label: "普通", value: "neutral" },
    { emoji: "😔", label: "悪い", value: "bad" },
    { emoji: "😞", label: "とても悪い", value: "very_bad" },
  ]

  const energyLevels = [
    { emoji: "⚡", label: "とても元気", value: "very_high" },
    { emoji: "💪", label: "元気", value: "high" },
    { emoji: "😌", label: "普通", value: "normal" },
    { emoji: "😴", label: "疲れ気味", value: "low" },
    { emoji: "🥱", label: "とても疲れ", value: "very_low" },
  ]

  // 初期データ読み込み
  useEffect(() => {
    loadInitialData()
  }, [])

  // 月が変更されたときの記録読み込み
  useEffect(() => {
    if (selectedMonth) {
      loadRecordsByMonth(selectedMonth)
    }
  }, [selectedMonth])

  // 選択された日付のタイマー記録を読み込み
  useEffect(() => {
    if (selectedDate) {
      loadTimerRecords(selectedDate)
    }
  }, [selectedDate])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // スモールゴールを読み込み
      const goalsData = await smallGoalsApi.getAll()
      setSmallGoals(goalsData)

      // 下書きを読み込み
      const draftsData = await draftsApi.getAll()
      setDrafts(draftsData)

      // 初期月の記録を読み込み
      await loadRecordsByMonth(selectedMonth)

      // 利用可能な月を生成（過去6ヶ月）
      const months = []
      const currentDate = new Date()
      for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        months.push(monthKey)
      }
      setAvailableMonths(months)
    } catch (err) {
      console.error("初期データ読み込みエラー:", err)
      setError("データの読み込みに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const loadRecordsByMonth = async (monthKey) => {
    try {
      const [year, month] = monthKey.split("-")
      const recordsData = await recordsApi.getByMonth(Number.parseInt(year), Number.parseInt(month))

      // データを整形
      const formattedRecords = recordsData.map((record) => ({
        id: record.id,
        date: record.date,
        goals: record.record_goals || [],
        dailyComment: record.daily_comment || "",
        mood: record.mood || "",
        energy: record.energy || "",
        aiFeedback: record.ai_feedback || "",
      }))

      setRecords(formattedRecords)
    } catch (err) {
      console.error("記録読み込みエラー:", err)
      setError("記録の読み込みに失敗しました")
    }
  }

  const loadTimerRecords = async (date) => {
    try {
      const timerData = await timerRecordsApi.getByDate(date)
      setTimerRecords(timerData)
    } catch (err) {
      console.error("タイマー記録読み込みエラー:", err)
    }
  }

  // 下書きを編集用にモーダルに読み込む関数を追加
  const editDraft = (draft) => {
    setEditingDraftId(draft.id)
    setSelectedDate(draft.date)
    setSelectedGoals(draft.data.selectedGoals || [{ goalId: "", goal: "", value: "", unit: "", comment: "" }])
    setDailyComment(draft.data.dailyComment || "")
    setSelectedMood(draft.data.selectedMood || "")
    setSelectedEnergy(draft.data.selectedEnergy || "")
    setSelectedImages([])
    setIsAddModalOpen(true)
  }

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-")
    return `${year}年${Number.parseInt(month)}月`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"]
    const weekday = weekdays[date.getDay()]
    return `${month}/${day}(${weekday})`
  }

  const getMoodEmoji = (moodValue) => {
    return moods.find((m) => m.value === moodValue)?.emoji || "😐"
  }

  const getEnergyEmoji = (energyValue) => {
    return energyLevels.find((e) => e.value === energyValue)?.emoji || "😌"
  }

  const currentRecords = records

  // 記録追加関連の関数
  const addGoalField = () => {
    setSelectedGoals([...selectedGoals, { goalId: "", goal: "", value: "", unit: "", comment: "" }])
  }

  const removeGoalField = (index) => {
    if (selectedGoals.length > 1) {
      setSelectedGoals(selectedGoals.filter((_, i) => i !== index))
    }
  }

  const updateGoalField = (index, field, value) => {
    const updated = selectedGoals.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value }
        if (field === "goalId") {
          if (value === "other") {
            // 「その他」を選択した場合
            newItem.unit = ""
            newItem.goal = ""
          } else {
            const selectedGoal = smallGoals.find((goal) => goal.id === Number.parseInt(value))
            if (selectedGoal) {
              newItem.unit = selectedGoal.unit
              newItem.goal = selectedGoal.title
            } else {
              newItem.unit = ""
              newItem.goal = ""
            }
          }
        }
        return newItem
      }
      return item
    })
    setSelectedGoals(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 目標が入力されているか、または自由コメントが入力されている場合のみ送信
    const hasGoals = selectedGoals.some((goal) => goal.goal && goal.value)
    const hasComment = dailyComment.trim()

    if (!hasGoals && !hasComment) {
      alert("目標を入力するか、自由コメントを記入してください。")
      return
    }

    try {
      setLoading(true)

      // 記録データを準備
      const recordData = {
        date: selectedDate,
        daily_comment: dailyComment,
        mood: selectedMood,
        energy: selectedEnergy,
        goals: selectedGoals
          .filter((goal) => goal.goal && goal.value)
          .map((goal) => ({
            goal: goal.goal,
            value: Number.parseFloat(goal.value),
            unit: goal.unit,
            comment: goal.comment,
          })),
      }

      // 記録を作成
      await recordsApi.create(recordData)

      // 編集中の下書きがあれば削除
      if (editingDraftId) {
        await draftsApi.delete(editingDraftId)
        setDrafts(drafts.filter((draft) => draft.id !== editingDraftId))
      }

      // フォームをリセット
      resetForm()
      setIsAddModalOpen(false)

      // 記録を再読み込み
      await loadRecordsByMonth(selectedMonth)

      alert("記録を保存しました！")
    } catch (err) {
      console.error("記録保存エラー:", err)
      alert("記録の保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedGoals([{ goalId: "", goal: "", value: "", unit: "", comment: "" }])
    setDailyComment("")
    setSelectedMood("")
    setSelectedEnergy("")
    setSelectedImages([])
    setSelectedDate(new Date().toISOString().split("T")[0])
    setEditingDraftId(null)
  }

  const saveDraft = async () => {
    try {
      const name = `${selectedDate} の記録`
      const draftData = {
        name: name,
        date: selectedDate,
        data: {
          selectedGoals,
          dailyComment,
          selectedMood,
          selectedEnergy,
          selectedImages: selectedImages.map((img) => img.name),
        },
      }

      if (editingDraftId) {
        // 既存の下書きを更新
        await draftsApi.update(editingDraftId, draftData)
        setSaveSuccessMessage(`下書き「${name}」を更新しました`)
      } else {
        // 新しい下書きを作成
        const newDraft = await draftsApi.create(draftData)
        setDrafts([newDraft, ...drafts])
        setSaveSuccessMessage(`下書き「${name}」を保存しました`)
      }

      // 下書き一覧を再読み込み
      const updatedDrafts = await draftsApi.getAll()
      setDrafts(updatedDrafts)

      setShowSaveSuccessModal(true)
    } catch (err) {
      console.error("下書き保存エラー:", err)
      alert("下書きの保存に失敗しました")
    }
  }

  const loadDraft = (draft) => {
    setSelectedDate(draft.date)
    setSelectedGoals(draft.data.selectedGoals || [{ goalId: "", goal: "", value: "", unit: "", comment: "" }])
    setDailyComment(draft.data.dailyComment || "")
    setSelectedMood(draft.data.selectedMood || "")
    setSelectedEnergy(draft.data.selectedEnergy || "")
    setSelectedImages([])
    setShowDrafts(false)
  }

  const deleteDraft = async (draftId) => {
    try {
      await draftsApi.delete(draftId)
      setDrafts(drafts.filter((draft) => draft.id !== draftId))
    } catch (err) {
      console.error("下書き削除エラー:", err)
      alert("下書きの削除に失敗しました")
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    setEditingDraftId(null)
    resetForm()
  }

  // 削除確認モーダルを表示
  const confirmDeleteDraft = (draftId) => {
    setDeletingDraftId(draftId)
    setShowDeleteConfirmModal(true)
  }

  // 下書きを削除
  const deleteDraftConfirmed = async () => {
    try {
      await deleteDraft(deletingDraftId)
      setShowDeleteConfirmModal(false)
      setDeletingDraftId(null)
    } catch (err) {
      console.error("下書き削除エラー:", err)
    }
  }

  // 削除キャンセル
  const cancelDeleteDraft = () => {
    setShowDeleteConfirmModal(false)
    setDeletingDraftId(null)
  }

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <MobileHeader />
        <div className="lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">記録を読み込み中...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <MobileHeader />
        <div className="lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-red-500 text-xl mb-4">⚠️</div>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <button
                    onClick={loadInitialData}
                    className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          </main>
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
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-violet-500/20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                    記録一覧
                  </h2>
                </div>
              </div>
              <button
                onClick={openAddModal}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-violet-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 mr-2" />
                新しい記録を追加
              </button>
            </div>

            {/* 下書き一覧 */}
            {drafts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-4">
                  下書き
                </h3>
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-red-200/50 border-2 border-red-300/60 backdrop-blur-sm overflow-hidden relative"
                    >
                      {/* 下書きラベル */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-300/50">
                          下書き中
                        </span>
                      </div>

                      {/* 編集ボタン */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={() => editDraft(draft)}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg shadow-violet-500/30 text-sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          編集
                        </button>
                      </div>

                      {/* 下書きヘッダー */}
                      <div className="flex items-center justify-between p-6 border-b border-red-200/50 pt-16">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-800">{formatDate(draft.date)}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {draft.data.selectedMood && (
                              <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200/50">
                                <span className="text-sm text-amber-700 font-semibold">気分:</span>
                                <span className="text-lg">{getMoodEmoji(draft.data.selectedMood)}</span>
                              </div>
                            )}
                            {draft.data.selectedEnergy && (
                              <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200/50">
                                <span className="text-sm text-blue-700 font-semibold">エネルギー:</span>
                                <span className="text-lg">{getEnergyEmoji(draft.data.selectedEnergy)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 下書きコンテンツ（AIフィードバックなし） */}
                      <div className="p-6 space-y-6">
                        {/* 目標達成 */}
                        {draft.data.selectedGoals &&
                          draft.data.selectedGoals.some((goal) => goal.goal && goal.value) && (
                            <div>
                              <h4 className="text-sm font-bold text-slate-700 mb-3">目標のために行動したこと</h4>
                              <div className="space-y-3">
                                {draft.data.selectedGoals
                                  .filter((goal) => goal.goal && goal.value)
                                  .map((goal, index) => (
                                    <div
                                      key={index}
                                      className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 border border-violet-200/50 rounded-xl p-4 backdrop-blur-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-violet-900">{goal.goal}</span>
                                        <span className="text-violet-700 font-bold text-lg">
                                          {goal.value} {goal.unit}
                                        </span>
                                      </div>
                                      {goal.comment && (
                                        <p className="text-sm text-violet-700 font-medium">{goal.comment}</p>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* 自由コメント */}
                        {draft.data.dailyComment && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">今日の振り返り</h4>
                            <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/50 border border-slate-200/50 rounded-xl p-4 backdrop-blur-sm">
                              <p className="text-slate-700 font-medium">{draft.data.dailyComment}</p>
                            </div>
                          </div>
                        )}

                        {/* 下書き情報と削除ボタン */}
                        <div className="pt-4 border-t border-red-200/50 flex items-center justify-between">
                          <div className="text-xs text-slate-500 font-medium">
                            作成日時: {new Date(draft.created_at).toLocaleString()}
                            {draft.updated_at && (
                              <div className="mt-1">更新日時: {new Date(draft.updated_at).toLocaleString()}</div>
                            )}
                          </div>
                          <button
                            onClick={() => confirmDeleteDraft(draft.id)}
                            className="flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg shadow-red-500/30 text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 月別タブ */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 mb-8 backdrop-blur-sm">
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex border-b border-slate-200/50 min-w-max">
                    {availableMonths.map((month) => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-300 ${
                          selectedMonth === month
                            ? "border-violet-500 bg-gradient-to-r from-violet-50/80 to-purple-50/50 text-violet-700"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-blue-50/30"
                        }`}
                      >
                        {formatMonthLabel(month)}
                        <span className="ml-2 text-xs bg-gradient-to-r from-slate-100 to-blue-100 text-slate-600 px-2 py-1 rounded-full font-semibold">
                          {records.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            {currentRecords.length > 0 && (
              <div className="mb-8 bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-4">
                  {formatMonthLabel(selectedMonth)}の統計
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-xl border border-violet-200/30">
                    <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {currentRecords.length}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">記録日数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-xl border border-emerald-200/30">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {currentRecords.reduce((acc, record) => acc + record.goals.length, 0)}
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">達成した目標数</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50/50 to-violet-50/30 rounded-xl border border-purple-200/30">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                      {currentRecords.length > 0
                        ? Math.round(
                            (currentRecords.filter((record) => ["good", "very_good"].includes(record.mood)).length /
                              currentRecords.length) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-slate-600 font-semibold">良い気分の日</div>
                  </div>
                </div>
              </div>
            )}

            {/* 記録一覧 */}
            <div className="space-y-6">
              {currentRecords.length === 0 ? (
                <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-12 text-center backdrop-blur-sm">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">記録がありません</h3>
                  <p className="text-slate-600 font-medium mb-6">この月にはまだ記録がありません。</p>
                  <button
                    onClick={openAddModal}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-violet-500/30 font-semibold mx-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    最初の記録を追加
                  </button>
                </div>
              ) : (
                currentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 backdrop-blur-sm overflow-hidden"
                  >
                    {/* 記録ヘッダー */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-lg font-bold text-slate-800">{formatDate(record.date)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {record.mood && (
                            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200/50">
                              <span className="text-sm text-amber-700 font-semibold">気分:</span>
                              <span className="text-lg">{getMoodEmoji(record.mood)}</span>
                            </div>
                          )}
                          {record.energy && (
                            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200/50">
                              <span className="text-sm text-blue-700 font-semibold">エネルギー:</span>
                              <span className="text-lg">{getEnergyEmoji(record.energy)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* メインコンテンツエリア - 左右分割 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[200px]">
                      {/* 左側: 目標達成と自由コメント */}
                      <div className="p-6 space-y-6">
                        {/* 目標達成 */}
                        {record.goals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3">目標のために行動したこと</h4>
                            <div className="space-y-3">
                              {record.goals.map((goal, index) => (
                                <div
                                  key={index}
                                  className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 border border-violet-200/50 rounded-xl p-4 backdrop-blur-sm"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-violet-900">{goal.goal_title}</span>
                                    <span className="text-violet-700 font-bold text-lg">
                                      {goal.value} {goal.unit}
                                    </span>
                                  </div>
                                  {goal.comment && (
                                    <p className="text-sm text-violet-700 font-medium">{goal.comment}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 自由コメント */}
                        {record.dailyComment && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-2">今日の振り返り</h4>
                            <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/50 border border-slate-200/50 rounded-xl p-4 backdrop-blur-sm">
                              <p className="text-slate-700 font-medium">{record.dailyComment}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 右側: AIフィードバック */}
                      <div className="p-6 border-l border-slate-200/50 bg-gradient-to-br from-blue-50/30 to-indigo-50/20">
                        {record.aiFeedback ? (
                          <div className="h-full flex flex-col">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                              <div className="p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md mr-2">
                                <MessageSquare className="w-4 h-4 text-white" />
                              </div>
                              AIコーチフィードバック
                            </h4>
                            <div className="flex-1 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
                              <p className="text-blue-800 font-medium leading-relaxed text-sm">{record.aiFeedback}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mb-3">
                              <MessageSquare className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">AIフィードバックは準備中です</p>
                            <p className="text-slate-400 text-xs mt-1">OpenAI統合後に利用可能になります</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 記録追加モーダル */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={closeAddModal}
            ></div>

            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {editingDraftId ? "下書きを編集" : "新しい記録を追加"}
                </h3>
                <button
                  onClick={closeAddModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 日付選択 */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-700">記録日</h4>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm font-medium bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* 気分・感情選択 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">今日の気分</label>
                    <div className="grid grid-cols-5 gap-2">
                      {moods.map((mood) => (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() => setSelectedMood(mood.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            selectedMood === mood.value
                              ? "border-violet-500 bg-gradient-to-br from-violet-50/80 to-purple-50/50 shadow-lg shadow-violet-500/20"
                              : "border-slate-200/50 hover:border-slate-300 bg-white/50 backdrop-blur-sm"
                          }`}
                        >
                          <div className="text-2xl mb-1">{mood.emoji}</div>
                          <div className="text-xs text-slate-600 font-semibold">{mood.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">エネルギーレベル</label>
                    <div className="grid grid-cols-5 gap-2">
                      {energyLevels.map((energy) => (
                        <button
                          key={energy.value}
                          type="button"
                          onClick={() => setSelectedEnergy(energy.value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            selectedEnergy === energy.value
                              ? "border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 shadow-lg shadow-emerald-500/20"
                              : "border-slate-200/50 hover:border-slate-300 bg-white/50 backdrop-blur-sm"
                          }`}
                        >
                          <div className="text-2xl mb-1">{energy.emoji}</div>
                          <div className="text-xs text-slate-600 font-semibold">{energy.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 目標入力フィールド */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-700">目標のために行動したこと</h4>
                  {selectedGoals.map((goalItem, index) => (
                    <div
                      key={index}
                      className="border border-slate-200/50 rounded-xl p-4 bg-gradient-to-r from-white/60 to-blue-50/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500 font-semibold">#{index + 1}</span>
                        </div>
                        {selectedGoals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGoalField(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors duration-300"
                          >
                            削除
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <select
                            value={goalItem.goalId}
                            onChange={(e) => updateGoalField(index, "goalId", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                            required
                          >
                            <option value="">選択してください</option>
                            {smallGoals.map((goal) => (
                              <option key={goal.id} value={goal.id}>
                                {goal.title}
                              </option>
                            ))}
                            <option value="other">その他</option>
                          </select>
                        </div>

                        {goalItem.goalId === "other" && (
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">目標名（自由入力）</label>
                            <input
                              type="text"
                              value={goalItem.goal}
                              onChange={(e) => updateGoalField(index, "goal", e.target.value)}
                              placeholder="目標名を入力"
                              className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                              required
                            />
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={goalItem.value}
                            onChange={(e) => updateGoalField(index, "value", e.target.value)}
                            placeholder="数値"
                            min="0"
                            step="0.1"
                            className="flex-1 px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                            required
                          />
                          {goalItem.goalId === "other" ? (
                            <input
                              type="text"
                              value={goalItem.unit}
                              onChange={(e) => updateGoalField(index, "unit", e.target.value)}
                              placeholder="単位"
                              className="w-20 px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                              required
                            />
                          ) : (
                            <select
                              value={goalItem.unit}
                              onChange={(e) => updateGoalField(index, "unit", e.target.value)}
                              className="px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                            >
                              {units.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <textarea
                        value={goalItem.comment}
                        onChange={(e) => updateGoalField(index, "comment", e.target.value)}
                        rows={2}
                        placeholder="コメント（任意）"
                        className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addGoalField}
                    className="flex items-center justify-center w-full py-3 border-2 border-dashed border-slate-300/50 rounded-xl text-slate-500 hover:border-violet-300 hover:text-violet-500 transition-all duration-300 font-semibold bg-white/30 backdrop-blur-sm"
                  >
                    <span className="text-xl mr-2">+</span>
                    目標を追加
                  </button>
                </div>

                {/* タイマー記録候補 */}
                {timerRecords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">今日のタイマー記録から追加</h4>
                    <div className="space-y-2">
                      {timerRecords.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => {
                            if (record.small_goals) {
                              const newGoal = {
                                goalId: record.small_goals.id,
                                goal: record.small_goals.title,
                                value: Math.floor(record.duration / 60), // 分に変換
                                unit: "分",
                                comment: `${record.type === "pomodoro" ? "ポモドーロ" : record.type === "custom" ? "カスタムタイマー" : "ストップウォッチ"}で集中して取り組みました`,
                              }
                              setSelectedGoals([...selectedGoals, newGoal])
                            }
                          }}
                          className="w-full p-3 text-left bg-gradient-to-r from-blue-50/80 to-indigo-50/30 rounded-xl border border-blue-200/50 hover:from-blue-100/80 hover:to-indigo-100/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold text-blue-800">
                                {record.small_goals ? record.small_goals.title : "目標なし"} -{" "}
                                {Math.floor(record.duration / 60)}分
                              </div>
                              <div className="text-xs text-blue-600">
                                {record.type === "pomodoro"
                                  ? "ポモドーロ"
                                  : record.type === "custom"
                                    ? "カスタムタイマー"
                                    : "ストップウォッチ"}
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-blue-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 自由コメント */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">今日の振り返り・自由コメント</label>
                  <textarea
                    value={dailyComment}
                    onChange={(e) => setDailyComment(e.target.value)}
                    rows={3}
                    placeholder="今日の体調や気持ち、目標以外の取り組みなど自由にお書きください..."
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  />
                </div>

                {/* 画像アップロード */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">写真を追加</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-2">
                      {selectedImages.map((image, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gradient-to-r from-slate-100 to-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-slate-700 mr-2 mb-2 border border-slate-200/50"
                        >
                          {image.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg shadow-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    下書き保存
                  </button>
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-300/50 rounded-xl hover:from-slate-200 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 font-semibold transition-all duration-300 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "保存中..." : "記録を登録"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={cancelDeleteDraft}
            ></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  下書きを削除
                </h3>
                <button
                  onClick={cancelDeleteDraft}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 font-medium">この下書きを削除してもよろしいですか？</p>
                <p className="text-sm text-slate-500 mt-2 font-medium">削除した下書きは復元できません。</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteDraft}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-300/50 rounded-xl hover:from-slate-200 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={deleteDraftConfirmed}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 border border-transparent rounded-xl hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 shadow-lg shadow-red-500/30"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 下書き保存成功モーダル */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setShowSaveSuccessModal(false)}
            ></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  保存完了
                </h3>
                <button
                  onClick={() => setShowSaveSuccessModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-700 font-medium">{saveSuccessMessage}</p>
              </div>

              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 border border-transparent rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/30"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
