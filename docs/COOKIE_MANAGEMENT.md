# Cookie e memoria locale — gestione implementata

Banner con scelte equivalenti Accetta preferenze / Solo necessari / Personalizza.
Nessuna preferenza facoltativa prima di una scelta. Pannello riapribile dal footer
su sito/Account; il gioco rimanda al pannello del sito con il link Cookie.
Non ci sono analytics, pubblicità, iframe social o video esterni da attivare.

La preferenza facoltativa ricorda soltanto la classe esplorata nella landing.
Revoca: cancella mythwood.site-role.v1 e blocca scritture successive. La scelta
è in mythwood.cookie-consent.v1 per 180 giorni, con schema/versione/data, senza
invio al server. Scadenza o schema non valido disattivano la preferenza.
Storage negato/quota: niente blocco della navigazione; scelta valida in memoria
per la sessione, senza fingere persistenza. La revoca in memoria prevale anche
se una vecchia scelta su disco non può essere aggiornata per quota.

Account e partita sono funzioni richieste separatamente: sessione di accesso
necessaria solo dopo login e checkpoint locale soltanto se attivato nel gioco.
Il pannello lo spiega: Solo necessari non finge di cancellare account o partite.
Uscita/eliminazione tramite i rispettivi comandi. La scelta non abilita marketing.
Google viene aperto soltanto su azione dell'utente; la gestione dei provider e
hosting va inclusa nell'informativa del responsabile prima dell'attivazione.

Test di dominio coprono default, accettazione, revoca, scadenza, memoria negata e
quota, preservando dati account/partita. Test browser desktop/mobile verificano
banner, pannello, ricordo della classe e revoca. Non è una certificazione legale
né una CMP collegata a piattaforme pubblicitarie inesistenti. Nuovi tracker
richiedono inventario, blocco preventivo e gestione della revoca prima dell'uso.
