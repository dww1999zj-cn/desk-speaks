"use client";

import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { OfficePickCard } from "@/components/recommend/OfficePickCard";
import {
  OFFICE_PICK_CATEGORIES,
  OFFICE_PICK_DISCLOSURE,
  OFFICE_PICK_INTRO,
  getOfficePicksByCategory,
} from "@/lib/office-picks";

export default function RecommendPage() {
  const router = useRouter();

  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-10 safe-bottom">
        <header>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 rounded-full bg-white/70 px-3 py-1.5 text-sm text-muted shadow-sm hover:text-text"
          >
            ← 返回
          </button>
          <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-text">
            {OFFICE_PICK_INTRO.badge}
          </p>
          <h1 className="text-2xl font-bold text-text">{OFFICE_PICK_INTRO.title}</h1>
          <p className="mt-2 leading-relaxed text-muted">
            {OFFICE_PICK_INTRO.subtitle}
          </p>
        </header>

        <div className="mt-6 space-y-8 flex-1">
          {OFFICE_PICK_CATEGORIES.map((category) => {
            const picks = getOfficePicksByCategory(category);
            if (picks.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-primary">
                  {category}
                </h2>
                <div className="space-y-3">
                  {picks.map((pick) => (
                    <OfficePickCard key={pick.id} pick={pick} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-white/60 px-4 py-3 text-center text-xs leading-relaxed text-muted">
          {OFFICE_PICK_DISCLOSURE}
        </div>

        <SiteFooter className="mt-6" />
      </main>
    </GradientBackground>
  );
}
