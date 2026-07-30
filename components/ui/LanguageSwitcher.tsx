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

  const switchLocale = () => {
    router.replace(pathname || "/", { locale: nextLocale });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="relative z-30 inline-flex shrink-0 items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-text shadow-sm transition-colors hover:bg-surface"
      aria-label={label}
    >
      {label}
    </button>
  );
}
