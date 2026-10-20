import { getTranslations } from "next-intl/server";

import { SITE } from "@/config/site";

// Stored by the service worker when it installs and shown for any page that
// cannot load without a connection. It needs no API and no session, and works
// before any JavaScript runs. Built for English: the stored copy is the same
// for everyone.
export const dynamic = "force-static";

export async function generateMetadata() {
  const t = await getTranslations({ locale: "en", namespace: "offline" });
  return { title: t("title") };
}

export default async function OfflinePage() {
  const t = await getTranslations({ locale: "en", namespace: "offline" });
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-ink-secondary">{t("body", { appName: SITE.name })}</p>
      {/* A plain link: it reloads the page, even if no script ever loaded. */}
      <a
        href=""
        className="mt-3 inline-flex min-h-target items-center justify-center rounded-[var(--radius-control)] bg-accent px-6 font-medium text-on-accent"
      >
        {t("retry")}
      </a>
    </main>
  );
}
