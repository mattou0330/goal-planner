"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Supabaseの設定をチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Supabaseが利用できない場合の処理（デモモード）
    if (!supabase || typeof supabase.auth?.getUser !== "function" || 
        !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://demo-supabase-url.supabase.co') {
      console.log("デモモード: モックユーザーを使用しています")
      // デモ用のユーザーを設定
      const demoUser = {
        id: "demo-user-123",
        email: "demo@example.com",
        user_metadata: {
          name: "デモユーザー"
        },
        created_at: "2024-01-01T00:00:00.000Z"
      }
      setUser(demoUser)
      setLoading(false)
      return
    }

    // 初期ユーザー状態を取得
    const getInitialUser = async () => {
      try {
        // まずセッションを確認
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("セッション取得エラー:", sessionError)
          // セッションがない場合はnullユーザーに設定
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("認証初期化エラー:", err)
        // エラーの場合はデモユーザーを使用
        const demoUser = {
          id: "demo-user-123",
          email: "demo@example.com",
          user_metadata: {
            name: "デモユーザー"
          },
          created_at: "2024-01-01T00:00:00.000Z"
        }
        setUser(demoUser)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("認証状態変更:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
      setError(null)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ログイン
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || typeof supabase.auth?.signInWithPassword !== "function") {
        throw new Error("認証サービスが利用できません")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (err) {
      console.error("ログインエラー:", err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // サインアップ
  const signUp = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || typeof supabase.auth?.signUp !== "function") {
        throw new Error("認証サービスが利用できません")
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (err) {
      console.error("サインアップエラー:", err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // ログアウト
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || typeof supabase.auth?.signOut !== "function") {
        setUser(null)
        return { error: null }
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      return { error: null }
    } catch (err) {
      console.error("ログアウトエラー:", err)
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  // クイックスタート（テストアカウント作成）
  const quickStart = async () => {
    try {
      setLoading(true)
      setError(null)

      // ランダムなテストアカウントを生成
      const timestamp = Date.now()
      const testEmail = `test${timestamp}@example.com`
      const testPassword = "test123456"

      console.log("クイックスタートアカウント作成中:", testEmail)

      const { data, error } = await signUp(testEmail, testPassword)

      if (error) {
        throw error
      }

      // サインアップ後、自動的にログイン
      if (data.user && !data.user.email_confirmed_at) {
        // メール確認が必要な場合は、直接ログインを試行
        const loginResult = await signIn(testEmail, testPassword)
        if (loginResult.error) {
          throw loginResult.error
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error("クイックスタートエラー:", err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    quickStart,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
