-- Script para agregar políticas RLS que permitan operaciones de administración
-- Esto permite que los desarrolladores puedan administrar usuarios desde la interfaz

-- Crear una política que permita a cualquier usuario autenticado ver todos los perfiles
-- (En producción, esto debería estar restringido solo a administradores)
CREATE POLICY "admin_can_view_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Permitir a cualquier usuario autenticado actualizar cualquier perfil
-- (En producción, esto debería estar restringido solo a administradores)
CREATE POLICY "admin_can_update_all_profiles"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Permitir a cualquier usuario autenticado eliminar cualquier perfil
-- (En producción, esto debería estar restringido solo a administradores)
CREATE POLICY "admin_can_delete_all_profiles"
  ON public.profiles
  FOR DELETE
  USING (true);

-- Nota: Estas políticas son muy permisivas y están diseñadas para desarrollo/demo
-- En un entorno de producción, deberías verificar que el usuario sea un administrador
-- Por ejemplo: WHERE user_type = 'administrador' AND auth.uid() = id
