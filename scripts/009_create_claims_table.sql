-- Crear tabla de siniestros
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.user_policies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'aprobado', 'rechazado', 'cerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON public.claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

-- Habilitar RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo sus propios siniestros
CREATE POLICY "claims_select_own"
  ON public.claims FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios siniestros
CREATE POLICY "claims_insert_own"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar solo sus propios siniestros
CREATE POLICY "claims_update_own"
  ON public.claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_claims_updated_at_trigger
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION update_claims_updated_at();
