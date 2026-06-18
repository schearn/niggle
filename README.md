# niggle.work

Brochure site for **Niggle** — small, bespoke software tools for small businesses.
*Tiny fixes. Big difference.*

A static, single-page site. No build step, no dependencies.

## Files
- `index.html` — the page
- `styles.css` — styling (palette + type as CSS variables)
- `script.js` — mobile nav + the before/after squiggle animation
- `favicon.svg` — the "n" mark with the orange dot

## Brand
- **Fonts:** Space Grotesk (headings), Inter (body) — loaded from Google Fonts
- **Palette:**
  | role | name | hex |
  |---|---|---|
  | canvas | Palladian | `#EEE9DF` |
  | ink / dark | Abyssal | `#1B2632` |
  | secondary dark | Blue Fantastic | `#2C3B4D` |
  | accent / CTA | Burning Flame | `#FFB162` |
  | accent (sparing) | Truffle Trouble | `#A35139` |
  | muted / borders | Oatmeal | `#C9C1B1` |

## Run locally
Open `index.html`, or serve the folder:
```
python3 -m http.server 8000
```

## Deploy
Designed for GitHub Pages — push to a repo and enable Pages on the default branch
(root). Point the `niggle.work` domain at it via a `CNAME` file when ready.
