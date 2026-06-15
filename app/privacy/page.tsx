import LegalPageShell from "@/components/layout/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        La presente informativa descrive come Elettronica51 Di Riccio Francesco
        tratta i dati personali degli utenti che visitano il sito e utilizzano i
        servizi di contatto e acquisto.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Titolare del trattamento</h2>
      <p>
        Elettronica51 Di Riccio Francesco — P. IVA 08215101216 — email{" "}
        elettronica51@hotmail.it.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Dati raccolti</h2>
      <p>
        Possiamo raccogliere nome, email, numero di telefono e contenuto del
        messaggio quando compili il modulo contatti, oltre a dati tecnici di
        navigazione (cookie tecnici e informazioni sul dispositivo) necessari al
        funzionamento del sito.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Finalità</h2>
      <p>
        I dati sono utilizzati per rispondere alle richieste, gestire ordini e
        comunicazioni commerciali, migliorare il servizio e adempiere a obblighi
        di legge.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Conservazione</h2>
      <p>
        I dati sono conservati per il tempo necessario alle finalità indicate e,
        in ogni caso, nei limiti previsti dalla normativa applicabile.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Diritti dell&apos;interessato</h2>
      <p>
        Puoi richiedere accesso, rettifica, cancellazione, limitazione o
        opposizione al trattamento scrivendo a elettronica51@hotmail.it.
      </p>
    </LegalPageShell>
  );
}