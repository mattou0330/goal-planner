"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import {
  bigGoalsApi,
  smallGoalsApi,
  recordsApi,
  timerRecordsApi,
  categoriesApi,
  tasksApi,
  draftsApi,
} from "../lib/supabase"

const DataContext = createContext({})

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [bigGoals, setBigGoals] = useState([])
  const [smallGoals, setSmallGoals] = useState([])
  const [records, setRecords] = useState([])
  const [timerRecords, setTimerRecords] = useState([])
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(false)

  // データの初期読み込み
  useEffect(() => {
    if (user) {
      loadAllData()
    } else {
      // ユーザーがログアウトした場合、データをクリア
      setBigGoals([])
      setSmallGoals([])
      setRecords([])
      setTimerRecords([])
      setCategories([])
      setTasks([])
      setDrafts([])
    }
  }, [user])

  // デモ用のモックデータ
  const getMockData = () => {
    const mockCategories = [
      { id: 1, name: "健康・フィットネス" },
      { id: 2, name: "学習・スキル" },
      { id: 3, name: "キャリア" },
      { id: 4, name: "人間関係" }
    ]

    const mockBigGoals = [
      {
        id: 1,
        title: "マラソン完走を目指す",
        description: "半年後のマラソン大会で完走を目指します",
        category_id: 1,
        is_completed: false,
        deadline: "2024-12-31",
        created_at: "2024-01-01",
        categories: { id: 1, name: "健康・フィットネス" }
      },
      {
        id: 2,
        title: "プログラミングスキルの向上",
        description: "React と Next.js の習得",
        category_id: 2,
        is_completed: false,
        deadline: "2024-06-30",
        created_at: "2024-01-15",
        categories: { id: 2, name: "学習・スキル" }
      },
      {
        id: 3,
        title: "副業で月5万円の収入",
        description: "Web制作の副業で安定収入を得る",
        category_id: 3,
        is_completed: true,
        deadline: "2024-03-31",
        created_at: "2023-12-01",
        categories: { id: 3, name: "キャリア" }
      }
    ]

    const mockSmallGoals = [
      {
        id: 1,
        title: "毎日30分のランニング",
        big_goal_id: 1,
        target_value: 30,
        current_value: 18,
        unit: "日",
        is_completed: false,
        created_at: "2024-01-05",
        big_goals: { id: 1, title: "マラソン完走を目指す", categories: { id: 1, name: "健康・フィットネス" } }
      },
      {
        id: 2,
        title: "React公式チュートリアル完了",
        big_goal_id: 2,
        target_value: 1,
        current_value: 1,
        unit: "完了",
        is_completed: true,
        created_at: "2024-01-20",
        big_goals: { id: 2, title: "プログラミングスキルの向上", categories: { id: 2, name: "学習・スキル" } }
      },
      {
        id: 3,
        title: "Next.js プロジェクト作成",
        big_goal_id: 2,
        target_value: 3,
        current_value: 1,
        unit: "個",
        is_completed: false,
        created_at: "2024-02-01",
        big_goals: { id: 2, title: "プログラミングスキルの向上", categories: { id: 2, name: "学習・スキル" } }
      }
    ]

    const mockRecords = [
      {
        id: 1,
        date: "2024-03-15",
        mood: 4,
        energy: 5,
        daily_comment: "今日は調子が良く、ランニングも順調でした。新しいコードも理解できて満足です。",
        created_at: "2024-03-15",
        record_goals: []
      },
      {
        id: 2,
        date: "2024-03-14",
        mood: 3,
        energy: 3,
        daily_comment: "普通の一日でした。少し疲れ気味でしたが、目標は達成できました。",
        created_at: "2024-03-14",
        record_goals: []
      }
    ]

    const mockTasks = [
      { id: 1, text: "プロジェクトの企画書を作成", is_completed: false, order_index: 0 },
      { id: 2, text: "健康診断の予約", is_completed: true, order_index: 1 },
      { id: 3, text: "家族との時間を作る", is_completed: false, order_index: 2 }
    ]

    return {
      bigGoalsData: mockBigGoals,
      smallGoalsData: mockSmallGoals,
      recordsData: mockRecords,
      timerRecordsData: [],
      categoriesData: mockCategories,
      tasksData: mockTasks,
      draftsData: []
    }
  }

  const loadAllData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Supabaseの設定をチェック
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://demo-supabase-url.supabase.co') {
        // モックデータを使用
        console.log("デモモード: モックデータを使用しています")
        const mockData = getMockData()
        setBigGoals(mockData.bigGoalsData)
        setSmallGoals(mockData.smallGoalsData)
        setRecords(mockData.recordsData)
        setTimerRecords(mockData.timerRecordsData)
        setCategories(mockData.categoriesData)
        setTasks(mockData.tasksData)
        setDrafts(mockData.draftsData)
        return
      }

      // 実際のSupabaseからデータを取得
      const [bigGoalsData, smallGoalsData, recordsData, timerRecordsData, categoriesData, tasksData, draftsData] =
        await Promise.all([
          bigGoalsApi.getAll().catch(() => []),
          smallGoalsApi.getAll().catch(() => []),
          recordsApi.getByMonth(new Date().getFullYear(), new Date().getMonth() + 1).catch(() => []),
          timerRecordsApi.getByDate(new Date().toISOString().split("T")[0]).catch(() => []),
          categoriesApi.getAll().catch(() => []),
          tasksApi.getAll().catch(() => []),
          draftsApi.getAll().catch(() => []),
        ])

      setBigGoals(bigGoalsData)
      setSmallGoals(smallGoalsData)
      setRecords(recordsData)
      setTimerRecords(timerRecordsData)
      setCategories(categoriesData)
      setTasks(tasksData)
      setDrafts(draftsData)
    } catch (error) {
      console.error("データ読み込みエラー:", error)
      // エラーの場合もモックデータを使用
      const mockData = getMockData()
      setBigGoals(mockData.bigGoalsData)
      setSmallGoals(mockData.smallGoalsData)
      setRecords(mockData.recordsData)
      setTimerRecords(mockData.timerRecordsData)
      setCategories(mockData.categoriesData)
      setTasks(mockData.tasksData)
      setDrafts(mockData.draftsData)
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ関連の関数
  const createCategory = async (name) => {
    try {
      const newCategory = await categoriesApi.create(name)
      setCategories((prev) => [...prev, newCategory])
      return newCategory
    } catch (error) {
      console.error("カテゴリ作成エラー:", error)
      throw error
    }
  }

  const updateCategory = async (id, name) => {
    try {
      const updatedCategory = await categoriesApi.update(id, name)
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)))
      return updatedCategory
    } catch (error) {
      console.error("カテゴリ更新エラー:", error)
      throw error
    }
  }

  const deleteCategory = async (id) => {
    try {
      await categoriesApi.delete(id)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
    } catch (error) {
      console.error("カテゴリ削除エラー:", error)
      throw error
    }
  }

  // ビッグゴール関連の関数
  const createBigGoal = async (goalData) => {
    try {
      const newGoal = await bigGoalsApi.create(goalData)
      setBigGoals((prev) => [...prev, newGoal])
      return newGoal
    } catch (error) {
      console.error("ビッグゴール作成エラー:", error)
      throw error
    }
  }

  const updateBigGoal = async (id, goalData) => {
    try {
      const updatedGoal = await bigGoalsApi.update(id, goalData)
      setBigGoals((prev) => prev.map((goal) => (goal.id === id ? updatedGoal : goal)))
      return updatedGoal
    } catch (error) {
      console.error("ビッグゴール更新エラー:", error)
      throw error
    }
  }

  const deleteBigGoal = async (id) => {
    try {
      await bigGoalsApi.delete(id)
      setBigGoals((prev) => prev.filter((goal) => goal.id !== id))
      // 関連するスモールゴールも削除
      setSmallGoals((prev) => prev.filter((goal) => goal.big_goal_id !== id))
    } catch (error) {
      console.error("ビッグゴール削除エラー:", error)
      throw error
    }
  }

  // スモールゴール関連の関数
  const createSmallGoal = async (goalData) => {
    try {
      const newGoal = await smallGoalsApi.create(goalData)
      setSmallGoals((prev) => [...prev, newGoal])
      return newGoal
    } catch (error) {
      console.error("スモールゴール作成エラー:", error)
      throw error
    }
  }

  const updateSmallGoal = async (id, goalData) => {
    try {
      const updatedGoal = await smallGoalsApi.update(id, goalData)
      setSmallGoals((prev) => prev.map((goal) => (goal.id === id ? updatedGoal : goal)))
      return updatedGoal
    } catch (error) {
      console.error("スモールゴール更新エラー:", error)
      throw error
    }
  }

  const deleteSmallGoal = async (id) => {
    try {
      await smallGoalsApi.delete(id)
      setSmallGoals((prev) => prev.filter((goal) => goal.id !== id))
    } catch (error) {
      console.error("スモールゴール削除エラー:", error)
      throw error
    }
  }

  const completeSmallGoal = async (id) => {
    try {
      const updatedGoal = await smallGoalsApi.update(id, { is_completed: true, completed_at: new Date().toISOString() })
      setSmallGoals((prev) => prev.map((goal) => (goal.id === id ? updatedGoal : goal)))
      return updatedGoal
    } catch (error) {
      console.error("スモールゴール完了エラー:", error)
      throw error
    }
  }

  // 記録関連の関数
  const createRecord = async (recordData) => {
    try {
      const newRecord = await recordsApi.create(recordData)
      setRecords((prev) => [...prev, newRecord])
      return newRecord
    } catch (error) {
      console.error("記録作成エラー:", error)
      throw error
    }
  }

  const updateRecord = async (id, recordData) => {
    try {
      const updatedRecord = await recordsApi.update(id, recordData)
      setRecords((prev) => prev.map((record) => (record.id === id ? updatedRecord : record)))
      return updatedRecord
    } catch (error) {
      console.error("記録更新エラー:", error)
      throw error
    }
  }

  const deleteRecord = async (id) => {
    try {
      await recordsApi.delete(id)
      setRecords((prev) => prev.filter((record) => record.id !== id))
    } catch (error) {
      console.error("記録削除エラー:", error)
      throw error
    }
  }

  // タイマー記録関連の関数
  const createTimerRecord = async (recordData) => {
    try {
      const newRecord = await timerRecordsApi.create(recordData)
      setTimerRecords((prev) => [...prev, newRecord])
      return newRecord
    } catch (error) {
      console.error("タイマー記録作成エラー:", error)
      throw error
    }
  }

  // タスク関連の関数
  const createTask = async (text) => {
    try {
      const newTask = await tasksApi.create(text)
      setTasks((prev) => [...prev, newTask])
      return newTask
    } catch (error) {
      console.error("タスク作成エラー:", error)
      throw error
    }
  }

  const updateTask = async (id, text) => {
    try {
      const updatedTask = await tasksApi.update(id, { text })
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      return updatedTask
    } catch (error) {
      console.error("タスク更新エラー:", error)
      throw error
    }
  }

  const toggleTask = async (id) => {
    try {
      const task = tasks.find((t) => t.id === id)
      const updatedTask = await tasksApi.update(id, { is_completed: !task.is_completed })
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      return updatedTask
    } catch (error) {
      console.error("タスク切り替えエラー:", error)
      throw error
    }
  }

  const deleteTask = async (id) => {
    try {
      await tasksApi.delete(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (error) {
      console.error("タスク削除エラー:", error)
      throw error
    }
  }

  // 下書き関連の関数
  const createDraft = async (draftData) => {
    try {
      const newDraft = await draftsApi.create(draftData)
      setDrafts((prev) => [...prev, newDraft])
      return newDraft
    } catch (error) {
      console.error("下書き作成エラー:", error)
      throw error
    }
  }

  const updateDraft = async (id, draftData) => {
    try {
      const updatedDraft = await draftsApi.update(id, draftData)
      setDrafts((prev) => prev.map((draft) => (draft.id === id ? updatedDraft : draft)))
      return updatedDraft
    } catch (error) {
      console.error("下書き更新エラー:", error)
      throw error
    }
  }

  const deleteDraft = async (id) => {
    try {
      await draftsApi.delete(id)
      setDrafts((prev) => prev.filter((draft) => draft.id !== id))
    } catch (error) {
      console.error("下書き削除エラー:", error)
      throw error
    }
  }

  const value = {
    // データ
    bigGoals,
    smallGoals,
    records,
    timerRecords,
    categories,
    tasks,
    drafts,
    loading,

    // 関数
    loadAllData,

    // カテゴリ
    createCategory,
    updateCategory,
    deleteCategory,

    // ビッグゴール
    createBigGoal,
    updateBigGoal,
    deleteBigGoal,

    // スモールゴール
    createSmallGoal,
    updateSmallGoal,
    deleteSmallGoal,
    completeSmallGoal,

    // 記録
    createRecord,
    updateRecord,
    deleteRecord,

    // タイマー記録
    createTimerRecord,

    // タスク
    createTask,
    updateTask,
    toggleTask,
    deleteTask,

    // 下書き
    createDraft,
    updateDraft,
    deleteDraft,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
