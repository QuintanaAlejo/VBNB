-- Script para eliminar todas las políticas RLS problemáticas y crear políticas simples
-- Este script resuelve el error de recursión infinita

-- Eliminar TODAS las políticas existentes en la tabla profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Crear políticas simples sin recursión
-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "users_can_view_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "users_can_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- La inserción se maneja a través de la función create_profile con SECURITY DEFINER
-- No necesitamos política de INSERT porque la función tiene privilegios elevados

-- Verificar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Comentario: Estas políticas simples permiten que cada usuario vea y edite solo su propio perfil
-- No hay recursión porque no hacemos queries adicionales a la tabla profiles dentro de las políticas
