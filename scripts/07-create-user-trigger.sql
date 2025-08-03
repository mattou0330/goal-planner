-- 新しいユーザーが認証システムに登録されたときに、public.usersテーブルにもレコードを作成するトリガー

-- トリガー関数を作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 既存の認証済みユーザーをpublic.usersに追加（重複を避ける）
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  id,
  email,
  created_at,
  created_at as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);