"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../contexts/auth-context"
import { Home, Target, Clock, BookOpen, BarChart3, LogOut, Menu, X, User, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  const menuItems = [
    { icon: Home, label: "ダッシュボード", href: "/" },
    { icon: Target, label: "目標管理", href: "/goals" },
    { icon: Clock, label: "タイマー", href: "/timer" },
    { icon: BookOpen, label: "記録", href: "/records" },
    { icon: BarChart3, label: "統計", href: "/data" },
    { icon: MessageSquare, label: "フィードバック", href: "/feedback" },
  ]

  return (
    <>
      {/* デスクトップサイドバー */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 transition-all duration-300 ${
          isCollapsed ? "lg:w-16" : "lg:w-64"
        }`}
      >
        <div className="flex flex-col flex-1 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">GoalPlanner</h1>
                  <p className="text-xs text-slate-400 font-medium">目標達成アプリ</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* ユーザー情報 */}
          {!isCollapsed && user && (
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 font-medium">ログイン中</p>
                </div>
              </div>
            </div>
          )}

          {/* メニュー */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-white shadow-lg shadow-violet-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? "text-violet-400" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!isCollapsed && <span className={`font-medium ${isActive ? "text-white" : ""}`}>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* フッター */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors duration-200" />
              {!isCollapsed && <span className="font-medium">ログアウト</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
