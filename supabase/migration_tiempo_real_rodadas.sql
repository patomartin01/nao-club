-- ==============================================================================
-- NAO // TIEMPO REAL PARA RUTAS, ACTIVIDADES, TRIBUS Y SEGUIDORES
-- Ya se corrió en Supabase (proyecto Nao). Se puede volver a correr sin problema.
-- Sin esto, la app no recibe en vivo lo que publican otros pilotos: rutas grabadas,
-- actividades, votos, cambios de tribu y seguidores solo aparecían al recargar.
-- ==============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['activities', 'route_proposals', 'rodadas', 'crews', 'follows'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- follows tiene llave primaria "id": sin esto, al dejar de seguir el evento en vivo solo traía
-- el id y la app no sabía a quién quitar de la lista
ALTER TABLE public.follows REPLICA IDENTITY FULL;

-- Verificación
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
