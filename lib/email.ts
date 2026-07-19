export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; provider: "resend" | "postmark" }
  | { ok: false; error: string };

type EmailProvider = "resend" | "postmark";

function getConfiguredProviders(): EmailProvider[] {
  const preferred = (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase();
  const providers: EmailProvider[] = [];

  if (preferred === "postmark") {
    providers.push("postmark", "resend");
  } else {
    providers.push("resend", "postmark");
  }

  return providers;
}

function getFromAddress(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  return from || null;
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getFromAddress();

  if (!apiKey || !from) {
    return { ok: false, error: "Resend is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      reply_to: input.replyTo,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `Resend request failed (${response.status})` };
  }

  return { ok: true, provider: "resend" };
}

async function sendViaPostmark(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.POSTMARK_SERVER_TOKEN?.trim();
  const from = getFromAddress();

  if (!apiKey || !from) {
    return { ok: false, error: "Postmark is not configured" };
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiKey,
    },
    body: JSON.stringify({
      From: from,
      To: input.to,
      Subject: input.subject,
      TextBody: input.text,
      ReplyTo: input.replyTo,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `Postmark request failed (${response.status})` };
  }

  return { ok: true, provider: "postmark" };
}

const providerSenders: Record<EmailProvider, (input: SendEmailInput) => Promise<SendEmailResult>> = {
  resend: sendViaResend,
  postmark: sendViaPostmark,
};

export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const providers = getConfiguredProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result = await providerSenders[provider](input);
      if (result.ok) {
        return result;
      }
      errors.push(result.error);
    } catch {
      errors.push(`${provider} request failed`);
    }
  }

  return {
    ok: false,
    error: errors.length > 0 ? errors.join("; ") : "No email provider configured",
  };
}
