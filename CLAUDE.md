# CLAUDE.md — Nikhil Rana Portfolio (v2)

Personal portfolio of **Nikhil Rana** — Computer Science student & web developer from Ranchi, Jharkhand, India.
Static site: vanilla **HTML + CSS + JS**, no build step, no framework. Deploy to GitHub Pages / Netlify / Vercel as-is.

## Sources of truth
| File | Role |
|------|------|
| `Nikhil-Rana-Portfolio.zip` | Old v1 site (dark navy theme, Poppins). **Content source only** — copy, links, projects. Do not reuse its look. |
| `therishithakor.com-design.md` | **Visual source of truth.** Warm-neutral, editorial, Onest-only design spec. All UI must follow it. |
| `tokens.css` | Design tokens derived from the design spec. Components use tokens only — never raw hex/px. |

## File structure
```
index.html     # all sections
tokens.css     # color / type / space / radius / shadow tokens (+ dark mode)
style.css      # components + layout, references tokens only
script.js      # nav toggle, scroll reveal, active link, theme toggle, contact form (FormSubmit.co)
assets/        # img1.jpg profile, img2–img7 project thumbs, img7.png favicon
CLAUDE.md
```

## Product brief
- **Audience:** recruiters, internship/hiring managers, clients, fellow devs.
- **Goal:** in <10s know who Nikhil is, what he builds, and how to contact him. Primary CTA = View resume / Get in touch.
- **Sections:** Hero → About (+stats) → Skills → Work (6 projects) → Certifications → Contact → Footer.
- **v1 pain points:** generic dark template, 25 colors, 10 font sizes, 20 spacing values, fake-precision skill % bars, contact form that sends nothing.

## Content (from v1)
- Role: Computer Science Student & Developer. Python since 20. Web tech + Python focus. Hackathons, open source.
- Stats: 6+ projects · 1+ yr experience · 4 certifications · 1 game.
- Skills — Web: HTML/CSS, JavaScript, React, Node.js. Programming: Python, Java, SQL, Game dev.
- Projects (demo / source):
  1. Hotel Ticket Booking — hotelticketbooking.netlify.app / github.com/nikhilrana2715/Hotelticketbooking
  2. NexusTech AI Solutions — nikhilrana2715.github.io/NexusTech-AI-Solutions-for-Modern-Businesses
  3. JRU University Tech Club — nikhilrana2715.github.io/JRU-University-Tech-Club
  4. Student Management Dashboard — nikhilrana2715.github.io/Student-Management-Dashboard
  5. ShopHub Premium Online Shopping — nikhilrana2715.github.io/ShopHub---Premium-Online-Shopping
  6. Doodle Jump web game (HTML5 Canvas) — nikhilrana2715.github.io/Doodle-Jump-website-Game
- Certs (real, confirmed by Nikhil 2026-11-17): Python Programming with Flask, Web Development, Cloud Services, Communication Skills. **Years unknown — shown as "—", replace when Nikhil gives them.** Old v1 certs "Frontend Development" and "Game Design Principles" were never real — don't re-add.
- Currently learning (`.learning` block under certs): full-stack — frontend, backend, databases, deployment, cloud services, hosting.
- Contact: email, phone, Ranchi. Socials: linkedin.com/in/nikhilrana27, github.com/nikhilrana2715, instagram.com/nik.hil.21.
- Resume: Google Drive link (file "Nikhil Rana Resume.pdf", id 1fOhgtM-z2Djm2z56_rHmaTW-F3Zb-YpO, anyone-with-link viewer) in hero "View resume" button. To update: Drive → Manage versions → upload new file, link stays same.

## Design rules (from design spec)
- **Font:** Onest only (Google Fonts). Display 76/600/-1.52px, lg 54.4, md 34.4, sm 18. Body 18/16/14. Labels 16/14/12, caption 11 uppercase.
- **Colors:** ink `#1A1818`, rust accent `#A4552C` (sparingly), tertiary `#D5CDCA`, page `#E8E4E0`, surface `#F5F1EC`, muted `#7D7773`, success `#1F7A5A`, error `#B84B4B`.
- **Space:** 8 / 16 / 28 / 48 / 112. **Radius:** 4 / 8 / 16 / 24 / pill.
- **Buttons:** 48px pill. Primary = ink fill → rust on hover. Secondary = outline pill. Tertiary = text link.
- **Cards:** neutral/surface paper panels, 1px soft border, radius 8–16, 16px+ padding, large diffuse shadow only on hero note card + portrait.
- **Do:** airy, asymmetric hero, big type contrast, warm neutrals.
- **Don't:** gradients, neon, glossy effects, sharp-cornered buttons, crowded hero, skill % bars.

