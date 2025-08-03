"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  X,
  MoreVertical,
  Archive,
  Calendar,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  RotateCcw,
  Trash2,
  BarChart3,
  Loader2,
} from "lucide-react"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"
import { bigGoalsApi, smallGoalsApi, categoriesApi } from "../../lib/supabase"

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [recordingGoal, setRecordingGoal] = useState(null)
  const [openMenus, setOpenMenus] = useState({})
  const [modalType, setModalType] = useState("big") // "big" or "small"
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false)
  const [expandedCompletedGoals, setExpandedCompletedGoals] = useState({})
  const [isCompletedGoalsModalOpen, setIsCompletedGoalsModalOpen] = useState(false)
  const [isPastSmallGoalsExpanded, setIsPastSmallGoalsExpanded] = useState(false)

  // データ状態
  const [bigGoals, setBigGoals] = useState([])
  const [smallGoals, setSmallGoals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetValue: "",
    unit: "",
    deadline: "",
    bigGoalId: null,
    imageUrl: "",
  })

  const [recordData, setRecordData] = useState({
    content: "",
    value: "",
    unit: "分",
    comment: "",
    date: new Date().toISOString().split("T")[0],
  })

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const units = ["点", "kg", "%", "冊", "時間", "回", "km", "分", "周", "ページ"]

  // データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [bigGoalsData, smallGoalsData, categoriesData] = await Promise.all([
        bigGoalsApi.getAll(),
        smallGoalsApi.getAll(),
        categoriesApi.getAll(),
      ])

      setBigGoals(bigGoalsData || [])
      setSmallGoals(smallGoalsData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      console.error("データ読み込みエラー:", err)
      setError("データの読み込みに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  // 期限計算関数
  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // ゴールのステータス判定
  const getGoalStatus = (goal) => {
    if (goal.status === "completed" || goal.is_completed) return "completed"
    if (!goal.deadline) return "no_deadline"

    const daysUntil = getDaysUntilDeadline(goal.deadline)
    if (daysUntil < 0) return "overdue"
    return "active"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "active":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-slate-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "達成済み"
      case "active":
        return "進行中"
      case "overdue":
        return "期限超過"
      default:
        return "未設定"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            達成済み
          </span>
        )
      case "active":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50">
            <Clock className="w-3 h-3 mr-1" />
            進行中
          </span>
        )
      case "overdue":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            期限超過
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200/50">
            <Clock className="w-3 h-3 mr-1" />
            未設定
          </span>
        )
    }
  }

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  const toggleMenu = (goalId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }))
  }

  const toggleCompletedGoals = (bigGoalId) => {
    setExpandedCompletedGoals((prev) => ({
      ...prev,
      [bigGoalId]: !prev[bigGoalId],
    }))
  }

  // 達成から3日経過しているかチェック
  const isMoreThan3DaysAgo = (completedAt) => {
    if (!completedAt) return false
    const completedDate = new Date(completedAt)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return completedDate < threeDaysAgo
  }

  const handleCompleteBigGoal = async (goalId) => {
    try {
      await bigGoalsApi.update(goalId, {
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      await loadData()
      setOpenMenus({})
    } catch (err) {
      console.error("ビッグゴール完了エラー:", err)
      setError("ビッグゴールの完了に失敗しました")
    }
  }

  const handleHoldBigGoal = async (goalId) => {
    try {
      await bigGoalsApi.update(goalId, { status: "on_hold" })
      await loadData()
      setOpenMenus({})
    } catch (err) {
      console.error("ビッグゴール保留エラー:", err)
      setError("ビッグゴールの保留に失敗しました")
    }
  }

  const handleAddCategory = async () => {
    if (newCategoryName.trim() && !categories.find((cat) => cat.name === newCategoryName.trim())) {
      try {
        const newCategory = await categoriesApi.create(newCategoryName.trim())
        setCategories((prev) => [...prev, newCategory])
        setFormData({ ...formData, category: newCategory.id })
        setNewCategoryName("")
        setIsAddingCategory(false)
      } catch (err) {
        console.error("カテゴリ作成エラー:", err)
        setError("カテゴリの作成に失敗しました")
      }
    }
  }

  const handleCancelAddCategory = () => {
    setNewCategoryName("")
    setIsAddingCategory(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalType === "big") {
        // ビッグゴールの処理
        const goalData = {
          title: formData.title,
          description: formData.description,
          category_id: formData.category || null,
          deadline: formData.deadline || null,
          image_url: formData.imageUrl || null,
        }

        if (editingGoal) {
          await bigGoalsApi.update(editingGoal.id, goalData)
        } else {
          await bigGoalsApi.create(goalData)
        }
      } else {
        // スモールゴールの処理
        const goalData = {
          title: formData.title,
          description: formData.description,
          big_goal_id: formData.bigGoalId,
          target_value: Number.parseFloat(formData.targetValue),
          unit: formData.unit,
          deadline: formData.deadline || null,
        }

        if (editingGoal) {
          await smallGoalsApi.update(editingGoal.id, goalData)
        } else {
          await smallGoalsApi.create(goalData)
        }
      }

      await loadData()
      closeModal()
    } catch (err) {
      console.error("目標保存エラー:", err)
      console.error("エラーメッセージ:", err.message)
      console.error("エラー詳細:", JSON.stringify(err, null, 2))
      setError(`目標の保存に失敗しました: ${err.message || 'Unknown error'}`)
    }
  }

  const handleRecordSubmit = async (e) => {
    e.preventDefault()

    try {
      // 進捗を更新
      const updatedValue = recordingGoal.current_value + Number.parseFloat(recordData.value)
      await smallGoalsApi.updateProgress(recordingGoal.id, updatedValue)

      await loadData()
      closeRecordModal()
    } catch (err) {
      console.error("記録保存エラー:", err)
      setError("記録の保存に失敗しました")
    }
  }

  const handleEdit = (goal, type) => {
    setEditingGoal(goal)
    setModalType(type)
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category_id || goal.categories?.id || "",
      targetValue: goal.target_value || "",
      unit: goal.unit || "",
      deadline: goal.deadline,
      bigGoalId: goal.big_goal_id || null,
      imageUrl: goal.image_url || "",
    })
    setIsModalOpen(true)
  }

  const handleRecord = (goal) => {
    setRecordingGoal(goal)
    setIsRecordModalOpen(true)
  }

  const handleArchive = async (goalId, type) => {
    try {
      if (type === "big") {
        await bigGoalsApi.archive(goalId)
      } else {
        await smallGoalsApi.update(goalId, { is_archived: true })
      }
      await loadData()
      setOpenMenus({})
    } catch (err) {
      console.error("アーカイブエラー:", err)
      setError("アーカイブに失敗しました")
    }
  }

  const handleRestore = async (goalId, type) => {
    try {
      if (type === "big") {
        await bigGoalsApi.restore(goalId)
      } else {
        await smallGoalsApi.update(goalId, { is_archived: false })
      }
      await loadData()
    } catch (err) {
      console.error("復元エラー:", err)
      setError("復元に失敗しました")
    }
  }

  const handleDelete = async (goalId, type) => {
    if (confirm("この目標を完全に削除しますか？")) {
      try {
        if (type === "big") {
          await bigGoalsApi.delete(goalId)
        } else {
          await smallGoalsApi.update(goalId, { is_archived: true }) // 論理削除
        }
        await loadData()
      } catch (err) {
        console.error("削除エラー:", err)
        setError("削除に失敗しました")
      }
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
    setIsAddingCategory(false)
    setNewCategoryName("")
    setFormData({
      title: "",
      description: "",
      category: "",
      targetValue: "",
      unit: "",
      deadline: "",
      bigGoalId: null,
      imageUrl: "",
    })
  }

  const closeRecordModal = () => {
    setIsRecordModalOpen(false)
    setRecordingGoal(null)
    setRecordData({
      content: "",
      value: "",
      unit: "分",
      comment: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  // データフィルタリング
  const activeBigGoals = bigGoals.filter((goal) => !goal.is_archived)
  const activeSmallGoals = smallGoals
    .filter((goal) => !goal.is_archived && !isMoreThan3DaysAgo(goal.completed_at))
    .sort((a, b) => {
      // 達成済みを後ろに移動
      if (a.is_completed && !b.is_completed) return 1
      if (!a.is_completed && b.is_completed) return -1
      return 0
    })
  const archivedBigGoals = bigGoals.filter((goal) => goal.is_archived)
  const archivedSmallGoals = smallGoals.filter((goal) => goal.is_archived)

  const getCompletedSmallGoals = (bigGoalId) => {
    return activeSmallGoals.filter((goal) => goal.big_goal_id === bigGoalId && goal.is_completed)
  }

  // 過去に達成したスモール目標を取得
  const pastCompletedSmallGoals = smallGoals.filter(
    (goal) => !goal.is_archived && goal.is_completed && isMoreThan3DaysAgo(goal.completed_at),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <MobileHeader />
        <div className="lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          <main className="p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                目標を読み込み中...
              </h2>
              <p className="text-slate-600 font-medium">しばらくお待ちください</p>
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
          <div className="max-w-7xl mx-auto">
            {/* エラー表示 */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50/80 to-pink-50/50 border border-red-200/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-red-800 font-medium">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-violet-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  目標一覧
                </h2>
              </div>
              <button
                onClick={() => setIsCompletedGoalsModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                達成した目標
              </button>
            </div>

            {/* ビッグゴールセクション */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                  ビッグゴール
                </h3>
                <button
                  onClick={() => {
                    setModalType("big")
                    setIsModalOpen(true)
                  }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30"
                >
                  <Target className="w-4 h-4 mr-2" />
                  ビッグゴールを追加
                </button>
              </div>
              <div className="space-y-6">
                {activeBigGoals.map((bigGoal) => {
                  const completedSmallGoals = getCompletedSmallGoals(bigGoal.id)
                  const isCompletedExpanded = expandedCompletedGoals[bigGoal.id]
                  const isMenuOpen = openMenus[`big-${bigGoal.id}`]

                  return (
                    <div
                      key={bigGoal.id}
                      className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm"
                    >
                      <div className="flex gap-6 h-64">
                        {/* 左側のコンテンツエリア（3分の2） */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg mr-2">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-xs font-semibold bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200/50">
                                ビッグゴール
                              </span>
                              {bigGoal.categories && (
                                <span className="ml-2 text-xs font-semibold bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200/50">
                                  {bigGoal.categories.name}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => toggleMenu(`big-${bigGoal.id}`)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg z-10 border border-slate-200/50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleEdit(bigGoal, "big")
                                        setOpenMenus({})
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      編集
                                    </button>
                                    <button
                                      onClick={() => handleCompleteBigGoal(bigGoal.id)}
                                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      達成
                                    </button>
                                    <button
                                      onClick={() => handleHoldBigGoal(bigGoal.id)}
                                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      一旦保留
                                    </button>
                                    <button
                                      onClick={() => handleArchive(bigGoal.id, "big")}
                                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                    >
                                      <Archive className="w-4 h-4 mr-2" />
                                      アーカイブ
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <h4 className="text-2xl font-bold text-slate-800 mb-2">{bigGoal.title}</h4>
                          <p className="text-sm text-slate-600 mb-4 flex-1 font-medium">{bigGoal.description}</p>

                          {bigGoal.deadline && (
                            <div className="mb-4">
                              <div className="text-sm text-slate-500 font-medium">期限: {bigGoal.deadline}</div>
                              {(() => {
                                const daysUntil = getDaysUntilDeadline(bigGoal.deadline)
                                if (daysUntil === null) return null
                                if (daysUntil < 0) {
                                  return (
                                    <div className="text-sm text-red-600 font-bold">
                                      期限超過 {Math.abs(daysUntil)}日
                                    </div>
                                  )
                                } else if (daysUntil === 0) {
                                  return <div className="text-sm text-orange-600 font-bold">今日が期限</div>
                                } else {
                                  return <div className="text-sm text-blue-600 font-bold">あと{daysUntil}日</div>
                                }
                              })()}
                            </div>
                          )}

                          <div className="flex items-center">
                            {getStatusIcon(getGoalStatus(bigGoal))}
                            <span className="ml-2 text-sm font-bold text-slate-700">
                              {getStatusText(getGoalStatus(bigGoal))}
                            </span>
                          </div>
                        </div>

                        {/* 中央の画像エリア（3分の1） */}
                        <div className="w-1/3 flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-slate-100/50 to-blue-100/30 rounded-xl border-2 border-dashed border-slate-300/50 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                            {bigGoal.image_url ? (
                              <img
                                src={bigGoal.image_url || "/placeholder.svg"}
                                alt={bigGoal.title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <span className="text-slate-400 text-sm font-medium">画像を追加</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 右側の達成済みスモールゴール（3分の1） */}
                        <div className="w-1/3 flex-shrink-0">
                          <div className="h-full border-l border-slate-200/50 pl-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-bold text-slate-700">達成済みスモールゴール</h5>
                              {completedSmallGoals.length > 0 && (
                                <button
                                  onClick={() => toggleCompletedGoals(bigGoal.id)}
                                  className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 flex items-center transition-all duration-300"
                                >
                                  {isCompletedExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3 mr-1" />
                                      折りたたむ
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      {completedSmallGoals.length}個
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                              {completedSmallGoals.length === 0 ? (
                                <p className="text-xs text-slate-500 font-medium">
                                  まだ達成済みのスモールゴールがありません
                                </p>
                              ) : isCompletedExpanded ? (
                                <div className="space-y-2">
                                  {completedSmallGoals.map((goal) => (
                                    <div
                                      key={goal.id}
                                      className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/50 rounded-lg p-2 backdrop-blur-sm"
                                    >
                                      <div className="flex items-center mb-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-500 mr-1" />
                                        <span className="text-xs font-bold text-emerald-800">{goal.title}</span>
                                      </div>
                                      <p className="text-xs text-emerald-600 font-semibold">
                                        {goal.current_value}/{goal.target_value} {goal.unit}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {completedSmallGoals.slice(0, 3).map((goal) => (
                                    <div key={goal.id} className="flex items-center">
                                      <CheckCircle className="w-3 h-3 text-emerald-500 mr-2" />
                                      <span className="text-xs text-slate-700 truncate font-medium">{goal.title}</span>
                                    </div>
                                  ))}
                                  {completedSmallGoals.length > 3 && (
                                    <p className="text-xs text-slate-500 font-medium">
                                      他{completedSmallGoals.length - 3}個...
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* スモールゴール一覧 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                  スモールゴール
                </h3>
                <button
                  onClick={() => {
                    setModalType("small")
                    setIsModalOpen(true)
                  }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg shadow-violet-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  スモールゴールを追加
                </button>
              </div>
              {activeSmallGoals.length === 0 ? (
                <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-12 text-center backdrop-blur-sm">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">スモールゴールがありません</h3>
                  <p className="text-slate-600 font-medium">新しいスモールゴールを追加してみましょう。</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSmallGoals.map((goal) => {
                    const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value)
                    const bigGoal = activeBigGoals.find((bg) => bg.id === goal.big_goal_id)
                    const isMenuOpen = openMenus[`small-${goal.id}`]
                    const status = getGoalStatus(goal)

                    return (
                      <div
                        key={goal.id}
                        className={`bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                          goal.is_completed
                            ? "border-2 border-emerald-400/50 shadow-emerald-500/10"
                            : "border border-slate-200/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
                            <span className="text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-3 py-1 rounded-full border border-violet-200/50">
                              スモールゴール
                            </span>
                            {!goal.is_completed && getStatusBadge(status)}
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(`small-${goal.id}`)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {isMenuOpen && (
                              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg z-10 border border-slate-200/50">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleEdit(goal, "small")
                                      setOpenMenus({})
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    編集
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleRecord(goal)
                                      setOpenMenus({})
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    記録する
                                  </button>
                                  <button
                                    onClick={() => handleArchive(goal.id, "small")}
                                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 w-full text-left font-medium transition-all duration-300"
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    アーカイブ
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{goal.title}</h4>
                          {goal.is_completed && (
                            <span className="text-emerald-600 font-bold text-sm bg-gradient-to-r from-emerald-100 to-teal-100 px-2 py-1 rounded-lg border border-emerald-200/50">
                              達成！
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2 font-medium">{goal.description}</p>

                        {bigGoal && (
                          <p className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
                            関連するビッグゴール: {bigGoal.title}
                          </p>
                        )}

                        {/* 進捗バー */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">進捗</span>
                            <span className="text-sm font-bold text-slate-800">
                              {goal.current_value} / {goal.target_value} {goal.unit}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                status === "completed"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                  : status === "overdue"
                                    ? "bg-gradient-to-r from-red-500 to-pink-500"
                                    : "bg-gradient-to-r from-violet-500 to-purple-600"
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-xs text-slate-500 font-semibold">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 過去に達成したスモール目標 */}
            {pastCompletedSmallGoals.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setIsPastSmallGoalsExpanded(!isPastSmallGoalsExpanded)}
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-blue-50/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                      過去に達成したスモール目標 ({pastCompletedSmallGoals.length}個)
                    </h3>
                  </div>
                  {isPastSmallGoalsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {isPastSmallGoalsExpanded && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pastCompletedSmallGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-gradient-to-r from-emerald-100/60 to-teal-50/80 rounded-xl border border-emerald-200/40 p-4 opacity-75 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-emerald-700">{goal.title}</h5>
                            <span className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200/50 font-semibold">
                              達成済み
                            </span>
                          </div>
                          <p className="text-sm text-emerald-600 font-medium mb-2">{goal.description}</p>
                          <p className="text-xs text-emerald-500 font-medium">
                            {goal.current_value}/{goal.target_value} {goal.unit}
                          </p>
                          {goal.completed_at && (
                            <p className="text-xs text-emerald-400 mt-1 font-medium">
                              達成日: {new Date(goal.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* アーカイブセクション */}
            {(archivedBigGoals.length > 0 || archivedSmallGoals.length > 0) && (
              <div className="mb-8">
                <button
                  onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-blue-50/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg mr-3">
                      <Archive className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">
                      アーカイブ ({archivedBigGoals.length + archivedSmallGoals.length}個)
                    </h3>
                  </div>
                  {isArchiveExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {isArchiveExpanded && (
                  <div className="mt-4 space-y-6">
                    {/* アーカイブされたビッグゴール */}
                    {archivedBigGoals.length > 0 && (
                      <div>
                        <h4 className="text-md font-bold text-slate-600 mb-4">ビッグゴール</h4>
                        <div className="space-y-4">
                          {archivedBigGoals.map((goal) => (
                            <div
                              key={goal.id}
                              className="bg-gradient-to-r from-slate-100/60 to-slate-50/80 rounded-xl border border-slate-200/40 p-4 opacity-75 backdrop-blur-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-slate-700">{goal.title}</h5>
                                  <p className="text-sm text-slate-500 font-medium">{goal.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleRestore(goal.id, "big")}
                                    className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 font-semibold"
                                  >
                                    <RotateCcw className="w-3 h-3 mr-1 inline" />
                                    復元
                                  </button>
                                  <button
                                    onClick={() => handleDelete(goal.id, "big")}
                                    className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-3 py-1 rounded-lg hover:from-red-200 hover:to-pink-200 transition-all duration-300 font-semibold"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1 inline" />
                                    削除
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* アーカイブされたスモールゴール */}
                    {archivedSmallGoals.length > 0 && (
                      <div>
                        <h4 className="text-md font-bold text-slate-600 mb-4">スモールゴール</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {archivedSmallGoals.map((goal) => (
                            <div
                              key={goal.id}
                              className="bg-gradient-to-r from-slate-100/60 to-slate-50/80 rounded-xl border border-slate-200/40 p-4 opacity-75 backdrop-blur-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-slate-700">{goal.title}</h5>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleRestore(goal.id, "small")}
                                    className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 font-semibold"
                                  >
                                    復元
                                  </button>
                                  <button
                                    onClick={() => handleDelete(goal.id, "small")}
                                    className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-2 py-1 rounded-lg hover:from-red-200 hover:to-pink-200 transition-all duration-300 font-semibold"
                                  >
                                    削除
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500 font-medium">{goal.description}</p>
                              <p className="text-xs text-slate-400 mt-1 font-medium">
                                {goal.current_value}/{goal.target_value} {goal.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 目標作成・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={closeModal}
            ></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                  {editingGoal
                    ? `${modalType === "big" ? "ビッグゴール" : "スモールゴール"}を編集`
                    : `新しい${modalType === "big" ? "ビッグゴール" : "スモールゴール"}を追加`}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">目標名</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  />
                </div>

                {modalType === "big" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">カテゴリ</label>
                      {!isAddingCategory ? (
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            if (e.target.value === "ADD_NEW") {
                              setIsAddingCategory(true)
                            } else {
                              setFormData({ ...formData, category: e.target.value })
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                          required
                        >
                          <option value="">選択してください</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                          <option value="ADD_NEW" className="text-violet-600 font-semibold">
                            + 新しいカテゴリを追加
                          </option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="新しいカテゴリ名を入力"
                            className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="flex-1 px-3 py-1 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-300"
                            >
                              追加
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelAddCategory}
                              className="flex-1 px-3 py-1 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-300/50 rounded-lg hover:from-slate-200 hover:to-gray-200 transition-all duration-300"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">画像URL（任意）</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                      />
                    </div>
                  </>
                )}

                {modalType === "small" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">関連するビッグゴール</label>
                      <select
                        value={formData.bigGoalId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bigGoalId: e.target.value ? e.target.value : null,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                        required
                      >
                        <option value="">選択してください</option>
                        {activeBigGoals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">目標値</label>
                        <input
                          type="number"
                          value={formData.targetValue}
                          onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">単位</label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                          required
                        >
                          <option value="">選択してください</option>
                          {units.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">期限</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-300/50 rounded-xl hover:from-slate-200 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 border border-transparent rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 shadow-lg shadow-violet-500/30"
                  >
                    {editingGoal ? "更新" : "作成"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 記録モーダル */}
      {isRecordModalOpen && recordingGoal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={closeRecordModal}
            ></div>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                  記録を追加
                </h3>
                <button
                  onClick={closeRecordModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-200/50">
                <p className="text-sm font-bold text-blue-900">{recordingGoal.title}</p>
                <p className="text-xs text-blue-700 font-medium">{recordingGoal.description}</p>
                <div className="mt-2">{getStatusBadge(getGoalStatus(recordingGoal))}</div>
              </div>

              <form onSubmit={handleRecordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">実施内容</label>
                  <input
                    type="text"
                    value={recordData.content}
                    onChange={(e) => setRecordData({ ...recordData, content: e.target.value })}
                    placeholder="例：5km走った"
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">進捗値</label>
                    <input
                      type="number"
                      value={recordData.value}
                      onChange={(e) => setRecordData({ ...recordData, value: e.target.value })}
                      placeholder="5"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">単位</label>
                    <input
                      type="text"
                      value={recordingGoal.unit}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300/50 rounded-xl bg-slate-100/50 text-slate-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={recordData.date}
                    onChange={(e) => setRecordData({ ...recordData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">コメント（任意）</label>
                  <textarea
                    value={recordData.comment}
                    onChange={(e) => setRecordData({ ...recordData, comment: e.target.value })}
                    rows={3}
                    placeholder="今日の取り組みについて..."
                    className="w-full px-3 py-2 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeRecordModal}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-300/50 rounded-xl hover:from-slate-200 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all duration-300"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 border border-transparent rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300 shadow-lg shadow-violet-500/30"
                  >
                    記録を保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 達成した目標モーダル */}
      {isCompletedGoalsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setIsCompletedGoalsModalOpen(false)}
            ></div>

            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  達成した目標
                </h3>
                <button
                  onClick={() => setIsCompletedGoalsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {(() => {
                  const completedBigGoals = bigGoals.filter((goal) => goal.status === "completed")

                  if (completedBigGoals.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">達成した目標がありません</h3>
                        <p className="text-slate-600 font-medium">目標を達成したら、ここに表示されます。</p>
                      </div>
                    )
                  }

                  // 年ごとにグループ化
                  const goalsByYear = completedBigGoals.reduce((acc, goal) => {
                    const year = goal.completed_at
                      ? new Date(goal.completed_at).getFullYear()
                      : new Date().getFullYear()
                    if (!acc[year]) acc[year] = []
                    acc[year].push(goal)
                    return acc
                  }, {})

                  return Object.entries(goalsByYear)
                    .sort(([a], [b]) => b - a) // 年の降順
                    .map(([year, goals]) => (
                      <div key={year} className="mb-6">
                        <h4 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                          {year}年
                        </h4>
                        <div className="space-y-4">
                          {goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/50 rounded-xl p-4 backdrop-blur-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
                                      <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <h5 className="font-bold text-emerald-800">{goal.title}</h5>
                                    {goal.categories && (
                                      <span className="ml-2 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/50">
                                        {goal.categories.name}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-emerald-600 font-medium mb-2">{goal.description}</p>
                                  {goal.completed_at && (
                                    <p className="text-xs text-emerald-500 font-medium">
                                      達成日: {new Date(goal.completed_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {goal.image_url && (
                                  <div className="w-20 h-20 ml-4 flex-shrink-0">
                                    <img
                                      src={goal.image_url || "/placeholder.svg"}
                                      alt={goal.title}
                                      className="w-full h-full object-cover rounded-lg border border-emerald-200/50"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
