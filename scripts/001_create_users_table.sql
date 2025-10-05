-- User Story 1: Implementar la base de datos para almacenar usuarios
-- Crear tabla de perfiles de usuarios que extiende auth.users de Supabase

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  
  -- Datos personales básicos
  first_name text not null,
  last_name text not null,
  document_type text not null check (document_type in ('DNI', 'CUIT', 'CUIL', 'Pasaporte')),
  document_number text not null unique,
  birth_date date not null,
  phone text not null,
  
  -- Dirección
  address text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  
  -- Tipo de usuario
  user_type text not null default 'cliente' check (user_type in ('cliente', 'empleado', 'administrador')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar Row Level Security
alter table public.profiles enable row level security;

-- Políticas RLS: Los usuarios pueden ver y modificar solo su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Los empleados y administradores pueden ver todos los perfiles
create policy "profiles_select_staff"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and user_type in ('empleado', 'administrador')
    )
  );

-- Crear índices para mejorar el rendimiento
create index if not exists profiles_document_number_idx on public.profiles(document_number);
create index if not exists profiles_user_type_idx on public.profiles(user_type);

-- Función para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger para actualizar updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