## Component names
`Nav / Header`, `Nav / Mobile`, `Button / Primary`, `Button / Secondary`, `Button / Link`, `Chip / Dark`, `Chip / Light`, `Card / Note`, `Card / Project`, `Card / Cert`, `Input / Text`, `Input / Textarea`, `Stat`.
CSS classes mirror these: `.btn.btn--primary`, `.chip.chip--dark`, `.card--note`, etc.

## Conventions
- Edit tokens in `tokens.css` only; keep dark-mode overrides in sync.
- Respect `prefers-reduced-motion`. All images need `alt`, `loading="lazy"` below the fold.
- Mobile-first breakpoints: 640 / 960px. No horizontal scroll at 360px.
- Run locally: `python -m http.server 8000` → http://localhost:8000

## v2.1 features (patterns studied from therishithakor.com/my-story — code is original)
- **Pull cord** (`#cord`, fixed top-right): verlet rope physics (v3.8). Rope drawn on `#cordCanvas` (fixed, pointer-events none); `#cord` button = cap + bob, JS-positioned at rope end and rotated to the last segment. Mouse brushing through the rope pushes it; grab bob → swing / throw anywhere; pull roughly straight down (within ~32°) past rope length by ≥34px and release → toggle. Click / Enter / Space → tug + toggle. Sim sleeps when at rest. Tunables at top of the cord block in `script.js` (`N`, `PULL`, `STRETCH_MAX`, `PUSH_R`, `GRAVITY`).
- **Clock pill** in nav (≥1140px): live IST time + date. Any `.js-time` / `.js-date` element auto-updates.
- **Right now** (`#now`): Job track (Real-time project, Requirement research & build) + MCA track (Real-time study, Core language + English, Project) — from user's "Portfolio Build: Job + MCA" diagram.
- **My story** (`#story`): sticky left column with rolling odometer year, period label, `01 / 05` counter + bar, rotating tick dial; right timeline with ink fill line + moving dot, inactive items faded, corner glows recolor per item.
  - Edit entries in `index.html` `<ol id="timeline">`: `data-year` (4 digits, drives odometer), `data-period`, `data-glow="#hexA,#hexB"`.
  - **Years/titles for job, MCA, bachelor's and "first script" are placeholders — confirm real dates/company/college with Nikhil.**
- **CTA footer** (`.cta`): always-dark rounded panel "Need something built? Let's make it happen." + 4 link columns.
- Mono labels use IBM Plex Mono (`--font-mono`) — only deviation from Onest-only rule.

## v2.3 — Work = hall of doors → rooms
- `#work` (`.hall`) = 3 doors (`Card / Door`), one per category: **Games** (rust), **Web Apps** (navy), **Apps** (sage). Hover/focus → others fade, door ajar, `.hall__panel` (title + mono tag + ✓ list) beside it, `.hall__cursor` "Click to enter" pill (desktop ≥960 + mouse only).
- Click → leaf swings open, `.hall__doors` zooms into the door, `#flash` white light → **Room** (`.room#room-{games|web|apps}`, fixed layer under nav, tinted `--room-*`). Routed by hash `#/games` `#/web` `#/apps` (pushState `{fromHall}` so "← Back to the doors", Esc and browser Back all work).
- Room = big title + stacked sticky project cards (`.shot`, `--p` shrink set by JS) with `Device / Monitor` (screenshot) or `Device / Phone`; projects without public screenshots use CSS mock screens (`.mock--lockpc|applock|zenith`).
- Projects (edit in `index.html` rooms): Games — Nova Hop (Doodle-Jump-website-Game, nova-hop.vercel.app), Funny Jump (Running-Game, running-game-91zr.vercel.app). Web Apps — Morning Meeting App (MMA), NeumoRemind (PC-Reminder, neumoremind-pwa.web.app), Quick Lock (Locker). Apps — AppLock (App-Lock), Zenith Task (Zenith-TO-DO-List). Screenshots in `assets/work/`.
- Material colors in `tokens.css` (`--door-*`, `--brass-*`, `--room-*`, `--mock-*`). Brass/groove/lamp gradients = deliberate material texture, only exception to no-gradient rule. Pattern from therishithakor.com/my-story; code original.

