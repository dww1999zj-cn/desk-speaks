"use client";

import { useTranslations } from "next-intl";

interface SiteFooterProps {
  hint?: string;
  className?: string;
}

export function SiteFooter({ hint, className = "" }: SiteFooterProps) {
  const t = useTranslations("common");

  return (
    <p className={`text-center text-xs leading-relaxed text-muted/80 ${className}`}>
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
