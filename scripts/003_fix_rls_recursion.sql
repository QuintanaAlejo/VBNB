-- Arreglar el problema de recursión infinita en las políticas RLS
-- El problema está en la política profiles_select_staff que hace query a la misma tabla

-- Eliminar la política problemática
drop policy if exists "profiles_select_staff" on public.profiles;

-- Por ahora, para el Sprint 0 (solo clientes), no necesitamos políticas para staff
-- Las políticas para empleados y administradores se agregarán en sprints futuros

-- Verificar que las políticas básicas estén correctas
-- Los usuarios solo pueden ver y modificar su propio perfil
