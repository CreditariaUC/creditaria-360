-- Primero eliminamos las políticas existentes para empezar desde cero
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Aseguramos que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Los administradores pueden ver todos los perfiles, los usuarios solo el suyo
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        (auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        ))
        OR
        auth.uid() = id
    );

-- Política para INSERT: Solo administradores pueden crear nuevos perfiles
-- Excepción: El trigger handle_new_user que se ejecuta con SECURITY DEFINER
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
        OR
        auth.uid() = id
    );

-- Política para UPDATE: Administradores pueden actualizar cualquier perfil, usuarios solo el suyo
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        (auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        ))
        OR
        auth.uid() = id
    )
    WITH CHECK (
        CASE
            WHEN auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') THEN true
            WHEN auth.uid() = id THEN role = (SELECT role FROM profiles WHERE id = auth.uid())
            ELSE false
        END
    );

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aseguramos que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();