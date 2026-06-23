import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <GradientBackground>
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col overflow-hidden px-6 pb-10 pt-14 safe-bottom">
        {/* 装饰 */}
        <div className="pointer-events-none absolute -right-8 top-24 h-40 w-40 rounded-full bg-secondary/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-40 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />

        <header
          className="relative animate-fade-in-up opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <p className="text-[15px] leading-relaxed text-muted">
            你每天坐在这里。
            <br />
            它可能比任何人都懂你。
          </p>
          <h1 className="mt-5 text-[2.75rem] font-semibold leading-[1.1] tracking-tight text-text">
            你的
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              工位人格
            </span>
          </h1>
        </header>

        {/* 报告预览 */}
        <section
          className="relative mt-10 flex-1 animate-fade-in-up opacity-0"
          style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
        >
          <div className="relative mx-auto h-[220px] w-full max-w-[300px]">
            <div className="absolute left-0 top-0 w-[88%] rotate-[-6deg] rounded-2xl bg-white/80 px-4 py-3 shadow-lg shadow-primary/10 backdrop-blur-sm">
              <p className="text-xs text-muted">工位猜你</p>
              <p className="text-2xl font-semibold text-primary">27 岁</p>
            </div>
            <div className="absolute right-0 top-10 w-[88%] rotate-[4deg] rounded-2xl bg-white px-4 py-3 shadow-lg shadow-primary/10">
              <p className="text-xs text-muted">工位 MBTI</p>
              <p className="text-lg font-semibold text-text">INFP 工位</p>
            </div>
            <div className="absolute bottom-0 left-4 w-[90%] rounded-2xl bg-card-gradient px-4 py-3 shadow-lg shadow-primary/10">
              <p className="text-xs text-muted">工位星座 · 一封信</p>
              <p className="text-sm font-medium text-text">
                天蝎座，想对你说点什么…
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-muted">
            拍张工位照。
            <br />
            看看它眼里的你，是不是你自己。
          </p>
        </section>

        <footer
          className="relative mt-8 animate-fade-in-up opacity-0"
          style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
        >
          <Button href="/upload" size="lg" className="w-full text-base">
            拍一张，让它猜我
          </Button>
          <p className="mt-3 text-center text-xs text-muted/80">
            不用摆拍，真实的工位最好
          </p>
        </footer>
      </main>
    </GradientBackground>
  );
}
