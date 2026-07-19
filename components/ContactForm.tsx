"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";

import {
  submitContactForm,
  type ContactActionResult,
  type ContactField,
  type ContactFormInput,
  type ContactValidationErrorKey,
} from "@/actions/contact";
import type { Locale } from "@/lib/locale";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FieldErrors = Partial<Record<ContactField, ContactValidationErrorKey>>;

type ToastState = {
  type: "success" | "error" | "rate_limit";
} | null;

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d\s.-]{6,30}$/;

function validateClientSide(values: FormState): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "required";
  } else if (name.length < 2) {
    errors.name = "tooShort";
  }

  if (!email) {
    errors.email = "required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "invalidEmail";
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "invalidPhone";
  }

  if (!subject) {
    errors.subject = "required";
  } else if (subject.length < 3) {
    errors.subject = "tooShort";
  }

  if (!message) {
    errors.message = "required";
  } else if (message.length < 10) {
    errors.message = "tooShort";
  }

  return errors;
}

export default function ContactForm() {
  const locale = useLocale() as Locale;
  const t = useTranslations("ContactForm");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [isPending, startTransition] = useTransition();

  const inputClassName = useMemo(
    () =>
      "w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-start text-base text-foreground shadow-sm outline-none transition focus:border-emerald-600/70 focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60",
    [],
  );

  const errorClassName = "mt-2 text-sm text-red-600 dark:text-red-400";

  const getFieldErrorMessage = useCallback(
    (field: ContactField, errorKey?: ContactValidationErrorKey) => {
      if (!errorKey) {
        return null;
      }
      return t(`validation.${errorKey}`);
    },
    [t],
  );

  const handleChange = (field: ContactField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (toast) {
      setToast(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToast(null);

    const clientErrors = validateClientSide(form);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    const payload: ContactFormInput = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      subject: form.subject,
      message: form.message,
      locale,
    };

    startTransition(async () => {
      let result: ContactActionResult;

      try {
        result = await submitContactForm(payload);
      } catch {
        setToast({ type: "error" });
        return;
      }

      if (result.success) {
        setForm(initialFormState);
        setFieldErrors({});
        setToast({ type: "success" });
        return;
      }

      if (result.errorCode === "validation" && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      if (result.errorCode === "rate_limit") {
        setToast({ type: "rate_limit" });
        return;
      }

      setToast({ type: "error" });
    });
  };

  const toastMessage =
    toast?.type === "success"
      ? t("toast.success")
      : toast?.type === "rate_limit"
        ? t("toast.rateLimit")
        : toast?.type === "error"
          ? t("toast.error")
          : null;

  return (
    <section className="rounded-[2rem] border border-foreground/10 bg-card p-8 sm:p-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
          {t("eyebrow")}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-base leading-8 text-foreground/75">{t("description")}</p>
      </div>

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            toast?.type === "success"
              ? "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {toastMessage}
        </div>
      ) : null}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-foreground">
              {t("fields.name.label")}
              <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                {" "}
                *
              </span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              disabled={isPending}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder={t("fields.name.placeholder")}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              className={inputClassName}
            />
            {fieldErrors.name ? (
              <p id="contact-name-error" className={errorClassName}>
                {getFieldErrorMessage("name", fieldErrors.name)}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-foreground">
              {t("fields.email.label")}
              <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                {" "}
                *
              </span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              disabled={isPending}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder={t("fields.email.placeholder")}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              className={inputClassName}
              dir="ltr"
            />
            {fieldErrors.email ? (
              <p id="contact-email-error" className={errorClassName}>
                {getFieldErrorMessage("email", fieldErrors.email)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-foreground">
              {t("fields.phone.label")}
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              disabled={isPending}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder={t("fields.phone.placeholder")}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
              className={inputClassName}
              dir="ltr"
            />
            {fieldErrors.phone ? (
              <p id="contact-phone-error" className={errorClassName}>
                {getFieldErrorMessage("phone", fieldErrors.phone)}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-foreground">
              {t("fields.subject.label")}
              <span className="text-red-600 dark:text-red-400" aria-hidden="true">
                {" "}
                *
              </span>
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              required
              value={form.subject}
              disabled={isPending}
              onChange={(event) => handleChange("subject", event.target.value)}
              placeholder={t("fields.subject.placeholder")}
              aria-invalid={Boolean(fieldErrors.subject)}
              aria-describedby={fieldErrors.subject ? "contact-subject-error" : undefined}
              className={inputClassName}
            />
            {fieldErrors.subject ? (
              <p id="contact-subject-error" className={errorClassName}>
                {getFieldErrorMessage("subject", fieldErrors.subject)}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-foreground">
            {t("fields.message.label")}
            <span className="text-red-600 dark:text-red-400" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            value={form.message}
            disabled={isPending}
            onChange={(event) => handleChange("message", event.target.value)}
            placeholder={t("fields.message.placeholder")}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
            className={`${inputClassName} min-h-[9rem] resize-y`}
          />
          {fieldErrors.message ? (
            <p id="contact-message-error" className={errorClassName}>
              {getFieldErrorMessage("message", fieldErrors.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? t("submitting") : t("submit")}
          </button>
          {isPending ? (
            <p className="text-sm text-foreground/70" role="status" aria-live="polite">
              {t("loading")}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
