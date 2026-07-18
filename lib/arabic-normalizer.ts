export function normalizeArabic(text: string): string {
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى\b/g, "ي")
    .replace(/ة\b/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}
