import { HeroHome } from "@/components/home/HeroHome";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/marketing/hero-desk-a-480.webp"
        type="image/webp"
      />
      <HeroHome />
    </>
  );
}
