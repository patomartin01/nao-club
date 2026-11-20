-- ==============================================================================
-- NAO // VOTOS ATÓMICOS EN PROPUESTAS DE RUTA
-- Pega esto en Supabase -> SQL Editor y presiona RUN (se puede correr más de una vez)
--
-- Problema que resuelve: la app mandaba la lista COMPLETA de votos tal como la tenía en el
-- teléfono. Si dos pilotos votaban casi al mismo tiempo, el último borraba el voto del otro,
-- y un voto guardado sin señal volvía a escribir una lista vieja al regresar la conexión.
--
-- Ahora cada teléfono solo dice "mi voto en esta ruta es: a favor / en contra / ninguno" y
-- la base de datos agrega o quita SOLO a ese piloto, dentro de un mismo UPDATE (Postgres
-- bloquea la fila, así que dos votos simultáneos se aplican uno tras otro sin pisarse).
-- Es idempotente: repetir el mismo voto (p. ej. al reintentar desde la cola offline) no cambia nada.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_route_vote(p_route_id TEXT, p_vote TEXT)
RETURNS TABLE (new_votes TEXT[], new_downvotes TEXT[])
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid TEXT := auth.uid()::text; -- el piloto sale de la sesión, no de lo que mande el teléfono
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para votar' USING ERRCODE = '28000';
  END IF;

  IF p_vote NOT IN ('up', 'down', 'none') THEN
    RAISE EXCEPTION 'Voto inválido: %', p_vote USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.route_proposals rp
  SET
    -- Si ya estaba, se deja igual (sin duplicar ni cambiar el orden); si no, se agrega al final
    votes = CASE
      WHEN p_vote = 'up' AND v_uid = ANY(COALESCE(rp.votes, '{}')) THEN rp.votes
      WHEN p_vote = 'up' THEN array_append(COALESCE(rp.votes, '{}'), v_uid)
      ELSE array_remove(COALESCE(rp.votes, '{}'), v_uid)
    END,
    downvotes = CASE
      WHEN p_vote = 'down' AND v_uid = ANY(COALESCE(rp.downvotes, '{}')) THEN rp.downvotes
      WHEN p_vote = 'down' THEN array_append(COALESCE(rp.downvotes, '{}'), v_uid)
      ELSE array_remove(COALESCE(rp.downvotes, '{}'), v_uid)
    END
  WHERE rp.id = p_route_id
  RETURNING rp.votes, rp.downvotes;
END;
$$;

REVOKE ALL ON FUNCTION public.set_route_vote(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_route_vote(TEXT, TEXT) TO authenticated;

-- Que la API vea la función nueva sin esperar
NOTIFY pgrst, 'reload schema';
