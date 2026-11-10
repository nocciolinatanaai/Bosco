-- Baseline fornita dal proprietario; solo definizione, nessun dato reale.
CREATE OR REPLACE FUNCTION public.login(p_nick text, p_pass text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare s record;
begin
  if (select count(*) from login_fail where lower(nick) = lower(btrim(p_nick)) and at > now() - interval '1 hour') >= 8 then
    return json_build_object('error', 'Troppi tentativi: riprova tra un''ora'); end if;
  select device, pass into s from scoiattoli where lower(nick) = lower(btrim(p_nick));
  if s.pass is null or s.pass <> extensions.crypt(p_pass, s.pass) then
    insert into login_fail (nick) values (lower(btrim(p_nick)));
    return json_build_object('error', 'Nome o parola d''ordine sbagliati');
  end if;
  return json_build_object('device', s.device);
end $function$