## v2.4 — Hero notepad, ability pill, current story
- Hero h1 "Hi, I'm Nikhil. I am a" + `.flip#flip` spiral notepad: page flips up (rotateX) every 2.6s through `data-words` (Web / App / Game / Python Developer, MCA Student), `01 / 05` counter. Paper = `--paper-note`, rings = `--ring`.
- Ability card now hidden behind `.ability__pill` "My ability card" on the portrait; opens on hover (mouse) or click/tap, Esc / outside click closes.
- Story timeline (order fixed by Nikhil): Developer (Present, MRS Bearings) → MCA (2026–2028) → Placement at MRS Bearings Pvt. Ltd. (Feb 2026) → Web projects & internship (2024–2026) → BCA (2023–2026). Internship details + college name still unknown.
- About rewritten for 2026: developer at MRS Bearings since Feb 2026, BCA done, MCA 2026–28; stats 7+ projects · 2 games · 3 platforms · 4 certs.

## Deploy note
- `index.html` loads `tokens.css?v=…`, `style.css?v=…`, `script.js?v=…`. **Bump the version on every release** or returning visitors get stale CSS/JS.

## v4.1 — Ability card vault (`Modal / Ability card` + `Card / Trading` + `Panel / Profile`)
- "My ability card" pill opens `#vault` (fullscreen, always dark, scrolls on mobile): loader (big name · "Loading the card" 0→100) → stage = card + details panel (side by side ≥960, stacked below).
- Backdrop is a "studio spec sheet", **no particles** (user found embers unattractive / generative): brass spotlight following cursor (`--mx/--my`, eased in card loop), two slow outlined-type marquees, static SVG film grain, mono corner labels (NR / 001, coords, live `.js-time` IST; hidden <960).
- Card: ink body + thin brass gradient border. Front = `assets/card.jpg` (from `Photo 1.jpeg`, B&W collage — chosen over `Photo 2.jpeg` because its AI cartoon stickers look generative) with NR / No. 001 tags, name + role over photo, 4 stats as thin brass bars (`style="--v:90"`), Base / Mode / Reply footer. Back = NR seal, stack, motto. Drag rotate (inertia), double-click / Enter flip, ←/→ rotate.
- Panel (`.vault__panel`): status "Working full-time · MRS Bearings" (NOT freelance — Nikhil has a job), name, lead, facts list (Now / Study / Certified / Shipped; learning deliberately NOT shown — Nikhil asked), CTAs `.vbtn` (Resume, Get in touch `[data-vault-close]` → closes + goes to #contact, GitHub). Tab trap covers close, card, panel links. × / Esc / backdrop click close.
- **Stat numbers (Web 90, App 80, Game 85, Problem solving 85) are placeholders — confirm with Nikhil.** Game-card stats are a deliberate, user-requested exception to the "no skill % bars" rule; keep them only inside this card.
- Tokens: `--vault-bg`, `--vault-glow`, `--vault-line`, `--vault-text-2/3`, `--card-ink`, `--card-ink-2` (+ brass tokens).

## Service worker gotcha
- Portfolio uses **no** service worker. `sw.js` is a kill-switch (clears caches + unregisters) and `script.js` unregisters any stray worker on load. Reason: Nova Hop once ran on `localhost:8765` and its worker (`novahop-v3` cache) kept serving stale portfolio CSS/images. Prefer a separate port per project.

## Changelog
- **v4.8 (2026-11-17):** mobile pass — hero <960: tighter bottom spacing, portrait centred (max 440px), ability pill pinned inside panel (`.hero__visual .ability`, base `.ability` rule sits later in file and overrides the ≥960 one); <640: hero buttons share one row, `.portrait__label` hidden. `vw` fallbacks before `cqw` (iOS <16). `svh`/`lvh` after `vh` for iOS toolbars. Location fallback no longer uses browser language as country (en-US phones showed "Calcutta, US"); legacy tz names mapped (Calcutta→Kolkata …). Headless Chrome on Windows can't go below ~500px wide — test phones by loading the site in a 360px iframe.
- **v4.7 (2026-11-17):** hero name restyled — `.portrait__name` = brass-gradient filled "NIKHIL" (Onest 800, 25cqw) over wide-tracked outlined "RANA" + mono corner labels `.portrait__label` (NR / 001, Dev · '26). Onest 800 added to font link.
- **v4.6 (2026-11-17):** hero portrait restyled as **editorial sticker**: `assets/portrait.webp` (812×1075) = cut-out with baked-in 14px paper (`#F5F1EC`) outline, smoothed contour (hides rough cut edges). `.portrait` has no bg/overflow now; `::before` = ink panel (`--portrait-panel`) with brass hairline (`--portrait-edge`) starting 24% down so the head pops out above it; `.portrait__name` big outlined "NIKHIL" (23cqw) behind; imgs clipped to panel's bottom corners, `drop-shadow(--shadow-sticker)`. B&W + colour spotlight kept. Rebuild: scratchpad `sticker.py` from cut3.png.
- **v4.4–4.5 (2026-11-17):** hero portrait replaced — `assets/portrait.webp` (812×1015, 4:5 crop x310–1122 y40, transparent cut-out of Nikhil's white-shirt/tie/aviators poster photo; poster text, "Be you", X marks, barcode removed via OpenCV GrabCut + inpaint, guided-filter alpha + colour decontamination; left arm cropped out because poster box hid it). Sits on `--color-tertiary` panel, bottom-anchored, still B&W + colour spotlight. `og:image` → `assets/og.jpg` (same cut-out on tertiary). `img1.jpg` no longer used.
- **v4.3 (2026-11-17):** clocks now show the **visitor's** local time + location (not Ranchi/IST). Time uses the browser timezone; city/country/coords come from IP lookup `get.geojs.io/v1/ip/geo.json` (no key, no permission prompt, cached in `sessionStorage` `nr-geo`). If that fails, falls back to a guess from the timezone name. Hooks: `.js-time .js-date .js-tz .js-loc .js-city .js-coords`, `[data-loc-label]`. Bio facts (Based in Ranchi, card Base, "Ranchi, India" status) stay Nikhil's. IP location is city-level and often wrong on mobile networks (Jio → Vadodara).
- **v4.1 (2026-11-17):** ability card vault redesigned — embers removed, studio backdrop (spotlight, outlined marquee, grain), ink + brass card with new photo, details panel with CTAs. Mobile stacks + scrolls.
- **v4.0 (2026-11-17):** certs replaced with real ones (Python with Flask, Web Development, Cloud Services, Communication Skills; years pending) + "Currently learning" full-stack chips. About copy: first Python script at 20.
- **v3.9 (2026-11-16):** cord fix — canvas sized from its own `clientWidth` (not `innerWidth`, which includes scrollbar → rope drifted left of bob); rope drawn with solid dark outline + light core so it never looks dotted/broken on light bg; cap overlaps rope end.
- **v3.8 (2026-11-16):** pull cord rebuilt as physics rope (canvas + verlet) to match reference recording `Recording   gif.gif`: hover push, free swing/throw, downward pull toggles, sideways swing doesn't. Assets bumped to `?v=3.8`.
- **v3.4 (2026-11-14):** contact form now POSTs to FormSubmit.co AJAX (`formsubmit.co/ajax/nikhilrana21422@gmail.com`) so messages land in inbox directly; honeypot `_honey`; on error shows mailto fallback. First submission triggers one-time FormSubmit activation email — must be clicked. Resume moved to Google Drive link.
- **v3.1 (2026-11-14):** fixed "nothing clickable" bug — `.vault { display: grid }` overrode `[hidden]`, leaving an invisible full-screen z-80 layer over the page. Global `[hidden] { display: none !important; }` added at top of `style.css`. Any new overlay that sets `display` relies on this rule.
- **v3.0 (2026-11-14):** removed stray Nova Hop service worker + stale caches (kill-switch `sw.js` + cleanup in `script.js`); ember canvas uses pre-rendered sprite instead of per-particle `shadowBlur`; card + ember motion frame-rate independent.
- **v2.8 (2026-11-14):** ability card popover replaced by vault dialog with 3D trading card.
- **v2.7 (2026-11-14):** hero portrait is B&W (`.portrait__base` grayscale) with a colour spotlight (`.portrait__color` masked by radial-gradient at `--mx/--my/--r`) that follows the cursor and fades out on leave; touch = tap to peek. Fixed `#top` links (Home / Back to top / logo) — id moved from sticky header to `<body>`. All buttons, doors, rooms, form validation and external links verified.
- **v2.5 (2026-11-14):** bug sweep — burger icon centered; pull cord hides while mobile menu open; page behind a room is `inert` (no tabbing behind dialog); leaving a room via nav link no longer jumps focus to a door; `scrollbar-gutter: stable` (no width jump); flip notepad pauses off-screen; device bezels visible in dark mode; nav border logic independent of timeline; stale meta/contact/skills text updated; asset cache-busting.
- **v2.4 (2026-11-14):** hero flip notepad + ability pill, story/about updated to current situation.
- **v2.3 (2026-11-14):** Work rebuilt as 3 category doors + room pages; 7 new projects replace the old 6.
- **v2.2 (2026-11-14):** Work section rebuilt as `Card / Door` (replaces `Card / Project`).
- **v2.1 (2026-11-14):** pull-cord theme toggle, nav clock pill, Job + MCA section, scroll-driven My story timeline, dark CTA footer.
- **v2.0 (2026-11-14):** full redesign to warm editorial system (Onest, parchment palette), tokens file, new layout, dark mode, working mailto contact form.
- v1.0: dark navy template (old zip).
