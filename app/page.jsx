"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { useData } from "../contexts/data-context"
import { useTimer } from "../contexts/timer-context"
import AuthGuard from "../components/auth-guard"
import Sidebar from "../components/sidebar"
import MobileHeader from "../components/mobile-header"
import { BarChart3 } from "lucide-react"
import Link from "next/link"

// ダッシュボードコンポーネント
function Dashboard() {
  const { user } = useAuth()
  const { bigGoals, smallGoals, records, loading: dataLoading } = useData()
  const { getTodayStats } = useTimer()
  const [timerStats, setTimerStats] = useState({ totalTime: 0, sessions: 0 })

  useEffect(() => {
    const loadTimerStats = async () => {
      try {
        const stats = await getTodayStats()
        setTimerStats(stats || { totalTime: 0, sessions: 0 })
      } catch (error) {
        console.error("タイマー統計の取得に失敗:", error)
        setTimerStats({ totalTime: 0, sessions: 0 })
      }
    }

    loadTimerStats()
  }, [getTodayStats])

  // 統計データの計算
  const stats = {
    totalBigGoals: Array.isArray(bigGoals) ? bigGoals.length : 0,
    completedBigGoals: Array.isArray(bigGoals) ? bigGoals.filter((goal) => goal?.is_completed).length : 0,
    totalSmallGoals: Array.isArray(smallGoals) ? smallGoals.length : 0,
    completedSmallGoals: Array.isArray(smallGoals) ? smallGoals.filter((goal) => goal?.is_completed).length : 0,
    totalRecords: Array.isArray(records) ? records.length : 0,
    todayTimerTime: timerStats?.totalTime || 0,
    todayTimerSessions: timerStats?.sessions || 0,
  }

  // 時間を分に変換
  const formatTime = (seconds) => {
    const minutes = Math.floor((seconds || 0) / 60)
    return `${minutes}分`
  }

  // 進捗率の計算
  const bigGoalProgress = stats.totalBigGoals > 0 ? (stats.completedBigGoals / stats.totalBigGoals) * 100 : 0
  const smallGoalProgress = stats.totalSmallGoals > 0 ? (stats.completedSmallGoals / stats.totalSmallGoals) * 100 : 0

  if (dataLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">データを読み込み中...</p>
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
          <div className="max-w-7xl mx-auto">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-violet-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ダッシュボード
                  </h1>
                  <p className="text-slate-600 font-medium">
                    こんにちは、{user?.email || "ユーザー"}さん！今日も目標に向かって頑張りましょう。
                  </p>
                </div>
              </div>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {/* ビッグゴール統計 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">ビッグゴール</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.completedBigGoals}/{stats.totalBigGoals}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${bigGoalProgress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{Math.round(bigGoalProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* スモールゴール統計 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">スモールゴール</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.completedSmallGoals}/{stats.totalSmallGoals}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${smallGoalProgress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{Math.round(smallGoalProgress)}%</span>
                  </div>
                </div>
              </div>

              {/* 記録統計 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">記録数</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">今月の振り返り記録</p>
                </div>
              </div>

              {/* タイマー統計 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">今日の作業時間</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatTime(stats.todayTimerTime)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{stats.todayTimerSessions}セッション完了</p>
                </div>
              </div>
            </div>

            {/* 最近のアクティビティ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* 最近のビッグゴール */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 backdrop-blur-sm">
                <div className="p-4 lg:p-6 border-b border-slate-200/50">
                  <h3 className="text-lg font-bold text-slate-700">最近のビッグゴール</h3>
                </div>
                <div className="p-4 lg:p-6">
                  {Array.isArray(bigGoals) && bigGoals.length > 0 ? (
                    <div className="space-y-4">
                      {bigGoals.slice(0, 3).map((goal) => (
                        <div key={goal?.id || Math.random()} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{goal?.title || "無題のゴール"}</p>
                            <p className="text-sm text-gray-500">{goal?.categories?.name || "カテゴリなし"}</p>
                          </div>
                          <div className="flex items-center">
                            {goal?.is_completed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                完了
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                進行中
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">まだビッグゴールがありません</p>
                  )}
                </div>
              </div>

              {/* 最近のスモールゴール */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 backdrop-blur-sm">
                <div className="p-4 lg:p-6 border-b border-slate-200/50">
                  <h3 className="text-lg font-bold text-slate-700">最近のスモールゴール</h3>
                </div>
                <div className="p-4 lg:p-6">
                  {Array.isArray(smallGoals) && smallGoals.length > 0 ? (
                    <div className="space-y-4">
                      {smallGoals.slice(0, 3).map((goal) => (
                        <div key={goal?.id || Math.random()} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{goal?.title || "無題のゴール"}</p>
                            <div className="flex items-center mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{
                                    width: `${goal?.target_value > 0 ? (goal?.current_value / goal?.target_value) * 100 : 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {goal?.current_value || 0}/{goal?.target_value || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">まだスモールゴールがありません</p>
                  )}
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-6">クイックアクション</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/goals"
                  className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">新しい目標を作成</p>
                      <p className="text-sm text-gray-500">ビッグゴールやスモールゴールを追加</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/timer"
                  className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">タイマーを開始</p>
                      <p className="text-sm text-gray-500">ポモドーロタイマーで集中</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/records"
                  className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">記録を追加</p>
                      <p className="text-sm text-gray-500">今日の振り返りを記録</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
