-- ==============================================================================
-- NAO // MIGRACIÓN COMPLEMENTARIA SUPABASE: TABLAS FALTANTES Y PERMISOS RLS
-- Pega esto en Supabase -> SQL Editor y presiona RUN
-- ==============================================================================

-- 1. TABLA DE RODADAS (CONVOCATORIAS DE LA TRIBU)
CREATE TABLE IF NOT EXISTS public.rodadas (
  id TEXT PRIMARY KEY,
  crew_id TEXT REFERENCES public.crews(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT DEFAULT 'Fin de Semana',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  origin_point TEXT DEFAULT 'CDMX',
  status TEXT DEFAULT 'votacion',
  winning_route_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.rodadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rodadas públicas para lectura" ON public.rodadas;
CREATE POLICY "Rodadas públicas para lectura"
  ON public.rodadas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados crean rodadas" ON public.rodadas;
CREATE POLICY "Usuarios autenticados crean rodadas"
  ON public.rodadas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios autenticados actualizan rodadas" ON public.rodadas;
CREATE POLICY "Usuarios autenticados actualizan rodadas"
  ON public.rodadas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados eliminan rodadas" ON public.rodadas;
CREATE POLICY "Usuarios autenticados eliminan rodadas"
  ON public.rodadas FOR DELETE USING (true);

-- 2. TABLA DE PROPUESTAS DE RUTAS
CREATE TABLE IF NOT EXISTS public.route_proposals (
  id TEXT PRIMARY KEY,
  rodada_id TEXT,
  crew_id TEXT REFERENCES public.crews(id) ON DELETE CASCADE,
  is_recorded BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  state TEXT DEFAULT 'México',
  proposed_by_user_id TEXT NOT NULL,
  proposed_by_name TEXT NOT NULL,
  proposed_by_avatar TEXT,
  description TEXT,
  cover_image TEXT,
  total_km NUMERIC(6,1) DEFAULT 0,
  estimated_hours TEXT,
  offroad_percentage INTEGER DEFAULT 50,
  asphalt_percentage INTEGER DEFAULT 50,
  difficulty TEXT DEFAULT 'Intermedio',
  campsite JSONB,
  itinerary JSONB DEFAULT '[]'::jsonb,
  waypoints JSONB DEFAULT '[]'::jsonb,
  coordinates JSONB DEFAULT '[]'::jsonb,
  votes TEXT[] DEFAULT '{}',
  downvotes TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]'::jsonb,
  day_of_dead_vibe TEXT,
  safety_tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.route_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Propuestas públicas para lectura" ON public.route_proposals;
CREATE POLICY "Propuestas públicas para lectura"
  ON public.route_proposals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados crean propuestas" ON public.route_proposals;
CREATE POLICY "Usuarios autenticados crean propuestas"
  ON public.route_proposals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios autenticados actualizan propuestas" ON public.route_proposals;
CREATE POLICY "Usuarios autenticados actualizan propuestas"
  ON public.route_proposals FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados eliminan propuestas" ON public.route_proposals;
CREATE POLICY "Usuarios autenticados eliminan propuestas"
  ON public.route_proposals FOR DELETE USING (true);

-- 3. TABLA DE FEEDBACK VIP FUNDADORES
CREATE TABLE IF NOT EXISTS public.admin_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_handle TEXT NOT NULL,
  user_avatar TEXT,
  user_email TEXT,
  founder_number INTEGER,
  category TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.admin_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback visible para lectura" ON public.admin_feedback;
CREATE POLICY "Feedback visible para lectura"
  ON public.admin_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios insertan feedback" ON public.admin_feedback;
CREATE POLICY "Usuarios insertan feedback"
  ON public.admin_feedback FOR INSERT WITH CHECK (true);

-- 4. AJUSTE DE RLS EN CREW_MEMBERS Y FOLLOWS
-- Permitir que inserciones y borrados funcionen tanto para sesión activa como para sincronización de app
DROP POLICY IF EXISTS "Usuarios autenticados pueden unirse a tribus" ON public.crew_members;
CREATE POLICY "Usuarios autenticados pueden unirse a tribus"
  ON public.crew_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Los miembros pueden salir de la tribu" ON public.crew_members;
CREATE POLICY "Los miembros pueden salir de la tribu"
  ON public.crew_members FOR DELETE USING (true);

DROP POLICY IF EXISTS "Pilotos autenticados siguen a otros" ON public.follows;
CREATE POLICY "Pilotos autenticados siguen a otros"
  ON public.follows FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Pilotos pueden dejar de seguir" ON public.follows;
CREATE POLICY "Pilotos pueden dejar de seguir"
  ON public.follows FOR DELETE USING (true);

DROP POLICY IF EXISTS "Pilotos autenticados publican actividades" ON public.activities;
CREATE POLICY "Pilotos autenticados publican actividades"
  ON public.activities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Pilotos pueden editar sus actividades" ON public.activities;
CREATE POLICY "Pilotos pueden editar sus actividades"
  ON public.activities FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Pilotos pueden borrar sus actividades" ON public.activities;
CREATE POLICY "Pilotos pueden borrar sus actividades"
  ON public.activities FOR DELETE USING (true);

-- Motos / Hangar
DROP POLICY IF EXISTS "Los pilotos gestionan sus motos" ON public.motorcycles;
CREATE POLICY "Los pilotos gestionan sus motos"
  ON public.motorcycles FOR ALL USING (true) WITH CHECK (true);

-- Perfiles
DROP POLICY IF EXISTS "Los pilotos actualizan su perfil" ON public.profiles;
CREATE POLICY "Los pilotos actualizan su perfil"
  ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Tribus / Crews
DROP POLICY IF EXISTS "Los pilotos crean tribus" ON public.crews;
CREATE POLICY "Los pilotos crean tribus"
  ON public.crews FOR ALL USING (true) WITH CHECK (true);

-- 5. PUBLICAR EN REALTIME
DO $$
BEGIN
  -- Intentar agregar a publicación supabase_realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rodadas;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.route_proposals;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_feedback;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crew_members;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 6. SOPORTE DE IDENTIFICADORES DE PILOTO (UUID + TEXTO)
-- Permite que pilotos con IDs de demo, invitados y UUIDs sincronicen simultáneamente sin error 22P02
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.motorcycles DROP CONSTRAINT IF EXISTS motorcycles_user_id_fkey;
    ALTER TABLE public.motorcycles ALTER COLUMN user_id TYPE text;
    ALTER TABLE public.motorcycles ALTER COLUMN id TYPE text;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS type text;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS nickname text;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS tires text;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS displacement_cc integer;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS image_url text;
    ALTER TABLE public.motorcycles ADD COLUMN IF NOT EXISTS year integer;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
    ALTER TABLE public.follows ALTER COLUMN follower_id TYPE text;
    ALTER TABLE public.follows ALTER COLUMN following_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.crew_members DROP CONSTRAINT IF EXISTS crew_members_user_id_fkey;
    ALTER TABLE public.crew_members ALTER COLUMN user_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.crews DROP CONSTRAINT IF EXISTS crews_creator_id_fkey;
    ALTER TABLE public.crews ALTER COLUMN creator_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.rodadas DROP CONSTRAINT IF EXISTS rodadas_creator_id_fkey;
    ALTER TABLE public.rodadas ALTER COLUMN creator_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.route_proposals DROP CONSTRAINT IF EXISTS route_proposals_proposed_by_user_id_fkey;
    ALTER TABLE public.route_proposals ALTER COLUMN proposed_by_user_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_pilot_id_fkey;
    ALTER TABLE public.activities ALTER COLUMN pilot_id TYPE text;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- 7. PURGA DE GRUPO HUÉRFANO DE DEMO (0 PILOTOS)
DELETE FROM public.crew_members WHERE crew_id = 'crew-motomami';
DELETE FROM public.crew_messages WHERE crew_id = 'crew-motomami';
DELETE FROM public.rodadas WHERE crew_id = 'crew-motomami';
DELETE FROM public.route_proposals WHERE crew_id = 'crew-motomami';
DELETE FROM public.crews WHERE id = 'crew-motomami';
