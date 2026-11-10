-- Proposta di correzione del login legacy. NON applicata a Supabase.
-- Richiede schema e pgcrypto già presenti; conserva firma e privilegi esistenti.
-- Non risolve il più ampio modello di autenticazione basato su device.
BEGIN;

CREATE OR REPLACE FUNCTION public.login(p_nick text, p_pass text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public, extensions
AS $function$
DECLARE
  s record;
  normalized_nick text := lower(btrim(p_nick));
  denied constant text := 'Nome o parola d''ordine sbagliati';
BEGIN
  IF normalized_nick IS NULL
     OR char_length(normalized_nick) NOT BETWEEN 2 AND 20 THEN
    RETURN json_build_object('error', denied);
  END IF;

  IF (SELECT count(*) FROM public.login_fail
      WHERE lower(nick) = normalized_nick
        AND at > now() - interval '1 hour') >= 8 THEN
    RETURN json_build_object('error', 'Troppi tentativi: riprova tra un''ora');
  END IF;

  -- Input non valido non deve mai raggiungere un confronto nullable.
  IF p_pass IS NULL OR char_length(p_pass) NOT BETWEEN 1 AND 64 THEN
    INSERT INTO public.login_fail(nick) VALUES (normalized_nick);
    RETURN json_build_object('error', denied);
  END IF;

  SELECT device, pass INTO s
  FROM public.scoiattoli WHERE lower(nick) = normalized_nick;

  IF NOT FOUND OR s.pass IS NULL THEN
    INSERT INTO public.login_fail(nick) VALUES (normalized_nick);
    RETURN json_build_object('error', denied);
  END IF;

  IF extensions.crypt(p_pass, s.pass) IS DISTINCT FROM s.pass THEN
    INSERT INTO public.login_fail(nick) VALUES (normalized_nick);
    RETURN json_build_object('error', denied);
  END IF;

  RETURN json_build_object('device', s.device);
END
$function$;

COMMIT;
