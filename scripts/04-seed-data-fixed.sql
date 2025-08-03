-- サンプルデータの挿入（開発用）
-- 注意: 本番環境では実行しないでください

-- サンプルユーザー（実際の認証では auth.users テーブルから自動作成されます）
INSERT INTO users (id, email, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@gmail.com', 'デモユーザー');

-- カテゴリは自動作成されるので、既存のものを使用

-- サンプルビッグゴール
INSERT INTO big_goals (user_id, title, description, category_id, deadline, status, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '東京マラソン完走！', '2025年の東京マラソンで完走を目指す', 
   (SELECT id FROM categories WHERE name = '健康' AND user_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1), 
   '2025-07-20', 'active', '/placeholder.svg?height=200&width=300&text=マラソン完走'),
  ('550e8400-e29b-41d4-a716-446655440000', 'TOEIC 900点取得', '英語力向上のため、TOEIC 900点以上を目指す', 
   (SELECT id FROM categories WHERE name = '学習' AND user_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1), 
   '2025-07-20', 'active', '/placeholder.svg?height=200&width=300&text=TOEIC900点'),
  ('550e8400-e29b-41d4-a716-446655440000', 'プロジェクト完成', '新しいWebアプリケーションの開発完了', 
   (SELECT id FROM categories WHERE name = '仕事' AND user_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1), 
   '2025-06-30', 'active', '/placeholder.svg?height=200&width=300&text=プロジェクト完成');

-- サンプルスモールゴール
INSERT INTO small_goals (user_id, big_goal_id, title, description, target_value, current_value, unit, deadline) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM big_goals WHERE title = '東京マラソン完走！' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   '30キロ走る', 'マラソン完走に向けた長距離練習', 30, 25, 'km', '2025-01-30'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM big_goals WHERE title = '東京マラソン完走！' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   '週3回ランニング', '継続的なランニング習慣の確立', 12, 8, '回', '2025-02-28'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM big_goals WHERE title = 'TOEIC 900点取得' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   '単語帳2周目完了', 'TOEIC対策の基礎単語を覚える', 2, 2, '周', '2025-01-25'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM big_goals WHERE title = 'TOEIC 900点取得' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'リスニング練習', '毎日30分のリスニング練習', 30, 18, '日', '2025-02-15'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM big_goals WHERE title = 'プロジェクト完成' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'UI設計完了', 'ユーザーインターフェースの設計', 1, 0, '個', '2025-02-28');

-- サンプル記録
INSERT INTO records (user_id, date, daily_comment, mood, energy) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2025-01-15', '今日は調子が良かった！ランニングも順調に進んだ。', 'good', 'high'),
  ('550e8400-e29b-41d4-a716-446655440000', '2025-01-14', '少し疲れ気味だったが、英語学習は継続できた。', 'neutral', 'normal'),
  ('550e8400-e29b-41d4-a716-446655440000', '2025-01-13', '素晴らしい一日！全ての目標を達成できた。', 'very_good', 'very_high');

-- サンプル記録の目標達成
INSERT INTO record_goals (record_id, goal_title, value, unit, comment) VALUES
  ((SELECT id FROM records WHERE date = '2025-01-15' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'ランニング', 5, 'km', '公園を5km走った'),
  ((SELECT id FROM records WHERE date = '2025-01-15' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   '英単語学習', 50, '語', '新しい単語を50個覚えた'),
  ((SELECT id FROM records WHERE date = '2025-01-14' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'TOEIC問題集', 2, 'セット', 'リスニング問題を2セット解いた'),
  ((SELECT id FROM records WHERE date = '2025-01-13' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'ランニング', 8, 'km', '長距離ランニング練習'),
  ((SELECT id FROM records WHERE date = '2025-01-13' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'プログラミング', 3, '時間', 'プロジェクトのコーディング');

-- サンプルタイマー記録
INSERT INTO timer_records (user_id, small_goal_id, type, duration, date, comment) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM small_goals WHERE title = 'リスニング練習' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'pomodoro', 1500, '2025-01-15', 'TOEIC リスニング集中練習'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM small_goals WHERE title = 'UI設計完了' AND user_id = '550e8400-e29b-41d4-a716-446655440000'), 
   'custom', 3600, '2025-01-14', 'プロジェクトのUI設計作業'),
  ('550e8400-e29b-41d4-a716-446655440000', 
   NULL, 
   'pomodoro', 1500, '2025-01-13', '一般的な集中作業');

-- サンプルタスク
INSERT INTO tasks (user_id, text, completed, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'ランニングシューズを購入する', true, 1),
  ('550e8400-e29b-41d4-a716-446655440000', 'TOEIC参考書を注文する', true, 2),
  ('550e8400-e29b-41d4-a716-446655440000', 'プロジェクトの要件定義書を作成する', false, 3),
  ('550e8400-e29b-41d4-a716-446655440000', '健康診断の予約を取る', false, 4),
  ('550e8400-e29b-41d4-a716-446655440000', '英会話レッスンの体験予約', false, 5);
