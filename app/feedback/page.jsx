"use client"

import { Wrench, Sparkles } from "lucide-react"
import Sidebar from "../../components/sidebar"
import MobileHeader from "../../components/mobile-header"

export default function FeedbackPage() {
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
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              {/* アイコンとアニメーション */}
              <div className="relative mb-8">
                <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg shadow-amber-500/30">
                  <Wrench className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 animate-pulse">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              {/* メインタイトル */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                準備中です
              </h1>

              {/* 説明文 */}
              <p className="text-lg text-slate-600 font-medium mb-6 max-w-2xl leading-relaxed">
                AIコーチフィードバック機能は現在開発中です。
                <br />
                より良い体験を提供するため、鋭意開発を進めております。
              </p>

              {/* Coming Soon バッジ */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full border border-amber-200/50 font-semibold shadow-lg shadow-amber-500/10 mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                Coming Soon
              </div>

              {/* 開発状況 */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/50 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/50 p-6 backdrop-blur-sm max-w-md w-full">
                <h3 className="text-lg font-bold text-slate-700 mb-4">開発状況</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">UI設計</span>
                    <span className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                      完了
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">AI統合</span>
                    <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                      進行中
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">テスト</span>
                    <span className="text-xs bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 px-2 py-1 rounded-full font-semibold">
                      待機中
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
