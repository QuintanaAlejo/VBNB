-- Crear tabla de pólizas
create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Premium', 'Elite', 'Básica')),
  category text not null check (category in ('Automóvil', 'Vivienda', 'Persona')),
  description text not null,
  coverage text not null,
  monthly_price numeric(10, 2) not null,
  quarterly_price numeric(10, 2) not null,
  annual_price numeric(10, 2) not null,
  franchise numeric(10, 2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Crear tabla de relación entre usuarios y pólizas
create table if not exists public.user_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_id uuid not null references public.policies(id) on delete cascade,
  status text not null default 'activa' check (status in ('activa', 'suspendida', 'cancelada')),
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  payment_frequency text not null default 'mensual' check (payment_frequency in ('mensual', 'trimestral', 'anual')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, policy_id)
);

-- Habilitar RLS
alter table public.policies enable row level security;
alter table public.user_policies enable row level security;

-- Políticas RLS para policies (todos pueden ver las pólizas disponibles)
create policy "policies_select_all"
  on public.policies for select
  using (true);

-- Políticas RLS para user_policies (los usuarios solo pueden ver sus propias pólizas)
create policy "user_policies_select_own"
  on public.user_policies for select
  using (auth.uid() = user_id);

create policy "user_policies_insert_own"
  on public.user_policies for insert
  with check (auth.uid() = user_id);

create policy "user_policies_update_own"
  on public.user_policies for update
  using (auth.uid() = user_id);

-- Insertar pólizas ficticias

-- Pólizas de Automóvil
insert into public.policies (name, type, category, description, coverage, monthly_price, quarterly_price, annual_price, franchise) values
('Auto Premium', 'Premium', 'Automóvil', 'Cobertura completa para tu vehículo con asistencia 24/7', 'Todo riesgo, robo, incendio, daños a terceros, granizo, inundación, asistencia mecánica', 15000, 42000, 150000, 50000),
('Auto Elite', 'Elite', 'Automóvil', 'Cobertura amplia con excelente relación precio-calidad', 'Todo riesgo, robo, incendio, daños a terceros, granizo, asistencia mecánica', 10000, 28000, 100000, 80000),
('Auto Básica', 'Básica', 'Automóvil', 'Cobertura esencial para tu vehículo', 'Responsabilidad civil, robo e incendio', 6000, 16800, 60000, 120000);

-- Pólizas de Vivienda
insert into public.policies (name, type, category, description, coverage, monthly_price, quarterly_price, annual_price, franchise) values
('Hogar Premium', 'Premium', 'Vivienda', 'Protección total para tu hogar y contenido', 'Incendio, robo, daños por agua, fenómenos naturales, responsabilidad civil, cristales', 8000, 22400, 80000, 30000),
('Hogar Elite', 'Elite', 'Vivienda', 'Cobertura completa para tu vivienda', 'Incendio, robo, daños por agua, fenómenos naturales, responsabilidad civil', 5500, 15400, 55000, 50000),
('Hogar Básica', 'Básica', 'Vivienda', 'Protección básica para tu hogar', 'Incendio, robo, responsabilidad civil', 3500, 9800, 35000, 80000);

-- Pólizas de Persona
insert into public.policies (name, type, category, description, coverage, monthly_price, quarterly_price, annual_price, franchise) values
('Vida Premium', 'Premium', 'Persona', 'Cobertura integral de vida y salud', 'Muerte, invalidez total y parcial, enfermedades graves, internación, cirugías', 12000, 33600, 120000, 20000),
('Vida Elite', 'Elite', 'Persona', 'Protección completa para vos y tu familia', 'Muerte, invalidez total y parcial, enfermedades graves, internación', 8000, 22400, 80000, 40000),
('Vida Básica', 'Básica', 'Persona', 'Cobertura esencial de vida', 'Muerte, invalidez total', 4500, 12600, 45000, 60000);

-- Crear índices para mejorar el rendimiento
create index if not exists idx_user_policies_user_id on public.user_policies(user_id);
create index if not exists idx_user_policies_policy_id on public.user_policies(policy_id);
create index if not exists idx_policies_category on public.policies(category);
create index if not exists idx_policies_type on public.policies(type);
