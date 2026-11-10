-- Schema sintetico limitato alle dipendenze dei test, NON dump ripristinabile.
CREATE SCHEMA extensions;
CREATE EXTENSION pgcrypto WITH SCHEMA extensions;
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role;
CREATE TABLE public.scoiattoli (
  device text PRIMARY KEY,
  nick text NOT NULL,
  pass text
);
CREATE TABLE public.login_fail (nick text NOT NULL, at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.codes (
  code text PRIMARY KEY,
  device text NOT NULL,
  product text,
  status text NOT NULL DEFAULT 'pending',
  checked_at timestamptz,
  note text
);
CREATE TABLE public.nut_ledger (
  device text NOT NULL,
  kind text NOT NULL,
  gold boolean NOT NULL,
  n integer NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.redeem_tries (id integer PRIMARY KEY, device text NOT NULL, ok boolean DEFAULT false);
CREATE FUNCTION public.my_seeds(p_device text) RETURNS json LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'nuts', coalesce(sum(n) FILTER (WHERE NOT gold), 0),
    'gold', coalesce(sum(n) FILTER (WHERE gold), 0)
  ) FROM public.nut_ledger WHERE device = p_device;
$$;
