"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  const nextLocale = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? t("languageSwitch") : t("languageSwitchToZh");

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className="inline-flex shrink-0 items-center rounded-full border border-white/90 bg-white/70 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-white"
      aria-label={label}
    >
      {label}
    </button>
  );
}
