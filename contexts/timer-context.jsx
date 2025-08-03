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
  }

  // タイマー再開
  const resumeTimer = () => {
    setIsRunning(true)
  }

  // タイマーリセット
  const resetTimer = () => {
    setIsRunning(false)
    setTime(25 * 60)
    setCurrentSession(null)
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
    mode,
    currentSession,
    sessionHistory,
    todayStats,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
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
