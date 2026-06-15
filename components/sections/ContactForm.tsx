"use client";

import { useState, type FormEvent } from "react";

type ContactFormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  whatsappUrl?: string;
};

export default function ContactForm() {
  const [state, setState] = useState<ContactFormState>({
    status: "idle",
    message: "",
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({ status: "loading", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        whatsappUrl?: string;
      };

      if (!response.ok || !data.ok) {
        setState({
          status: "error",
          message: data.message ?? "Invio non riuscito. Riprova.",
          whatsappUrl: data.whatsappUrl,
        });
        return;
      }

      setState({
        status: "success",
        message: data.message ?? "Messaggio inviato. Ti risponderemo al più presto.",
        whatsappUrl: data.whatsappUrl,
      });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "Errore di rete. Puoi contattarci via WhatsApp.",
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="Nome"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Telefono (opzionale)"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600"
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Il tuo messaggio"
        className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-gray-300 placeholder:text-gray-600"
      />
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {state.status === "loading" ? "Invio in corso…" : "Invia messaggio"}
      </button>
      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "success" ? "text-green-400" : "text-gray-500"
          }`}
        >
          {state.message}
          {state.whatsappUrl ? (
            <>
              {" "}
              <a
                href={state.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:text-brand-dark"
              >
                Scrivici su WhatsApp
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}