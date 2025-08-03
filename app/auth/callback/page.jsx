"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("認証コールバックエラー:", error)
          router.push("/auth/login?error=callback_error")
          return
        }

        if (data.session) {
          // 認証成功、ダッシュボードにリダイレクト
          router.push("/")
        } else {
          // セッションがない場合はログインページへ
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("認証処理エラー:", error)
        router.push("/auth/login?error=unexpected_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">認証処理中...</h2>
        <p className="text-slate-600">しばらくお待ちください</p>
      </div>
    </div>
  )
}
