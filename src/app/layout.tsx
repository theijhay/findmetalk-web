import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import localFont from "next/font/local";

import { Providers } from "@/components/providers";
import { SITE } from "@/config/site";
import { ServiceWorkerRegistration } from "@/features/pwa/components/service-worker-registration";
import { APPEARANCE_BOOTSTRAP_SCRIPT } from "@/lib/theme";

import "./globals.css";

const appSans = localFont({
  src: "./fonts/NotoSans-Variable.woff2",
  variable: "--font-app-sans",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1319" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    metadataBase: new URL(SITE.url),
    title: { default: SITE.name, template: `%s · ${SITE.name}` },
    description: t("description"),
    appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${appSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
