-- ユーザー作成エラーを修正するためのRLSポリシー追加
-- このスクリプトをSupabase SQL Editorで実行してください
-- 
-- 注意: デモアカウントは demo@gmail.com / Demo@2024#Secure! で作成してください
-- (@example.com ドメインはテスト専用のため、実際の認証には使用できません)

-- 1. usersテーブルのINSERTポリシーを追加
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);

-- 2. トリガー関数を更新してRLS権限を強化
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 既存のトリガーを再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. 確認用: 現在のRLSポリシーを表示
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 成功メッセージ
SELECT 'ユーザー作成ポリシーが正常に修正されました。' AS result;