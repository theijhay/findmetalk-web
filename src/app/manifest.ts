import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";

/**
 * What makes the app installable (spec 9.6). `id` is pinned so a later change
 * to `start_url` updates the installed app instead of adding a second one.
 * Icons arrive with the design system; until then browsers install with a
 * generic icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE.name,
    short_name: SITE.name,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#f7f6f3",
    icons: [],
  };
}
