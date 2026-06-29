import { routing, type AppLocale } from "@/i18n/routing";

export type { AppLocale };

export const locales = routing.locales;

export function isAppLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

export function resolveLocale(value: unknown): AppLocale {
  if (typeof value === "string" && isAppLocale(value)) return value;
  return routing.defaultLocale;
}
