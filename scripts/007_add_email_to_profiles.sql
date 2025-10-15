-- Agregar campo email a la tabla profiles para evitar necesitar privilegios de admin
-- Esto permite que el ABM funcione sin acceso a auth.users

alter table public.profiles
add column if not exists email text unique;

-- Crear índice para el email
create index if not exists profiles_email_idx on public.profiles(email);

-- Actualizar los perfiles existentes con sus emails desde auth.users
-- Nota: Este UPDATE solo funcionará si tienes acceso de admin temporalmente
-- Si no, los emails se agregarán cuando los usuarios inicien sesión
update public.profiles p
set email = (
  select email from auth.users u where u.id = p.id
)
where email is null;
