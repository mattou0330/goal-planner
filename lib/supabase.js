import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ビルド時やサーバーサイドでの環境変数チェックを緩和
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
} else {
  // ビルド時やテスト環境用のダミークライアント
  console.warn("Supabase environment variables not found. Using mock client.")
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      update: () => ({
        eq: () => ({ select: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  }
}

export { supabase }

// 認証されたユーザーIDを取得するヘルパー関数
async function getUserId() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.user?.id) {
    throw new Error("認証が必要です。ログインしてください。")
  }
  
  return session.user.id
}

// リトライ機能付きのAPI呼び出し
const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`API呼び出し失敗 (試行 ${i + 1}/${maxRetries}):`, error.message)

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

// バッチ処理用のヘルパー
const batchProcess = async (items, batchSize = 10, processor) => {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(batch.map(processor))
    results.push(...batchResults)
  }
  return results
}

// データベース操作のヘルパー関数

// ビッグゴール関連
export const bigGoalsApi = {
  // 全てのビッグゴールを取得（最適化版）
  async getAll() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("big_goals")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // ビッグゴールを作成
  async create(goalData) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const userId = await getUserId()
      console.log("ユーザーID取得成功:", userId)
      
      const insertData = {
        ...goalData,
        user_id: userId,
      }
      console.log("挿入データ:", insertData)
      
      const { data, error } = await supabase
        .from("big_goals")
        .insert([insertData])
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      console.log("Supabase挿入結果:", { data, error })
      
      if (error) {
        console.error("Supabaseエラー詳細:", error)
        throw new Error(`Database error: ${error.message || JSON.stringify(error)}`)
      }
      
      return data
    })
  },

  // ビッグゴールを更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("big_goals")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // ビッグゴールを削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("big_goals").delete().eq("id", id)

      if (error) throw error
    })
  },

  // アーカイブ
  async archive(id) {
    return this.update(id, { is_archived: true })
  },

  // 復元
  async restore(id) {
    return this.update(id, { is_archived: false })
  },

  // 複数のビッグゴールを一括取得
  async getByIds(ids) {
    if (!ids.length || !supabaseUrl || !supabaseAnonKey) return []

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("big_goals")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .in("id", ids)
        .eq("is_archived", false)

      if (error) throw error
      return data || []
    })
  },
}

