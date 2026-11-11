# Mondo e progressione — direzione di sviluppo

Mandato: trama, personaggi, artefatti e tecniche devono sostenere l'esplorazione.
La grafica attuale non è approvata. Questa proposta definisce la prossima struttura,
non annuncia regioni già giocabili, cooperativa esistente o quantità completate.

## Situazione implementata

Piazza del ritorno → sentiero delle memorie → Giardino dei nomi → Cave dei
Sussurri: tre aree con collegamenti locali. Echi, ricordo di Liora, Custode, pista Cartiglio e recupero
bussola, ricerca e restituzione della lente. Sigillo di Liora con due accordature
opzionali; Guardiano del rintocco nelle Cave (vedere CAVES_01).
Non è ancora un mondo aperto vasto: non chiamarlo tale nei testi promozionali.

## Arco narrativo proposto

- **Ritorno:** il Custode impedisce a una voce di uscire. Liora ricorda una
  promessa, ma non tutti i nomi. Il sigillo rende quella promessa una scelta.
- **Cave dei Sussurri:** prima missione implementata: lente del cartografo,
  rintocco circolare e prova delle due rotte sovrapposte. Il cartografo come
  personaggio incontrabile e due approcci narrativi restano proposte future.
- **Archivio Cartiglio:** una gilda certifica quali strade esistono. Alcuni
  membri cancellano nomi per contenere la Frattura; altri sfruttano l'autorità.
  Rivalità con motivazioni e alleati possibili, non una fazione tutta malvagia.
- **Selva capovolta:** percorsi e creature reagiscono ai ricordi restituiti.
  Le missioni secondarie devono modificare accessi, incontri o informazioni.
- **Cittadella senza nome:** scoprire chi proteggeva la squadra e perché Liora
  ha perso parte della memoria. Finale da costruire dopo aver verificato il
  ciclo di gioco; nessun colpo di scena definitivo promesso al proprietario.

Ogni regione deve avere un ingresso/ritorno sicuro, un landmark leggibile, un
incontro con decisioni diverse, una scoperta e un uso immediato del potere nuovo.
Evitare premi utili soltanto dopo che tutti i combattimenti sono già finiti.

## Personaggi e poteri

Sei classi concordate. Ogni personaggio necessita desiderio, contraddizione,
legame con un altro personaggio e conseguenza della crescita. Liora e Daria
restano proposte, non sei archi completi. Non aggiungere nomi soltanto per
riempire un roster.

Progressione proposta: ricordo → artefatto → tecnica modificata → prova pratica.
I poteri devono cambiare una decisione (proteggere, interrompere, posizionarsi,
rischiare una risposta), non soltanto aumentare danni. Il Sigillo costituisce
la prima verifica. Nuove magie specifiche delle classi verranno aggiunte una
alla volta con costo, lettura del pericolo, controgioco e feedback chiari.

## Passi tecnici verso il mondo aperto

1. Definizioni delle regioni e connessioni indipendenti dal rendering; progressi
   salvati come decisioni e tappe, non copie arbitrarie della simulazione.
2. Le Cave hanno ingresso/ritorno e un primo ciclo completo. Prima di
   moltiplicare mappe, verificare orientamento e motivo di tornarci.
3. Caricamento di zone limitrofe con limiti a geometrie, texture e nemici attivi;
   rilascio verificato delle risorse, nessuna mappa enorme caricata tutta insieme.
4. Missioni solo, contributi di gilda e spedizioni di squadra come categorie
   distinte. Backend autorevole e due client verificati prima della cooperativa.
5. Espansione guidata dalle prove con giocatori. Il 35–40% resta un obiettivo
   qualitativo, non una percentuale ottenuta contando regioni o commit.

Prossima fetta proposta: rendere il collegamento con l'Archivio una scelta
con conseguenze verificabili, dopo il feedback sul ciclo delle Cave. Archivio,
Selva e Cittadella non sono ancora aree implementate. Non moltiplicare mappe
vuote prima della revisione di motivazione, combattimento e durata.
