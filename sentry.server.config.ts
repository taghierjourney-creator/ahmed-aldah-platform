// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

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
      // ignore scrub errors
      void e;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function beforeSend(event: any): any | null {
  try {
    const ev = event as { user?: unknown; tags?: unknown; contexts?: unknown; extra?: unknown; request?: unknown; breadcrumbs?: unknown[] };
    // redact user identifiers
    if (ev.user) {
      const user = ev.user as unknown as Record<string, unknown>;
      if (typeof user.email === "string") user.email = "[REDACTED]";
      if (typeof user.ip_address === "string") user.ip_address = "[REDACTED]" as unknown as string;
    }

    // scrub tags, contexts, extra
    if (isRecord(ev.tags)) scrubObject(ev.tags as Record<string, unknown>);
    if (isRecord(ev.contexts)) scrubObject(ev.contexts as Record<string, unknown>);
    if (isRecord(ev.extra)) scrubObject(ev.extra as Record<string, unknown>);

    // scrub request data if present
    const maybeRequest = ev.request;
    if (isRecord(maybeRequest)) scrubObject(maybeRequest as Record<string, unknown>);

    // scrub breadcrumbs
    if (Array.isArray(ev.breadcrumbs)) {
      for (const b of ev.breadcrumbs) {
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
}

if (isProd) {
  Sentry.init({
    dsn: "https://a9af2dd2095780e646a7db4a8f786727@o4511753984278528.ingest.us.sentry.io/4511754036117504",
    sendDefaultPii: false,
    tracesSampleRate: 0.0,
    enabled: true,
  });

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
  // initialize a no-op Sentry in non-prod to avoid runtime errors
  Sentry.init({ enabled: false });
}
