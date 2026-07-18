import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function scrubObject(obj: Record<string, unknown>) {
  const sensitiveKey = /(email|password|token|secret|authorization|bearer)/i;
  for (const key of Object.keys(obj)) {
    try {
      if (sensitiveKey.test(key)) {
        (obj as Record<string, unknown>)[key] = "[REDACTED]";
        continue;
      }
      const val = obj[key];
      if (typeof val === "string") {
        if (sensitiveKey.test(val)) (obj as Record<string, unknown>)[key] = "[REDACTED]";
      } else if (isRecord(val)) {
        scrubObject(val);
      }
    } catch (e) {
      void e;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const beforeSend = (event: any, _hint?: any) => {
  void _hint;
  try {
    const ev = event as { user?: unknown; tags?: unknown; contexts?: unknown; extra?: unknown; request?: unknown; breadcrumbs?: unknown[] };
    if (ev.user) {
      const maybeUser = ev.user as unknown as Record<string, unknown>;
      if (typeof maybeUser["email"] === "string") maybeUser["email"] = "[REDACTED]";
      if (typeof maybeUser["ip_address"] === "string") maybeUser["ip_address"] = "[REDACTED]";
    }

    if (isRecord(ev.tags)) scrubObject(ev.tags as Record<string, unknown>);
    if (isRecord(ev.contexts)) scrubObject(ev.contexts as Record<string, unknown>);
    if (isRecord(ev.extra)) scrubObject(ev.extra as Record<string, unknown>);

    const maybeRequest = ev.request;
    if (isRecord(maybeRequest)) scrubObject(maybeRequest as Record<string, unknown>);

    const breadcrumbs = ev.breadcrumbs;
    if (Array.isArray(breadcrumbs)) {
      for (const b of breadcrumbs) {
        const data = (b as unknown as { data?: unknown }).data;
        if (isRecord(data)) scrubObject(data as Record<string, unknown>);
        const message = (b as unknown as { message?: unknown }).message;
        if (typeof message === "string" && /(email|password|token|secret|authorization|bearer)/i.test(message)) {
          (b as unknown as { message?: string }).message = "[REDACTED]";
        }
      }
    }
  } catch (e) {
    void e;
  }
  return event as unknown;
};

if (isProd) {
  Sentry.init({
    dsn: "https://a9af2dd2095780e646a7db4a8f786727@o4511753984278528.ingest.us.sentry.io/4511754036117504",
    sendDefaultPii: false,
    tracesSampleRate: 0.0,
    enabled: true,
  });

  // Register a global event processor to scrub PII before sending
  try {
    const maybe = Sentry as unknown as { addGlobalEventProcessor?: (fn: (ev: unknown) => unknown) => void; addEventProcessor?: (fn: (ev: unknown) => unknown) => void };
    if (typeof maybe.addGlobalEventProcessor === "function") {
      maybe.addGlobalEventProcessor((event: unknown) => beforeSend(event));
    } else if (typeof maybe.addEventProcessor === "function") {
      maybe.addEventProcessor((event: unknown) => beforeSend(event));
    }
  } catch (e) {
    void e;
  }
} else {
  Sentry.init({ enabled: false });
}
