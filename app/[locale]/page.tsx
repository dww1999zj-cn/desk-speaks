import { HeroHome } from "@/components/home/HeroHome";
import { setRequestLocale } from "next-intl/server";
import {
  MARKETING_DESK_AFTER,
  MARKETING_DESK_BEFORE,
} from "@/lib/marketing-assets";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <link rel="preload" as="image" href={MARKETING_DESK_AFTER} type="image/webp" fetchPriority="high" />
      <link rel="preload" as="image" href={MARKETING_DESK_BEFORE} type="image/webp" />
      <HeroHome />
    </>
  );
}
