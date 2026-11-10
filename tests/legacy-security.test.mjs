import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('PostgreSQL isolato: regressioni login e acquisti legacy', async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(await read('./fixtures/minimal-schema.sql'));
    await db.exec(await read('./fixtures/login.baseline.sql'));
    await db.exec(await read('./fixtures/credit_purchase.baseline.sql'));
    await db.exec(`
      INSERT INTO public.scoiattoli(device, nick, pass) VALUES
        ('synthetic-alice', 'Alice', extensions.crypt('test-password', extensions.gen_salt('bf', 4))),
        ('synthetic-bob', 'Bob', NULL);
      REVOKE ALL ON FUNCTION public.credit_purchase(text,text,text,integer,integer) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.credit_purchase(text,text,text,integer,integer) TO service_role;
      REVOKE ALL ON FUNCTION public.login(text,text) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION public.login(text,text) TO anon, authenticated, service_role;
    `);

    const login = async (nick, password) =>
      (await db.query('SELECT public.login($1, $2) AS result', [nick, password])).rows[0].result;
    const credit = async (device, code, nuts, gold) =>
      (await db.query('SELECT public.credit_purchase($1,$2,$3,$4,$5) AS result',
        [device, code, 'synthetic-product', nuts, gold])).rows[0].result;

    await t.test('baseline: riproduce il bypass con password SQL NULL', async () => {
      assert.deepEqual(await login('Alice', null), { device: 'synthetic-alice' });
    });

    await db.exec(await read('../database/proposals/001_login_null_guard.sql'));
    await t.test('correzione: rifiuta NULL senza restituire device', async () => {
      const result = await login('Alice', null);
      assert.ok(result.error);
      assert.equal(Object.hasOwn(result, 'device'), false);
    });
    await t.test('correzione: rifiuta password vuota, errata e oltre il limite', async () => {
      for (const password of ['', 'wrong', 'x'.repeat(65)]) {
        assert.ok((await login('Alice', password)).error);
      }
    });
    await t.test('correzione: permette password valida e normalizza solo il nome', async () => {
      assert.deepEqual(await login('  ALICE ', 'test-password'), { device: 'synthetic-alice' });
      assert.ok((await login('Alice', ' test-password ')).error);
    });
    await t.test('correzione: utente inesistente, senza password e nomi invalidi non autenticano', async () => {
      for (const [nick, password] of [['Unknown', 'test-password'], ['Bob', null],
        ['Bob', 'test-password'], [null, 'test-password'], ['', 'test-password']]) {
        assert.ok((await login(nick, password)).error);
      }
    });
    await t.test('correzione: i tentativi falliti persistono e attivano il limite', async () => {
      await db.exec('TRUNCATE public.login_fail');
      for (let i = 0; i < 8; i++) assert.ok((await login('Alice', null)).error);
      assert.match((await login('Alice', 'test-password')).error, /Troppi tentativi/);
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.login_fail')).rows[0].n, 8);
      await db.exec('TRUNCATE public.login_fail');
    });
    await t.test('correzione: tentativi scaduti non bloccano accesso valido', async () => {
      await db.exec(`INSERT INTO public.login_fail SELECT 'alice', now() - interval '2 hours' FROM generate_series(1,8)`);
      assert.deepEqual(await login('Alice', 'test-password'), { device: 'synthetic-alice' });
    });
    await t.test('CREATE OR REPLACE conserva gli ACL della funzione', async () => {
      const { rows } = await db.query(`SELECT
        has_function_privilege('anon', 'public.login(text,text)', 'EXECUTE') AS login_anon,
        has_function_privilege('anon', 'public.credit_purchase(text,text,text,integer,integer)', 'EXECUTE') AS credit_anon,
        has_function_privilege('authenticated', 'public.credit_purchase(text,text,text,integer,integer)', 'EXECUTE') AS credit_user,
        has_function_privilege('service_role', 'public.credit_purchase(text,text,text,integer,integer)', 'EXECUTE') AS credit_server`);
      assert.deepEqual(rows[0], { login_anon: true, credit_anon: false, credit_user: false, credit_server: true });
    });

    await t.test('acquisto oro NUOVO: registra il codice e il retry non raddoppia il credito', async () => {
      assert.equal((await credit('synthetic-alice', 'GOLD-TEST-001', 0, 1)).status, 'ok');
      assert.equal((await credit('synthetic-alice', 'GOLD-TEST-001', 0, 1)).status, 'gia');
      assert.equal((await db.query(`SELECT count(*)::int AS n FROM public.codes WHERE code='GOLD-TEST-001'`)).rows[0].n, 1);
      assert.equal((await db.query(`SELECT sum(n)::int AS n FROM public.nut_ledger WHERE gold`)).rows[0].n, 1);
    });
    await t.test('acquisto normale: codice e accredito unici', async () => {
      await credit('synthetic-alice', 'NUTS-TEST-001', 30, 0);
      assert.equal((await credit('synthetic-alice', 'NUTS-TEST-001', 30, 0)).status, 'gia');
      assert.equal((await db.query(`SELECT sum(n)::int AS n FROM public.nut_ledger WHERE NOT gold`)).rows[0].n, 30);
    });
    await t.test('codice già attribuito non può passare a un altro personaggio', async () => {
      await assert.rejects(credit('synthetic-bob', 'GOLD-TEST-001', 0, 1), /altro giocatore/);
    });
    await t.test('limite oro: errore annulla codice e credito nella transazione', async () => {
      await assert.rejects(credit('synthetic-alice', 'GOLD-OVER-001', 0, 5), /massimo 5/);
      assert.equal((await db.query(`SELECT count(*)::int AS n FROM public.codes WHERE code='GOLD-OVER-001'`)).rows[0].n, 0);
    });
    await t.test('FOUND: assegnazione con sottoquery NON equivale a SELECT INTO', async () => {
      await db.exec(`DO $$ DECLARE amount integer; BEGIN
        PERFORM 1 WHERE false;
        amount := coalesce((SELECT sum(n) FROM public.nut_ledger), 0);
        IF FOUND THEN RAISE EXCEPTION 'Assignment unexpectedly changed FOUND'; END IF;
      END $$;`);
    });
  } finally {
    await db.close();
  }
});
