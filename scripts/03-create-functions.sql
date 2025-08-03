-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーを作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_big_goals_updated_at BEFORE UPDATE ON big_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_small_goals_updated_at BEFORE UPDATE ON small_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_record_drafts_updated_at BEFORE UPDATE ON record_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ユーザー作成時にデフォルトカテゴリを作成する関数
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name) VALUES
    (NEW.id, '学習'),
    (NEW.id, '健康'),
    (NEW.id, '仕事'),
    (NEW.id, '自己啓発'),
    (NEW.id, '趣味'),
    (NEW.id, 'その他');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ユーザー作成時のトリガー
CREATE TRIGGER create_user_default_categories
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();
