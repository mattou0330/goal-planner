"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/auth-context"
import { Mail, ArrowRight, Sparkles, Target, Eye, EyeOff, AlertCircle, Info, UserPlus } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSignUp) {
        await signUp(email, password)
        setMessage("アカウントが作成されました。確認メールをご確認ください。")
        setIsSuccess(true)
      } else {
        await signIn(email, password)
        setMessage("ログインしました。")
        setIsSuccess(true)
        // 少し待ってからリダイレクト
        setTimeout(() => {
          router.push("/")
        }, 1000)
      }
    } catch (error) {
      console.error("認証エラー:", error)
      let errorMessage = "エラーが発生しました"

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "メールアドレスまたはパスワードが正しくありません"
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "メールアドレスが確認されていません。確認メールをご確認ください"
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "リクエストが多すぎます。しばらく待ってから再試行してください"
      } else if (error.message.includes("User already registered")) {
        errorMessage = "このメールアドレスは既に登録されています。ログインしてください。"
        setIsSignUp(false)
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessage(errorMessage)
      setIsSuccess(false)
    }

    setLoading(false)
  }

  const fillDemoCredentials = () => {
    setEmail("demo@gmail.com")
    setPassword("Demo@2024#Secure!")
    setMessage("デモアカウントの情報が入力されました")
    setIsSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/20 mb-4">
              <Target className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
          </div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            GoalPlanner
          </h1>
          <p className="text-slate-600 font-medium">目標達成をサポートするアプリケーション</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{isSignUp ? "アカウント作成" : "ログイン"}</h2>
            <p className="text-slate-600 font-medium">
              {isSignUp ? "新しいアカウントを作成してください" : "メールアドレスとパスワードを入力してください"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-4 pr-12 py-3 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white/50 backdrop-blur-sm font-medium"
                  placeholder="パスワードを入力（6文字以上）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg shadow-violet-500/30"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{isSignUp ? "アカウント作成" : "ログイン"}</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* デモアカウント情報 */}
          {!isSignUp && (
            <div className="mt-4">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg shadow-emerald-500/30"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                <span>デモアカウントを使用</span>
              </button>
            </div>
          )}

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                isSuccess
                  ? "bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-emerald-200/50 text-emerald-800"
                  : "bg-gradient-to-r from-red-50/80 to-pink-50/50 border-red-200/50 text-red-800"
              } backdrop-blur-sm`}
            >
              {isSuccess ? (
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {/* サインアップ/ログイン切り替え */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage("")
                setEmail("")
                setPassword("")
              }}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              {isSignUp ? "既にアカウントをお持ちですか？ログイン" : "アカウントをお持ちでない方はこちら"}
            </button>
          </div>

          {/* デモアカウント情報表示 */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-200/50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-2">デモアカウント</h3>
                <div className="text-xs text-blue-700 font-medium leading-relaxed">
                  <p className="mb-2">アプリを体験したい方は以下のデモアカウントをご利用ください：</p>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p><strong>メールアドレス:</strong> demo@gmail.com</p>
                    <p><strong>パスワード:</strong> Demo@2024#Secure!</p>
                  </div>
                  <p className="mt-2">本格的に利用する場合は、お好みのメールアドレスでアカウントを作成してください。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500 font-medium">© 2024 GoalPlanner. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
