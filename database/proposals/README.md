# Proposte SQL legacy

Non sono migrazioni già applicate e non vengono eseguite all'avvio del client.

- `001_login_null_guard.sql`: chiude il bypass NULL individuato e riprodotto.
- Verifica: `npm test`, PostgreSQL WASM PGlite con pgcrypto e dati sintetici.
- Limite: non ricostruisce Supabase, Auth o tutte le regole di produzione.
- Gli ACL preesistenti sono preservati, non ridefiniti implicitamente.
- Per rollback serve la definizione corrente verificata prima dell'intervento;
  ripristinare la baseline vulnerabile riapre il difetto e non è una soluzione sicura.

Non esiste una patch FOUND: il presunto difetto è stato smentito dai test.
