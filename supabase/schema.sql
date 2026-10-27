-- ==============================================================================
-- NAO // SISTEMA DE BASE DE DATOS Y AUTENTICACIÓN (SUPABASE POSTGRESQL)
-- Copia y pega todo este script en el "SQL Editor" de tu proyecto en Supabase
-- y presiona RUN. Configura automáticamente tablas, relaciones, triggers y RLS.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE PILOTO (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  bio TEXT DEFAULT 'Piloto en NAO. Explorando rutas, curvas y caminos sin asfalto.',
  location TEXT DEFAULT 'México',
  riding_level TEXT DEFAULT 'Intermedio',
  phone TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los perfiles son públicos para lectura"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Los pilotos pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los pilotos pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. TRIGGER AUTOMÁTICO: CREAR PERFIL AL REGISTRARSE EN SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_name TEXT;
  raw_handle TEXT;
  raw_avatar TEXT;
BEGIN
  raw_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  raw_handle := COALESCE(NEW.raw_user_meta_data->>'handle', '@' || LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')));
  raw_avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250');

  INSERT INTO public.profiles (id, name, handle, email, avatar_url, bio, location, riding_level)
  VALUES (
    NEW.id,
    raw_name,
    raw_handle,
    NEW.email,
    raw_avatar,
    'Piloto registrado en NAO.',
    'México',
    'Intermedio'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. CONEXIONES: SEGUIR A OTROS PILOTOS (FOLLOWS)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Las conexiones son públicas para lectura"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Los pilotos autenticados pueden seguir"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Los pilotos pueden dejar de seguir"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 5. GARAJE: MOTOCICLETAS DE LOS PILOTOS
CREATE TABLE IF NOT EXISTS public.motorcycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  displacement_cc INTEGER NOT NULL,
  nickname TEXT,
  image_url TEXT,
  tires TEXT,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motos públicas para lectura"
  ON public.motorcycles FOR SELECT
  USING (true);

CREATE POLICY "Los pilotos gestionan sus motos"
  ON public.motorcycles FOR ALL
  USING (auth.uid() = user_id);

-- 6. TRIBUS (CREWS)
CREATE TABLE IF NOT EXISTS public.crews (
  id TEXT PRIMARY KEY DEFAULT ('crew-' || substr(uuid_generate_v4()::text, 1, 8)),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  base_city TEXT DEFAULT 'Ciudad de México',
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  whatsapp_group_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tribus públicas para lectura"
  ON public.crews FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear tribus"
  ON public.crews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Capitanes o miembros pueden actualizar la tribu"
  ON public.crews FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 7. MIEMBROS DE TRIBU
CREATE TABLE IF NOT EXISTS public.crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id TEXT NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Rider',
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(crew_id, user_id)
);

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Miembros públicos para lectura"
  ON public.crew_members FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden unirse a tribus"
  ON public.crew_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los miembros pueden salir de la tribu"
  ON public.crew_members FOR DELETE
  USING (auth.uid() = user_id);

-- 8. CHAT INTERNO DE TRIBU (MENSAJES EN TIEMPO REAL)
CREATE TABLE IF NOT EXISTS public.crew_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id TEXT NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crew_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mensajes legibles para todos"
  ON public.crew_messages FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados envían mensajes a su tribu"
  ON public.crew_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. ACTIVIDADES / POSTS DEL DESPACHO (FEED)
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY DEFAULT ('act-' || substr(uuid_generate_v4()::text, 1, 8)),
  pilot_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pilot_name TEXT NOT NULL,
  pilot_handle TEXT NOT NULL,
  pilot_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  distance_km NUMERIC(6,1) NOT NULL DEFAULT 0,
  elevation_gain_m INTEGER DEFAULT 0,
  duration_formatted TEXT DEFAULT '0h 00m',
  avg_speed_kmh NUMERIC(5,1) DEFAULT 0,
  moto_model TEXT,
  discipline TEXT DEFAULT 'Trail / Aventura',
  location TEXT DEFAULT 'México',
  route_coordinates JSONB DEFAULT '[]'::jsonb,
  photos TEXT[] DEFAULT '{}',
  surface_breakdown JSONB DEFAULT '{"asphalt": 50, "gravel": 50}'::jsonb,
  group_info JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actividades públicas para lectura"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "Pilotos autenticados publican actividades"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Pilotos pueden editar sus actividades"
  ON public.activities FOR UPDATE
  USING (auth.uid() = pilot_id);

CREATE POLICY "Pilotos pueden borrar sus actividades"
  ON public.activities FOR DELETE
  USING (auth.uid() = pilot_id);

-- 10. SALUDOS BIKER (KUDOS)
CREATE TABLE IF NOT EXISTS public.activity_kudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id TEXT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(activity_id, user_id)
);

ALTER TABLE public.activity_kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kudos públicos para lectura"
  ON public.activity_kudos FOR SELECT
  USING (true);

CREATE POLICY "Pilotos autenticados dan kudos"
  ON public.activity_kudos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pilotos pueden retirar su kudo"
  ON public.activity_kudos FOR DELETE
  USING (auth.uid() = user_id);

-- 11. COMENTARIOS EN ACTIVIDADES
CREATE TABLE IF NOT EXISTS public.activity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id TEXT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_handle TEXT NOT NULL,
  user_avatar TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentarios públicos para lectura"
  ON public.activity_comments FOR SELECT
  USING (true);

CREATE POLICY "Pilotos autenticados comentan"
  ON public.activity_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 12. RUTAS GUARDADAS
CREATE TABLE IF NOT EXISTS public.saved_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, route_id)
);

ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rutas guardadas públicas para lectura"
  ON public.saved_routes FOR SELECT
  USING (true);

CREATE POLICY "Pilotos guardan rutas"
  ON public.saved_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pilotos eliminan rutas guardadas"
  ON public.saved_routes FOR DELETE
  USING (auth.uid() = user_id);

-- 13. SEED INICIAL: TRIBU NAO ADVENTURE CREW OFICIAL
INSERT INTO public.crews (id, name, slug, tagline, description, invite_code, cover_image, base_city, whatsapp_group_url)
VALUES (
  'crew-motomami',
  'NAO Adventure Crew',
  'nao-adventure',
  'Terracería, sierra, fogatas y doble propósito sin drama.',
  'Comunidad de amigos apasionados por las motos trail y doble propósito. Rodamos fines de semana y puentes buscando campamentos base remotos, brechas forestales y buena comida.',
  'NAO-2026',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
  'Interlomas & Poniente CDMX',
  'https://chat.whatsapp.com/Jg1AKUEqoXF7nXZuAPJ588'
) ON CONFLICT (id) DO NOTHING;

-- FIN DEL SCRIPT
