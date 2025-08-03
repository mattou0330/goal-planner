-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE big_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_drafts ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);

-- カテゴリテーブルのポリシー
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- ビッグゴールテーブルのポリシー
CREATE POLICY "Users can view own big goals" ON big_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own big goals" ON big_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own big goals" ON big_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own big goals" ON big_goals
  FOR DELETE USING (auth.uid() = user_id);

-- スモールゴールテーブルのポリシー
CREATE POLICY "Users can view own small goals" ON small_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own small goals" ON small_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own small goals" ON small_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own small goals" ON small_goals
  FOR DELETE USING (auth.uid() = user_id);

-- 記録テーブルのポリシー
CREATE POLICY "Users can view own records" ON records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON records
  FOR DELETE USING (auth.uid() = user_id);

-- 記録の目標達成テーブルのポリシー
CREATE POLICY "Users can view own record goals" ON record_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM records 
      WHERE records.id = record_goals.record_id 
      AND records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own record goals" ON record_goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM records 
      WHERE records.id = record_goals.record_id 
      AND records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own record goals" ON record_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM records 
      WHERE records.id = record_goals.record_id 
      AND records.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own record goals" ON record_goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM records 
      WHERE records.id = record_goals.record_id 
      AND records.user_id = auth.uid()
    )
  );

-- タイマー記録テーブルのポリシー
CREATE POLICY "Users can view own timer records" ON timer_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timer records" ON timer_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timer records" ON timer_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timer records" ON timer_records
  FOR DELETE USING (auth.uid() = user_id);

-- タスクテーブルのポリシー
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 下書きテーブルのポリシー
CREATE POLICY "Users can view own drafts" ON record_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON record_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON record_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON record_drafts
  FOR DELETE USING (auth.uid() = user_id);
