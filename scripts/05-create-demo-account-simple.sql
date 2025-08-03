-- 簡易版デモアカウント作成スクリプト
-- 注意: このスクリプトはSupabase管理画面のSQL Editorで実行してください

-- デモアカウント認証情報:
-- Email: demo@gmail.com
-- Password: Demo@2024#Secure!
-- 
-- 実際の認証アカウントは手動でSupabase Auth > Usersで作成してください
-- このスクリプトはデータテーブル用のレコードのみ作成します

-- まず既存のデモデータをクリーンアップ（任意）
-- DELETE FROM users WHERE email = 'demo@gmail.com';

-- デモユーザーを作成（publicスキーマのusersテーブル）
-- 実際の認証はアプリ側でSupabase Authを使用します
INSERT INTO public.users (
  id,
  email,
  name,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@gmail.com',
  'デモユーザー',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- カテゴリを作成
INSERT INTO public.categories (id, name, user_id, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '健康', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('22222222-2222-2222-2222-222222222222', '学習', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('33333333-3333-3333-3333-333333333333', '仕事', '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT (id) DO NOTHING;

-- ビッグゴールを作成
INSERT INTO public.big_goals (
  id,
  user_id,
  title,
  description,
  category_id,
  deadline,
  status,
  is_archived,
  created_at,
  updated_at
) VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    '550e8400-e29b-41d4-a716-446655440000',
    '健康的な生活習慣を身につける',
    '毎日の運動と健康的な食事で、より良い生活習慣を作る',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE + INTERVAL '3 months',
    'active',
    false,
    NOW(),
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '550e8400-e29b-41d4-a716-446655440000',
    'TOEIC 900点取得',
    '英語力向上のため、TOEIC 900点以上を目指す',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE + INTERVAL '6 months',
    'active',
    false,
    NOW(),
    NOW()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '550e8400-e29b-41d4-a716-446655440000',
    'プロジェクト完成',
    '新しいWebアプリケーションの開発完了',
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE + INTERVAL '4 months',
    'active',
    false,
    NOW(),
    NOW()
  );

-- スモールゴールを作成
INSERT INTO public.small_goals (
  id,
  user_id,
  big_goal_id,
  title,
  description,
  target_value,
  current_value,
  unit,
  deadline,
  status,
  is_archived,
  is_completed,
  created_at,
  updated_at
) VALUES
  (
    '77777777-7777-7777-7777-777777777777',
    '550e8400-e29b-41d4-a716-446655440000',
    '44444444-4444-4444-4444-444444444444',
    '毎日30分の散歩',
    '健康維持のため毎日30分歩く',
    30,
    18,
    '日',
    CURRENT_DATE + INTERVAL '1 month',
    'active',
    false,
    false,
    NOW(),
    NOW()
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    '550e8400-e29b-41d4-a716-446655440000',
    '44444444-4444-4444-4444-444444444444',
    '週3回の筋トレ',
    '筋力向上のため週3回筋トレする',
    12,
    8,
    '回',
    CURRENT_DATE + INTERVAL '1 month',
    'active',
    false,
    false,
    NOW(),
    NOW()
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '550e8400-e29b-41d4-a716-446655440000',
    '55555555-5555-5555-5555-555555555555',
    'TOEIC単語学習',
    '毎日100単語を学習する',
    100,
    75,
    '単語/日',
    CURRENT_DATE + INTERVAL '2 months',
    'active',
    false,
    false,
    NOW(),
    NOW()
  );

-- サンプル記録を作成
INSERT INTO public.records (
  id,
  user_id,
  date,
  daily_comment,
  mood,
  energy,
  created_at,
  updated_at
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE - 1,
    '今日は調子が良かった！散歩も楽しめた。',
    'good',
    'high',
    NOW(),
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE - 2,
    '普通の一日。もう少し運動したい。',
    'neutral',
    'normal',
    NOW(),
    NOW()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '550e8400-e29b-41d4-a716-446655440000',
    CURRENT_DATE - 3,
    '最高の一日！目標に向かって順調に進んでいる。',
    'very_good',
    'very_high',
    NOW(),
    NOW()
  );

-- サンプルタスクを作成
INSERT INTO public.tasks (
  id,
  user_id,
  text,
  completed,
  order_index,
  is_archived,
  created_at,
  updated_at
) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '550e8400-e29b-41d4-a716-446655440000',
    '朝のストレッチをする',
    false,
    0,
    false,
    NOW(),
    NOW()
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '550e8400-e29b-41d4-a716-446655440000',
    '健康的な朝食を作る',
    true,
    1,
    false,
    NOW(),
    NOW()
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '550e8400-e29b-41d4-a716-446655440000',
    '今日の目標を確認する',
    false,
    2,
    false,
    NOW(),
    NOW()
  );

-- タイマー記録のサンプルデータ
INSERT INTO public.timer_records (
  id,
  user_id,
  small_goal_id,
  type,
  duration,
  date,
  is_break_time,
  comment,
  created_at
) VALUES
  (
    '10101010-1010-1010-1010-101010101010',
    '550e8400-e29b-41d4-a716-446655440000',
    '99999999-9999-9999-9999-999999999999',
    'pomodoro',
    1500,
    CURRENT_DATE,
    false,
    'TOEIC単語学習セッション',
    NOW()
  ),
  (
    '20202020-2020-2020-2020-202020202020',
    '550e8400-e29b-41d4-a716-446655440000',
    '77777777-7777-7777-7777-777777777777',
    'custom',
    1800,
    CURRENT_DATE - 1,
    false,
    '散歩タイム',
    NOW()
  );

-- 成功メッセージ
SELECT 'デモアカウントとサンプルデータが正常に作成されました。' AS result;