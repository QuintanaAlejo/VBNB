-- User Story 1 & 2: Fix para permitir la creación de perfiles durante el registro
-- Crear una función segura para insertar perfiles durante el registro

-- Primero, eliminar las políticas existentes que causan conflicto
drop policy if exists "profiles_insert_own" on public.profiles;

-- Crear una función con privilegios elevados para crear perfiles
create or replace function public.create_profile(
  user_id uuid,
  p_first_name text,
  p_last_name text,
  p_document_type text,
  p_document_number text,
  p_birth_date date,
  p_phone text,
  p_address text,
  p_city text,
  p_province text,
  p_postal_code text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  -- Verificar que el usuario que llama es el mismo que se está creando
  if auth.uid() != user_id then
    raise exception 'No autorizado para crear este perfil';
  end if;

  -- Insertar el perfil
  insert into public.profiles (
    id,
    first_name,
    last_name,
    document_type,
    document_number,
    birth_date,
    phone,
    address,
    city,
    province,
    postal_code,
    user_type
  ) values (
    user_id,
    p_first_name,
    p_last_name,
    p_document_type,
    p_document_number,
    p_birth_date,
    p_phone,
    p_address,
    p_city,
    p_province,
    p_postal_code,
    'cliente'
  )
  returning json_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'user_type', user_type
  ) into result;

  return result;
exception
  when others then
    raise exception 'Error al crear perfil: %', sqlerrm;
end;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
grant execute on function public.create_profile to authenticated;

-- Crear una política más permisiva para INSERT que permita la creación inicial
create policy "profiles_insert_authenticated"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Comentario: Esta política permite que cualquier usuario autenticado inserte su propio perfil
-- La función create_profile proporciona una capa adicional de seguridad
