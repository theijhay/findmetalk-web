import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SITE } from "@/config/site";
import { DesignSystemPreview } from "@/features/preview/components/design-system-preview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preview");
  return {
    title: t("title", { appName: SITE.name }),
    robots: { index: false, follow: false },
  };
}

export default function PreviewPage() {
  return <DesignSystemPreview />;
}
