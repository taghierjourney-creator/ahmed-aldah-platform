"use server";

import { headers } from "next/headers";

import { sendTransactionalEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { isLocale, type Locale } from "@/lib/locale";

export type ContactField = "name" | "email" | "phone" | "subject" | "message";

export type ContactValidationErrorKey =
  | "required"
  | "tooShort"
  | "tooLong"
  | "invalidEmail"
  | "invalidPhone";

export type ContactFormInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  locale: string;
};

export type ContactActionResult =
  | { success: true }
  | {
      success: false;
      errorCode: "validation" | "rate_limit" | "email_failed";
      fieldErrors?: Partial<Record<ContactField, ContactValidationErrorKey>>;
    };

const LIMITS = {
  name: { min: 2, max: 100 },
  subject: { min: 3, max: 200 },
  message: { min: 10, max: 5000 },
  phone: { max: 30 },
} as const;

const IP_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000 };
const EMAIL_RATE_LIMIT = { maxRequests: 3, windowMs: 60 * 60 * 1000 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.-]{6,30}$/;

function sanitizeText(value: string, maxLength: number): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value: string): string {
  return sanitizeText(value, 254).toLowerCase();
}

function validateContactInput(input: ContactFormInput): {
  data?: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    locale: Locale;
  };
  fieldErrors?: Partial<Record<ContactField, ContactValidationErrorKey>>;
} {
  const fieldErrors: Partial<Record<ContactField, ContactValidationErrorKey>> = {};

  const name = sanitizeText(input.name ?? "", LIMITS.name.max);
  const email = normalizeEmail(input.email ?? "");
  const phoneRaw = sanitizeText(input.phone ?? "", LIMITS.phone.max);
  const subject = sanitizeText(input.subject ?? "", LIMITS.subject.max);
  const message = sanitizeText(input.message ?? "", LIMITS.message.max);
  const locale = isLocale(input.locale) ? input.locale : "ar";

  if (!name) {
    fieldErrors.name = "required";
  } else if (name.length < LIMITS.name.min) {
    fieldErrors.name = "tooShort";
  }

  if (!email) {
    fieldErrors.email = "required";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "invalidEmail";
  }

  if (phoneRaw && !PHONE_PATTERN.test(phoneRaw)) {
    fieldErrors.phone = "invalidPhone";
  }

  if (!subject) {
    fieldErrors.subject = "required";
  } else if (subject.length < LIMITS.subject.min) {
    fieldErrors.subject = "tooShort";
  }

  if (!message) {
    fieldErrors.message = "required";
  } else if (message.length < LIMITS.message.min) {
    fieldErrors.message = "tooShort";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    data: {
      name,
      email,
      phone: phoneRaw,
      subject,
      message,
      locale,
    },
  };
}

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

function buildEmailBody(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  locale: Locale;
}): string {
  const lines = [
    "New contact form submission — Ahmed Al-Dah Office",
    "",
    `Locale: ${data.locale}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "(not provided)"}`,
    `Subject: ${data.subject}`,
    "",
    "Message:",
    data.message,
  ];

  return lines.join("\n");
}

export async function submitContactForm(input: ContactFormInput): Promise<ContactActionResult> {
  const validation = validateContactInput(input);

  if (validation.fieldErrors) {
    return {
      success: false,
      errorCode: "validation",
      fieldErrors: validation.fieldErrors,
    };
  }

  const data = validation.data!;
  const clientIp = await getClientIp();

  const ipLimit = checkRateLimit(`contact:ip:${clientIp}`, IP_RATE_LIMIT);
  const emailLimit = checkRateLimit(`contact:email:${data.email}`, EMAIL_RATE_LIMIT);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return {
      success: false,
      errorCode: "rate_limit",
    };
  }

  const inbox = process.env.CONTACT_INBOX_EMAIL?.trim() || "ahmed.eddaht@gmail.com";

  const emailResult = await sendTransactionalEmail({
    to: inbox,
    subject: `[Ahmed Al-Dah Office] ${data.subject}`,
    text: buildEmailBody(data),
    replyTo: data.email,
  });

  if (!emailResult.ok) {
    return {
      success: false,
      errorCode: "email_failed",
    };
  }

  return { success: true };
}
