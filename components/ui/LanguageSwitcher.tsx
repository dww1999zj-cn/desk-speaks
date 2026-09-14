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
      className="relative z-30 inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/15"
      aria-label={label}
    >
      {label}
    </button>
  );
}
