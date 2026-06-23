import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <GradientBackground>
      <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col overflow-hidden px-6 pb-10 pt-14 safe-bottom">
        <div className="pointer-events-none absolute -right-6 top-20 text-5xl opacity-40 animate-float-cute">
          🐮
        </div>
        <div className="pointer-events-none absolute left-4 top-36 text-2xl opacity-30 animate-bounce-cute">
          💻
        </div>
        <div className="pointer-events-none absolute -left-8 bottom-44 h-36 w-36 rounded-full bg-secondary/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-28 h-32 w-32 rounded-full bg-accent/25 blur-3xl" />

        <header
          className="relative animate-fade-in-up opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-primary shadow-sm">
            <span>🐮</span>
            工位小牛马上线
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            你每天坐在这里。
            <br />
            桌上的小牛马，可能比你更懂你。
          </p>
          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.08] tracking-tight text-text">
            你的
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              工位人格
            </span>
          </h1>
        </header>

        <section
          className="relative mt-10 flex-1 animate-fade-in-up opacity-0"
          style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
        >
          <div className="relative mx-auto h-[220px] w-full max-w-[300px]">
            <div className="absolute left-0 top-0 w-[88%] rotate-[-6deg] rounded-3xl border-2 border-white bg-white/90 px-4 py-3 shadow-lg shadow-secondary/25">
              <p className="text-xs text-muted">工位猜你</p>
              <p className="text-2xl font-bold text-primary">27 岁</p>
            </div>
            <div className="absolute right-0 top-10 w-[88%] rotate-[4deg] rounded-3xl border-2 border-white bg-white px-4 py-3 shadow-lg shadow-primary/15">
              <p className="text-xs text-muted">工位 MBTI</p>
              <p className="text-lg font-bold text-text">INFP 工位</p>
            </div>
            <div className="absolute bottom-0 left-4 w-[90%] rounded-3xl border-2 border-white bg-card-gradient px-4 py-3 shadow-lg shadow-accent/20">
              <p className="text-xs text-muted">工位星座 · 一封信</p>
              <p className="text-sm font-medium text-text">
                天蝎座，想对你说点什么…
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-muted">
            拍张工位照，交给通义千问。
            <br />
            看看它眼里的你，像不像你自己。
          </p>
        </section>

        <footer
          className="relative mt-8 animate-fade-in-up opacity-0"
          style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
        >
          <Button href="/upload" size="lg" className="w-full text-base">
            拍张工位照，开始猜我 🐮
          </Button>
          <p className="mt-3 text-center text-xs text-muted/80">
            上传你日常办公桌面，不用摆拍
          </p>
        </footer>
      </main>
    </GradientBackground>
  );
}
