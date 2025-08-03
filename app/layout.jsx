import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/auth-context"
import { DataProvider } from "../contexts/data-context"
import { TimerProvider } from "../contexts/timer-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ゴールプランナー",
  description: "目標達成をサポートするアプリケーション",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            <TimerProvider>{children}</TimerProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
