# Self-hosted Typeface: Noto Sans Variable

- **File:** `NotoSans-Variable.woff2`
- **Size:** `68,628` bytes
- **SHA-256:** `0aaad2682589cad9f21b1e9e100262efab372ac8a4f69d83f9d743768c1973c0`
- **Family:** Noto Sans (variable weight `100` to `900`, normal width `100%`)
- **Upstream project:** https://github.com/notofonts/latin-greek-cyrillic (`NotoSans` v2.015, served by Google Fonts `notosans/v42`)
- **License:** SIL Open Font License 1.1 (`./OFL.txt`)

## Why a single unified subset

Standard pre-split packages (such as Fontsource) split Latin into separate `latin`, `latin-ext`, and `vietnamese` files, placing Hausa hooked letters (`ɓ, ɗ, ƙ, ƴ`) in `latin-ext` and Yoruba/Igbo sub-dotted vowels (`ẹ, ọ, ị, ụ`) in `vietnamese`. `NotoSans-Variable.woff2` is a single unified variable WOFF2 containing all `549` codepoints needed for English, Nigerian Pidgin, Yoruba, Hausa, Igbo, and French in one file (`tests/design-system.test.ts` verifies every required codepoint against the font's `cmap` table).

## Exact reproduction steps

Run the following script with Python 3 and `curl` to reproduce `src/app/fonts/NotoSans-Variable.woff2`:

```bash
python3 - <<'PY'
import hashlib, re, subprocess, urllib.parse

ranges = (
    list(range(0x20, 0x7F)) +
    list(range(0xA0, 0x180)) +
    [0x0181, 0x018A, 0x018E, 0x0190, 0x0198, 0x0199, 0x01B3, 0x01B4, 0x01DD, 0x01F8, 0x01F9] +
    [0x0253, 0x0254, 0x0256, 0x0257, 0x0259, 0x025B, 0x0272, 0x028B, 0x0294] +
    [0x02BB, 0x02BC, 0x02C6, 0x02C7, 0x02C9, 0x02D8, 0x02D9, 0x02DA, 0x02DB, 0x02DC, 0x02DD] +
    list(range(0x0300, 0x0332)) +
    [0x1E0C, 0x1E0D, 0x1E24, 0x1E25, 0x1E36, 0x1E37, 0x1E42, 0x1E43, 0x1E44, 0x1E45, 0x1E46, 0x1E47,
     0x1E5A, 0x1E5B, 0x1E62, 0x1E63, 0x1E6C, 0x1E6D, 0x1E80, 0x1E81, 0x1E82, 0x1E83, 0x1E84, 0x1E85, 0x1E9E] +
    list(range(0x1EA0, 0x1F00)) +
    [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E,
     0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2032, 0x2033, 0x2039, 0x203A, 0x2044,
     0x20A6, 0x20AC, 0x2116, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x25CC]
)
text = "".join(chr(c) for c in sorted(set(ranges)))
query = urllib.parse.quote(text)
css_url = f"https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400..700&text={query}&display=swap"
ua = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
css = subprocess.check_output(["curl", "-4", "-sS", "-A", ua, css_url], text=True)
woff2_url = re.findall(r"url\((https://[^)]+)\)", css)[0]
out_path = "src/app/fonts/NotoSans-Variable.woff2"
subprocess.run(["curl", "-4", "-sS", "-o", out_path, woff2_url], check=True)
with open(out_path, "rb") as f:
    print("SHA-256:", hashlib.sha256(f.read()).hexdigest())
PY
```
