/**
 * Keeps translucent theme colours translucent on Safari before 16.2.
 *
 * Tailwind writes `bg-good/10` as `color-mix(in oklab, var(--good) 10%,
 * transparent)` inside `@supports (color: color-mix(...))`, with the plain
 * `var(--good)` before it for browsers without color-mix(). On those browsers
 * (every iPhone stuck on iOS 15: the 7, 6s and first SE) the tint renders as
 * the solid colour: a "Connected" badge becomes green text on a green block,
 * and a platform logo vanishes into its own brand colour.
 *
 * Listed before Tailwind in postcss.config.mjs, and works in two passes:
 *
 * 1. `Once`, before Tailwind's own `Once`: every custom property set to a hex
 *    colour gains a `--name-rgb` twin holding its channels, in the same block,
 *    so light and dark themes both carry one. Read here, as written, because
 *    Tailwind's optimiser later rewrites `#ff0000` as `red`.
 * 2. `OnceExit`, after Tailwind has generated the utilities: each translucent
 *    utility on a token with a twin gets the fallback
 *    `rgb(var(--name-rgb) / 10%)`, which Safari has understood for years.
 *    Tokens that are not plain hex keep Tailwind's fallback.
 *
 * One plugin rather than one on each side of Tailwind: Turbopack loads only
 * the first local plugin a PostCSS config lists.
 */

const COLOR_MIX_SUPPORTS = "color-mix(in lab, red, red)";
const MIX = /^color-mix\(in oklab, var\((--[\w-]+)\) (\d+(?:\.\d+)?)%, transparent\)$/;

function hexChannels(value) {
  const hex = value.trim().toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)?.[1];
  if (!hex) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)).join(" ");
}

const colorMixFallback = () => ({
  postcssPlugin: "findmetalk-color-mix-fallback",
  Once(root) {
    root.walkDecls(/^--[\w-]+$/, (decl) => {
      if (decl.prop.endsWith("-rgb")) return;
      const channels = hexChannels(decl.value);
      if (channels) decl.cloneAfter({ prop: `${decl.prop}-rgb`, value: channels });
    });
  },
  OnceExit(root) {
    const withChannels = new Set();
    root.walkDecls(/^--[\w-]+-rgb$/, (decl) => {
      withChannels.add(decl.prop.slice(0, -"-rgb".length));
    });

    root.walkAtRules("supports", (supports) => {
      if (!supports.params.includes(COLOR_MIX_SUPPORTS)) return;
      supports.walkDecls((mixed) => {
        const match = mixed.value.match(MIX);
        if (!match || !withChannels.has(match[1])) return;
        const value = `rgb(var(${match[1]}-rgb) / ${match[2]}%)`;
        // Added just before the @supports block rather than edited in place:
        // Tailwind merges identical fallbacks (`.bg-good,.bg-good\/10`), so
        // editing one would tint the solid class too. Later in the cascade, it
        // overrides the solid fallback, and the color-mix() after it still
        // wins wherever color-mix() works.
        if (mixed.parent === supports) {
          // Nested (development): the @supports block sits inside the rule.
          supports.before({ prop: mixed.prop, value });
        } else {
          // Flattened (production): the @supports block wraps a copy of the rule.
          supports.before(mixed.parent.clone({ nodes: [] }).append({ prop: mixed.prop, value }));
        }
      });
    });
  },
});
colorMixFallback.postcss = true;

export default colorMixFallback;
