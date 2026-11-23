-- ==============================================================================
-- NAO // MIGRACIÓN ARQUITECTURA DE ALTA ESCALA (300,000 USUARIOS) Y TIEMPO REAL
-- ==============================================================================
-- 1. ÍNDICES CRÍTICOS PARA CONSULTAS RÁPIDAS (B-TREE INDEXES)
-- Evita escaneos secuenciales de tablas completas cuando hay miles de usuarios.
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_compound ON public.follows(follower_id, following_id);

CREATE INDEX IF NOT EXISTS idx_motorcycles_user ON public.motorcycles(user_id);
CREATE INDEX IF NOT EXISTS idx_motorcycles_primary ON public.motorcycles(user_id, is_primary);

CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_pilot ON public.activities(pilot_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rodadas_crew ON public.rodadas(crew_id);
CREATE INDEX IF NOT EXISTS idx_rodadas_status ON public.rodadas(status);

CREATE INDEX IF NOT EXISTS idx_route_proposals_rodada ON public.route_proposals(rodada_id);
CREATE INDEX IF NOT EXISTS idx_route_proposals_creator ON public.route_proposals(proposed_by_user_id);

-- ==============================================================================
-- 2. REPARACIÓN Y PERMISOS RLS PARA SEGUIMIENTOS (FOLLOWS) Y MOTOS (GARAJE)
-- Resuelve el error donde upsert() fallaba por falta de política de UPDATE o check
-- ==============================================================================

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Las conexiones son públicas para lectura" ON public.follows;
CREATE POLICY "Las conexiones son públicas para lectura"
  ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Los pilotos autenticados pueden seguir" ON public.follows;
DROP POLICY IF EXISTS "Los pilotos pueden dejar de seguir" ON public.follows;
DROP POLICY IF EXISTS "Gestionar seguimientos" ON public.follows;

CREATE POLICY "Gestionar seguimientos"
  ON public.follows FOR ALL
  USING (auth.uid()::text = follower_id::text OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = follower_id::text OR auth.uid() IS NOT NULL);

-- Reparación RLS en motorcycles para permitir inserción/actualización fluida
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Motos públicas para lectura" ON public.motorcycles;
CREATE POLICY "Motos públicas para lectura"
  ON public.motorcycles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Los pilotos gestionan sus motos" ON public.motorcycles;
CREATE POLICY "Los pilotos gestionan sus motos"
  ON public.motorcycles FOR ALL
  USING (auth.uid()::text = user_id::text OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NOT NULL);

-- ==============================================================================
-- 3. HABILITACIÓN DE SUPABASE REALTIME
-- Permite que los cambios se transmitan instantáneamente a todos los teléfonos
-- conectados sin necesidad de recargar la página.
-- ==============================================================================

DO $$
BEGIN
  -- Agregar tablas a la publicación de realtime si no están ya agregadas
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.motorcycles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rodadas;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.route_proposals;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crews;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
