"use client";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface PageTopRowProps {
  left?: React.ReactNode;
  className?: string;
}

/** 顶栏：左侧 badge/返回等，右侧语言切换，垂直居中对齐 */
export function PageTopRow({ left, className = "" }: PageTopRowProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">{left ?? <span aria-hidden className="block h-7" />}</div>
      <LanguageSwitcher />
    </div>
  );
}