// スモールゴール関連
export const smallGoalsApi = {
  // 全てのスモールゴールを取得（最適化版）
  async getAll() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("small_goals")
        .select(`
          *,
          big_goals (
            id,
            title,
            categories (
              id,
              name
            )
          )
        `)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // スモールゴールを作成
  async create(goalData) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("small_goals")
        .insert([
          {
            ...goalData,
            user_id: await getUserId(),
          },
        ])
        .select(`
          *,
          big_goals (
            id,
            title,
            categories (
              id,
              name
            )
          )
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // スモールゴールを更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("small_goals")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          big_goals (
            id,
            title,
            categories (
              id,
              name
            )
          )
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // 進捗を更新
  async updateProgress(id, newValue) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data: goal } = await supabase.from("small_goals").select("target_value").eq("id", id).single()

      const isCompleted = newValue >= goal.target_value

      return this.update(id, {
        current_value: newValue,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        status: isCompleted ? "completed" : "active",
      })
    })
  },

  // ビッグゴール別のスモールゴールを取得
  async getByBigGoalId(bigGoalId) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("small_goals")
        .select(`
          *,
          big_goals (
            id,
            title
          )
        `)
        .eq("big_goal_id", bigGoalId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // 複数のスモールゴールを一括更新
  async batchUpdate(updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const results = await batchProcess(updates, 5, async (update) => {
        return this.update(update.id, update.data)
      })

      return results
    })
  },
}

// カテゴリ関連
export const categoriesApi = {
  // 全てのカテゴリを取得
  async getAll() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      return data || []
    })
  },

  // カテゴリを作成
  async create(name) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name,
            user_id: await getUserId(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  // カテゴリを更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    })
  },

  // カテゴリを削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error
    })
  },
}

// 記録関連
export const recordsApi = {
  // 記録を取得（月別）- 最適化版
  async getByMonth(year, month) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`

      const { data, error } = await supabase
        .from("records")
        .select(`
          *,
          record_goals (*)
        `)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // 記録を作成
  async create(recordData) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { goals, ...mainRecord } = recordData

      // メイン記録を作成
      const { data: record, error: recordError } = await supabase
        .from("records")
        .insert([
          {
            ...mainRecord,
            user_id: await getUserId(),
          },
        ])
        .select()
        .single()

      if (recordError) throw recordError

      // 目標達成記録を作成
      if (goals && goals.length > 0) {
        const goalRecords = goals.map((goal) => ({
          record_id: record.id,
          goal_title: goal.goal,
          value: goal.value,
          unit: goal.unit,
          comment: goal.comment,
        }))

        const { error: goalsError } = await supabase.from("record_goals").insert(goalRecords)

        if (goalsError) throw goalsError
      }

      return record
    })
  },

  // 記録を更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("records")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          record_goals (*)
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // 記録を削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("records").delete().eq("id", id)

      if (error) throw error
    })
  },

  // 期間別の記録を取得
  async getByDateRange(startDate, endDate) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("records")
        .select(`
          *,
          record_goals (*)
        `)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // 統計データを取得
  async getStats(year, month) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`

      const { data, error } = await supabase
        .from("records")
        .select("date, mood, energy, daily_comment")
        .gte("date", startDate)
        .lte("date", endDate)

      if (error) throw error
      return data || []
    })
  },
}

// タイマー記録関連
export const timerRecordsApi = {
  // 日別のタイマー記録を取得
  async getByDate(date) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("timer_records")
        .select(`
          *,
          small_goals (
            id,
            title,
            big_goals (
              id,
              title
            )
          )
        `)
        .eq("user_id", await getUserId())
        .eq("date", date)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // タイマー記録を作成
  async create(recordData) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("timer_records")
        .insert([
          {
            ...recordData,
            user_id: await getUserId(),
          },
        ])
        .select(`
          *,
          small_goals (
            id,
            title,
            big_goals (
              id,
              title
            )
          )
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // タイマー記録を更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("timer_records")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          small_goals (
            id,
            title
          )
        `)
        .single()

      if (error) throw error
      return data
    })
  },

  // タイマー記録を削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("timer_records").delete().eq("id", id)

      if (error) throw error
    })
  },

  // 月別統計を取得
  async getMonthlyStats(year, month) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("Supabase設定なし - 空配列を返します")
      return []
    }

    return withRetry(async () => {
      console.log(`タイマー統計取得開始: ${year}年${month}月`)
      
      try {
        const userId = await getUserId()
        console.log("タイマー統計用ユーザーID取得成功:", userId)
        
        const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
        const endDate = `${year}-${month.toString().padStart(2, "0")}-31`
        console.log("日付範囲:", startDate, "から", endDate)

        const { data, error } = await supabase
          .from("timer_records")
          .select("duration, type, date, small_goal_id")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)

        console.log("タイマー統計クエリ結果:", { data, error })

        if (error) {
          console.error("タイマー統計Supabaseエラー:", error)
          throw new Error(`Timer records query failed: ${error.message || JSON.stringify(error)}`)
        }
        
        console.log("タイマー統計取得成功:", data?.length || 0, "件")
        return data || []
      } catch (err) {
        console.error("タイマー統計取得エラー詳細:", err)
        throw err
      }
    })
  },

  // 期間別の統計を取得
  async getStatsByDateRange(startDate, endDate) {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("timer_records")
        .select("duration, type, date, small_goal_id")
        .eq("user_id", await getUserId())
        .gte("date", startDate)
        .lte("date", endDate)

      if (error) throw error
      return data || []
    })
  },

  // 複数日のタイマー記録を一括取得
  async getByDates(dates) {
    if (!dates.length || !supabaseUrl || !supabaseAnonKey) return []

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("timer_records")
        .select(`
          *,
          small_goals (
            id,
            title
          )
        `)
        .eq("user_id", await getUserId())
        .in("date", dates)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },
}

// タスク関連
export const tasksApi = {
  // 全てのタスクを取得
  async getAll() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_archived", false).order("order_index")

      if (error) throw error
      return data || []
    })
  },

  // タスクを作成
  async create(text) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            text,
            user_id: await getUserId(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  // タスクを更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    })
  },

  // タスクの順序を更新
  async updateOrder(tasks) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const updates = tasks.map((task, index) => ({
        id: task.id,
        order_index: index,
      }))

      const { error } = await supabase.from("tasks").upsert(updates)

      if (error) throw error
    })
  },

  // タスクを削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error
    })
  },
}

// 下書き関連
export const draftsApi = {
  // 全ての下書きを取得
  async getAll() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("record_drafts").select("*").order("updated_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  },

  // 下書きを作成
  async create(draftData) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase
        .from("record_drafts")
        .insert([
          {
            ...draftData,
            user_id: await getUserId(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  // 下書きを更新
  async update(id, updates) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("record_drafts").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    })
  },

  // 下書きを削除
  async delete(id) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase not configured")
    }

    return withRetry(async () => {
      const { error } = await supabase.from("record_drafts").delete().eq("id", id)

      if (error) throw error
    })
  },
}

// ヘルスチェック
export const healthApi = {
  // データベース接続をテスト
  async checkConnection() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { status: "error", message: "Supabase not configured", timestamp: new Date().toISOString() }
    }

    return withRetry(async () => {
      const { data, error } = await supabase.from("categories").select("count").limit(1)

      if (error) throw error
      return { status: "ok", timestamp: new Date().toISOString() }
    })
  },

  // ユーザーのデータ統計を取得
  async getUserStats() {
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        bigGoals: 0,
        smallGoals: 0,
        records: 0,
        timerRecords: 0,
      }
    }

    return withRetry(async () => {
      const userId = await getUserId()

      const [bigGoalsCount, smallGoalsCount, recordsCount, timerRecordsCount] = await Promise.all([
        supabase.from("big_goals").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("small_goals").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("records").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("timer_records").select("id", { count: "exact" }).eq("user_id", userId),
      ])

      return {
        bigGoals: bigGoalsCount.count || 0,
        smallGoals: smallGoalsCount.count || 0,
        records: recordsCount.count || 0,
        timerRecords: timerRecordsCount.count || 0,
      }
    })
  },
}
