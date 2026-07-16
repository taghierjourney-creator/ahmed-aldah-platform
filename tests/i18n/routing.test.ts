import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import {
  defaultLocale,
  getDirection,
  getLocalePathPrefix,
  hasLocalePrefix,
  isLocale,
  resolveLocaleFromPathname,
  shouldDetectLocaleFromHeader,
} from "@/lib/locale";

describe("locale routing", () => {
  it("defaults to Arabic without a URL prefix", () => {
    expect(routing.defaultLocale).toBe("ar");
    expect(routing.localePrefix).toBe("as-needed");
    expect(routing.localeDetection).toBe(false);
  });

  it("resolves locale from pathname segments", () => {
    expect(resolveLocaleFromPathname("/")).toBe("ar");
    expect(resolveLocaleFromPathname("/about")).toBe("ar");
    expect(resolveLocaleFromPathname("/en")).toBe("en");
    expect(resolveLocaleFromPathname("/en/about")).toBe("en");
    expect(resolveLocaleFromPathname("/fr")).toBe("fr");
    expect(resolveLocaleFromPathname("/fr/about")).toBe("fr");
  });

  it("maps text direction per locale", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("fr")).toBe("ltr");
  });

  it("prefixes only non-default locales", () => {
    expect(defaultLocale).toBe("ar");
    expect(hasLocalePrefix("ar")).toBe(false);
    expect(hasLocalePrefix("en")).toBe(true);
    expect(hasLocalePrefix("fr")).toBe(true);
    expect(getLocalePathPrefix("ar")).toBe("");
    expect(getLocalePathPrefix("en")).toBe("/en");
    expect(getLocalePathPrefix("fr")).toBe("/fr");
  });

  it("disables accept-language based detection", () => {
    expect(shouldDetectLocaleFromHeader()).toBe(false);
    expect(routing.localeDetection).toBe(false);
  });

  it("validates supported locale values", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("de")).toBe(false);
  });
});
