"use client"

import { useTimer } from "../contexts/timer-context"
import { Timer, Play, Pause, Square } from "lucide-react"

export default function TimerNotification() {
  const { isRunning, currentSession, timeLeft, pauseTimer, resumeTimer, stopTimer } = useTimer()

  if (!currentSession) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "work":
        return "作業中"
      case "short-break":
        return "短い休憩"
      case "long-break":
        return "長い休憩"
      default:
        return "タイマー"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "work":
        return "from-violet-500 to-purple-600"
      case "short-break":
        return "from-emerald-500 to-teal-600"
      case "long-break":
        return "from-blue-500 to-indigo-600"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 lg:top-8 lg:right-8">
      <div className="bg-gradient-to-br from-white/95 to-slate-50/90 rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/50 p-4 backdrop-blur-sm min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-br ${getTypeColor(currentSession.type)} rounded-xl shadow-lg`}>
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{getTypeLabel(currentSession.type)}</h3>
              {currentSession.goalTitle && (
                <p className="text-xs text-slate-600 font-medium truncate max-w-[150px]">{currentSession.goalTitle}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-800 font-mono">{formatTime(timeLeft)}</div>
            <div className="text-xs text-slate-500 font-medium">残り時間</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-orange-500/30"
            >
              <Pause className="w-4 h-4" />
              一時停止
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/30"
            >
              <Play className="w-4 h-4" />
              再開
            </button>
          )}
          <button
            onClick={stopTimer}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-slate-500/30"
          >
            <Square className="w-4 h-4" />
            停止
          </button>
        </div>

        {/* プログレスバー */}
        <div className="mt-3">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getTypeColor(currentSession.type)} transition-all duration-1000`}
              style={{
                width: `${((currentSession.duration - timeLeft) / currentSession.duration) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
