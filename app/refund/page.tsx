import LegalPageShell from "@/components/layout/LegalPageShell";

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund and Returns Policy">
      <p>
        Vogliamo che ogni acquisto su Elettronica51 sia soddisfacente. Se un
        prodotto presenta difetti o non corrisponde a quanto concordato, contattaci
        entro 14 giorni dalla consegna via email o WhatsApp.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Resi</h2>
      <p>
        I resi sono accettati per prodotti integri, nella confezione originale e
        con tutti gli accessori. Il cliente è responsabile delle spese di
        spedizione per il reso, salvo diverso accordo in caso di difetto di
        conformità.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Rimborsi</h2>
      <p>
        Una volta ricevuto e verificato il prodotto restituito, il rimborso viene
        effettuato entro 14 giorni lavorativi sullo stesso metodo di pagamento
        utilizzato (bonifico o PayPal), salvo accordi diversi.
      </p>
      <h2 className="text-base font-semibold text-gray-300">Prodotti esclusi</h2>
      <p>
        Software sigillato, prodotti personalizzati o articoli con evidenti segni
        d&apos;uso possono non essere idonei al reso, in conformità alla normativa
        sui beni digitali e alla tutela del consumatore.
      </p>
      <p>
        Per assistenza: elettronica51@hotmail.it — +39 333 521 0878.
      </p>
    </LegalPageShell>
  );
}