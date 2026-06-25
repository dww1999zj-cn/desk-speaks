import { SITE_FOOTER } from "@/lib/site-copy";

interface SiteFooterProps {
  hint?: string;
  className?: string;
}

export function SiteFooter({ hint, className = "" }: SiteFooterProps) {
  return (
    <p className={`text-center text-xs leading-relaxed text-muted/80 ${className}`}>
      {hint && (
        <>
          {hint}
          <br />
        </>
      )}
      {SITE_FOOTER}
    </p>
  );
}
