"use client";

import { useTranslations } from "next-intl";

interface SiteFooterProps {
  hint?: string;
  className?: string;
}

export function SiteFooter({ hint, className = "" }: SiteFooterProps) {
  const t = useTranslations("common");

  return (
    <p className={`text-center text-xs leading-relaxed ${className || "text-white/40"}`}>
      {hint && (
        <>
          {hint}
          <br />
        </>
      )}
      {t("footer")}
    </p>
  );
}
