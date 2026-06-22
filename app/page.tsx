import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <GradientBackground>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 safe-bottom">
        <header className="animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <p className="text-sm font-medium tracking-widest text-secondary uppercase">
            AI 人格档案
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-text md:text-5xl">
            如果你的
            <br />
            工位会说话
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            上传一张工位照片，让工位用它的视角，
            为你生成一份温暖的人格档案。
          </p>
        </header>

        <section className="mt-10 flex-1 animate-fade-in-up opacity-0" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
          <Card variant="gradient" className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                🪴
              </span>
              <div>
                <p className="font-medium text-text">不是分析工位</p>
                <p className="text-sm text-muted">而是通过工位，看见你</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                ✨
              </span>
              <div>
                <p className="font-medium text-text">温暖 · 洞察 · 有趣</p>
                <p className="text-sm text-muted">像网易云年度报告一样有共鸣</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                📸
              </span>
              <div>
                <p className="font-medium text-text">一张照片就够了</p>
                <p className="text-sm text-muted">物品、布局、痕迹，都是线索</p>
              </div>
            </div>
          </Card>
        </section>

        <footer className="mt-10 animate-fade-in-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
          <Button href="/upload" size="lg" className="w-full">
            上传我的工位
          </Button>
          <p className="mt-4 text-center text-xs text-muted">
            你的照片仅用于生成报告，不会被公开
          </p>
        </footer>
      </main>
    </GradientBackground>
  );
}
