"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context"

const TimerContext = createContext({})

export function TimerProvider({ children }) {
  const { user } = useAuth()
  const [time, setTime] = useState(25 * 60) // 25分をデフォルト
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState("pomodoro") // pomodoro, shortBreak, longBreak
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])
  const [todayStats, setTodayStats] = useState({
    totalTime: 0,
    sessions: 0,
    pomodoroCount: 0,
  })

  // タイマーページ用の追加状態（デフォルト値で初期化）
  const [isPaused, setIsPaused] = useState(false)
  const [timerType, setTimerType] = useState("pomodoro")
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [isBreakTime] = useState(false)
  const [isInitialized] = useState(true)
  const [pomodoroSession] = useState(null)
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  })

  // タイマーの実行
  useEffect(() => {
    let interval = null
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      handleSessionComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, time])

  // 今日の統計を計算
  const calculateTodayStats = useCallback(() => {
    const today = new Date().toDateString()
    const todaySessions = sessionHistory.filter((session) => new Date(session.date).toDateString() === today)

    const totalTime = todaySessions.reduce((sum, session) => sum + session.duration, 0)
    const sessions = todaySessions.length
    const pomodoroCount = todaySessions.filter((session) => session.type === "pomodoro").length

    setTodayStats({
      totalTime,
      sessions,
      pomodoroCount,
    })
  }, [sessionHistory])

  // セッション履歴が変更されたら統計を再計算
  useEffect(() => {
    calculateTodayStats()
  }, [sessionHistory, calculateTodayStats])

  // セッション完了時の処理
  const handleSessionComplete = () => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completedAt: new Date().toISOString(),
        actualDuration: currentSession.duration,
      }

      setSessionHistory((prev) => [completedSession, ...prev])

      // ブラウザ通知
      if (Notification.permission === "granted") {
        new Notification("タイマー完了！", {
          body: `${currentSession.type === "pomodoro" ? "ポモドーロ" : "休憩"}セッションが完了しました。`,
          icon: "/favicon.ico",
        })
      }
    }

    setCurrentSession(null)
  }

  // タイマー開始
  const startTimer = (duration = 25 * 60, type = "pomodoro", goalId = null) => {
    setTime(duration)
    setIsRunning(true)
    setCurrentSession({
      id: Date.now(),
      type,
      duration,
      goalId,
      startedAt: new Date().toISOString(),
      date: new Date().toDateString(),
    })

    // 通知許可をリクエスト
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  // タイマー一時停止
  const pauseTimer = () => {
    setIsRunning(false)
    setIsPaused(true)
  }

  // タイマー再開
  const resumeTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  // タイマー停止
  const stopTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (currentSession) {
      handleSessionComplete()
    }
    setCurrentSession(null)
  }

  // タイマーリセット
  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTime(25 * 60)
    setCurrentSession(null)
  }

  // タイマーページ用の追加関数（シンプル実装）
  const initializeTimer = () => {
    setTime(25 * 60)
  }

  const setLastActiveTime = () => {
    // タイマーページで必要だが、実際の処理は不要
  }

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" })
    }
  }

  // 時間フォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 今日の統計を取得
  const getTodayStats = () => {
    return todayStats
  }

  // セッション完了
  const completeSession = () => {
    if (currentSession) {
      handleSessionComplete()
    }
    resetTimer()
  }

  const value = {
    time,
    isRunning,
    isPaused,
    mode,
    timerType,
    setTimerType,
    currentSession,
    sessionHistory,
    selectedGoal,
    setSelectedGoal,
    isBreakTime,
    isInitialized,
    pomodoroSession,
    pomodoroSettings,
    setPomodoroSettings,
    todayStats,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    initializeTimer,
    setLastActiveTime,
    showNotification,
    formatTime,
    getTodayStats,
    completeSession,
    setMode,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
