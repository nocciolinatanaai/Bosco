-- Baseline fornita dal proprietario; solo definizione, nessun dato reale.
CREATE OR REPLACE FUNCTION public.credit_purchase(p_device text, p_code text, p_product text, p_nuts integer, p_gold integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare c text := upper(btrim(p_code)); e record; week_gold int;
begin
  if not exists (select 1 from scoiattoli where device = p_device) then raise exception 'Prima scegli il tuo nome nel bosco'; end if;
  perform pg_advisory_xact_lock(hashtext('credit:' || p_device));
  perform pg_advisory_xact_lock(hashtext('code:' || c));
  select * into e from codes where code = c;
  if found and e.status = 'ok' then
    if e.device = p_device then return json_build_object('status', 'gia', 'seeds', my_seeds(p_device)); end if;
    raise exception 'Questo codice è già stato usato da un altro giocatore';
  end if;
  if p_gold > 0 then
    week_gold := coalesce((select sum(n) from nut_ledger where device = p_device and kind = 'acquisto' and gold and at > now() - interval '7 days'), 0);
    if week_gold + p_gold > 5 then
      raise exception 'Puoi comprare al massimo 5 nocciole d''oro a settimana. Questo codice resta valido: riprova tra qualche giorno.';
    end if;
  end if;
  if found then
    update codes set device = p_device, product = p_product, status = 'ok', checked_at = now(), note = 'gumroad' where code = c;
  else
    insert into codes (code, device, product, status, checked_at, note) values (c, p_device, p_product, 'ok', now(), 'gumroad');
  end if;
  if p_nuts > 0 then insert into nut_ledger (device, kind, gold, n) values (p_device, 'acquisto', false, p_nuts); end if;
  if p_gold > 0 then insert into nut_ledger (device, kind, gold, n) values (p_device, 'acquisto', true, p_gold); end if;
  update redeem_tries set ok = true where id = (select max(id) from redeem_tries where device = p_device);
  return json_build_object('status', 'ok', 'nuts', p_nuts, 'gold', p_gold, 'seeds', my_seeds(p_device));
end $function$
