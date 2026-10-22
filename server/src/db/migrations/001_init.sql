-- ==============================================================================
-- Migración 001_init.sql — Hackathon IINOA
-- Tablas: consultas, rfqs y políticas de seguridad RLS
-- ==============================================================================

-- 1. Tabla de Consultas
CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    texto_original TEXT NOT NULL,
    ficha JSONB NOT NULL DEFAULT '{}'::jsonb,
    alertas JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_consultas_user_id ON public.consultas(user_id);
CREATE INDEX IF NOT EXISTS idx_consultas_created_at ON public.consultas(created_at DESC);

-- 2. Tabla de RFQs
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES public.consultas(id) ON DELETE CASCADE,
    corredor_id TEXT CHECK (corredor_id IN ('pacifico', 'atlantico') OR corredor_id IS NULL),
    asunto TEXT NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para rfqs
CREATE INDEX IF NOT EXISTS idx_rfqs_consulta_id ON public.rfqs(consulta_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON public.rfqs(created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para consultas

-- Los usuarios autenticados solo ven sus propias consultas (o anónimas si user_id es NULL en modo demo)
CREATE POLICY "Usuarios pueden ver sus propias consultas" 
ON public.consultas
FOR SELECT 
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (user_id IS NULL)
);

-- Los usuarios autenticados pueden insertar sus propias consultas (o anónimas sin auth)
CREATE POLICY "Usuarios pueden insertar consultas" 
ON public.consultas
FOR INSERT 
WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- 5. Políticas RLS para rfqs

-- Pueden ver RFQs asociados a consultas que les pertenecen (o públicas en demo)
CREATE POLICY "Usuarios pueden ver sus propios rfqs" 
ON public.rfqs
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.consultas c
        WHERE c.id = rfqs.consulta_id 
        AND ((auth.uid() IS NOT NULL AND auth.uid() = c.user_id) OR (c.user_id IS NULL))
    )
);

-- Pueden insertar RFQs vinculados a sus consultas
CREATE POLICY "Usuarios pueden insertar rfqs" 
ON public.rfqs
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.consultas c
        WHERE c.id = rfqs.consulta_id 
        AND ((auth.uid() IS NOT NULL AND auth.uid() = c.user_id) OR (c.user_id IS NULL))
    )
);
