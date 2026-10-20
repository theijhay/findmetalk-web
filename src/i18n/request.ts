import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE, mergeMessages, pickLocale } from "@/i18n/locales";

export default getRequestConfig(async () => {
  const [jar, headerList] = await Promise.all([cookies(), headers()]);
  const locale = pickLocale(jar.get(LOCALE_COOKIE)?.value, headerList.get("accept-language"));

  const english = (await import("../../messages/en.json")).default;
  const own = locale === "en" ? {} : (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages: mergeMessages(english, own) };
});
