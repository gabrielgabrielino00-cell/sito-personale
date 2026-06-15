import { NextResponse } from "next/server";

const WHATSAPP_PHONE = "393335210878";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function buildWhatsAppFallbackUrl(payload: ContactPayload) {
  const lines = [
    "Ciao Elettronica51!",
    "",
    `Nome: ${payload.name ?? ""}`,
    `Email: ${payload.email ?? ""}`,
    payload.phone ? `Telefono: ${payload.phone}` : null,
    "",
    payload.message ?? "",
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Richiesta non valida." },
      { status: 400 },
    );
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const phone = body.phone?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, message: "Compila nome, email e messaggio." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Indirizzo email non valido." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (webhookResponse.ok) {
        return NextResponse.json({
          ok: true,
          message: "Messaggio inviato. Ti risponderemo al più presto.",
        });
      }
    } catch {
      // fallback below
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "Richiesta registrata. Per una risposta immediata puoi scriverci su WhatsApp.",
    whatsappUrl: buildWhatsAppFallbackUrl({ name, email, phone, message }),
  });
}