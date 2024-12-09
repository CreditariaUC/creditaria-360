-- Primero eliminamos las políticas existentes
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Aseguramos que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Nueva política para SELECT: Todos los usuarios autenticados pueden ver todos los perfiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );

-- Política para INSERT: Solo el propio usuario puede insertar su perfil
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Política para UPDATE: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = id
    );