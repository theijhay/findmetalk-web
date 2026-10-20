import { getTranslations } from "next-intl/server";

import { SITE } from "@/config/site";

// Placeholder landing page (spec 7.1 step 1). The real one comes with the
// design system: one-sentence promise, one primary button.
export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">{SITE.name}</h1>
      <p className="max-w-sm text-ink-secondary">{t("title")}</p>
      <a
        href="#"
        className="inline-flex min-h-target items-center justify-center rounded-[var(--radius-control)] bg-accent px-6 font-medium text-on-accent"
      >
        {t("enter")}
      </a>
    </main>
  );
}
