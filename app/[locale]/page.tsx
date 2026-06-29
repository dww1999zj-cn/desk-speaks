import { GradientBackground } from "@/components/ui/GradientBackground";
import { HomeCta } from "@/components/home/HomeCta";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { PageTopRow } from "@/components/ui/PageTopRow";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <GradientBackground>
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-6 pb-10 pt-14 safe-bottom">
        <div className="pointer-events-none absolute -right-6 top-20 text-5xl opacity-40 max-md:opacity-30 md:animate-float-cute">
          🐮
        </div>
        <div className="pointer-events-none absolute left-4 top-36 text-2xl opacity-30 max-md:hidden md:animate-bounce-cute">
          💻
        </div>
        <div className="pointer-events-none absolute -left-8 bottom-44 hidden h-36 w-36 rounded-full bg-secondary/30 blur-3xl md:block" />
        <div className="pointer-events-none absolute -right-10 bottom-28 hidden h-32 w-32 rounded-full bg-accent/25 blur-3xl md:block" />

        <header className="relative">
          <PageTopRow
            left={
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                <span>🐮</span>
                {t("badge")}
              </p>
            }
          />
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {t("lead1")}
            <br />
            {t("lead2")}
          </p>
          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.08] tracking-tight text-text">
            {t("titleLine1")}
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t("titleLine2")}
            </span>
          </h1>
        </header>

        <section className="relative mt-10 pointer-events-none">
          <div className="relative mx-auto h-[220px] w-full max-w-[300px]">
            <div className="absolute left-0 top-0 w-[88%] rotate-[-6deg] rounded-3xl border-2 border-white bg-white/90 px-4 py-3 shadow-lg shadow-secondary/25">
              <p className="text-xs text-muted">{t("demoAgeLabel")}</p>
              <p className="text-2xl font-bold text-primary">{t("demoAge")}</p>
            </div>
            <div className="absolute right-0 top-10 w-[88%] rotate-[4deg] rounded-3xl border-2 border-white bg-white px-4 py-3 shadow-lg shadow-primary/15">
              <p className="text-xs text-muted">{t("demoMbtiLabel")}</p>
              <p className="text-lg font-bold text-text">INFP</p>
            </div>
            <div className="absolute bottom-0 left-4 w-[90%] rounded-3xl border-2 border-white bg-card-gradient px-4 py-3 shadow-lg shadow-accent/20">
              <p className="text-xs text-muted">{t("demoZodiacLabel")}</p>
              <p className="text-sm font-medium text-text">{t("demoZodiacText")}</p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-muted">
            {t("ctaDesc1")}
            <br />
            {t("ctaDesc2")}
          </p>
        </section>

        <footer className="relative z-20 mt-auto pt-8">
          <HomeCta />
          <SiteFooter className="mt-3" />
        </footer>
      </main>
    </GradientBackground>
  );
}
