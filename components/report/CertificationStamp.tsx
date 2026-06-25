"use client";

export function CertificationStamp({ className = "" }: { className?: string }) {
  const date = new Date()
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");

  return (
    <div
      className={`pointer-events-none select-none animate-stamp-in ${className}`}
      aria-hidden
    >
      <div className="relative flex h-[5.5rem] w-[5.5rem] rotate-12 flex-col items-center justify-center rounded-full border-[3px] border-primary/70 bg-white/90 shadow-md shadow-primary/20">
        <div className="absolute inset-1 rounded-full border border-dashed border-primary/40" />
        <span className="relative text-[9px] font-bold tracking-wider text-primary">
          工位牛马
        </span>
        <span className="relative text-sm font-bold text-primary">鉴定通过</span>
        <span className="relative mt-0.5 text-[8px] text-muted">{date}</span>
      </div>
    </div>
  );
}
