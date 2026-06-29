import type { AppLocale } from "@/lib/i18n/locale";
import type { OfficePick, OfficePickCatalog } from "./types";
import { EN_CATALOG } from "./en";
import { ZH_CATALOG } from "./zh";

const catalogs: Record<AppLocale, OfficePickCatalog> = {
  zh: ZH_CATALOG,
  en: EN_CATALOG,
};

export type { OfficePick, OfficePickCatalog } from "./types";

/** 办公好物 / 京东推广仅中文版开放 */
export function isOfficePicksEnabled(locale: AppLocale): boolean {
  return locale === "zh";
}

export function getOfficePickCatalog(locale: AppLocale): OfficePickCatalog {
  return catalogs[locale] ?? catalogs.zh;
}

export function getOfficePicksByCategory(
  locale: AppLocale,
  category: string
): OfficePick[] {
  return getOfficePickCatalog(locale).picks.filter(
    (pick) => pick.category === category
  );
}

// Legacy re-exports (zh)
export {
  OFFICE_PICKS,
  OFFICE_PICK_CATEGORIES,
  OFFICE_PICK_DISCLOSURE,
  OFFICE_PICK_INTRO,
} from "./zh";
