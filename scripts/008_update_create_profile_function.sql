-- Actualizar la función create_profile para incluir el email
-- Esto permite que el ABM funcione sin necesitar privilegios de administrador

drop function if exists public.create_profile(uuid, text, text, text, text, date, text, text, text, text, text);

create or replace function public.create_profile(
  user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_document_type text,
  p_document_number text,
  p_birth_date date,
  p_phone text,
  p_address text,
  p_city text,
  p_province text,
  p_postal_code text,
  p_user_type text default 'cliente'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  -- Insertar el perfil con email
  insert into public.profiles (
    id,
    email,
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
    p_email,
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
    p_user_type
  )
  returning json_build_object(
    'id', id,
    'email', email,
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

grant execute on function public.create_profile to authenticated;
