# Nikhil Rana — Developer Portfolio

Personal portfolio of **Nikhil Rana**, a developer from Ranchi, Jharkhand (India). I build web apps, games and Android apps. I currently work as a developer at MRS Bearings Pvt. Ltd. and study for an MCA.

**🔗 Live site:** https://nikhil-rana-portfolio.vercel.app
**Mirror (GitHub Pages):** https://nikhilrana2715.github.io/Nikhil-Rana-Portfolio/

---

## What's inside

- **Hero:** flip-notepad role switcher, black-and-white portrait with a colour spotlight that follows the cursor, and a link to my resume.
- **Ability card:** a 3D trading card you can tilt, drag to rotate and double-click to flip.
- **Right now / My story:** what I'm working on, and a scroll-driven timeline with an odometer year counter.
- **Work:** three doors (Games, Web Apps, Apps). Each opens into a room of project cards with live demo and source links.
- **Certifications and Contact:** the contact form delivers messages straight to my inbox.
- **Light / dark mode:** pull the cord at the top-right.

## Projects featured

| Category | Project | Live |
|----------|---------|------|
| Games | Nova Hop | [nova-hop.vercel.app](https://nova-hop.vercel.app) |
| Games | Funny Jump | [running-game-91zr.vercel.app](https://running-game-91zr.vercel.app) |
| Web Apps | NeumoRemind | [neumoremind-pwa.web.app](https://neumoremind-pwa.web.app) |
| Web Apps | Morning Meeting App, Quick Lock | — |
| Apps | AppLock, Zenith Task | — |

## Tech

Plain **HTML, CSS and JavaScript**. No framework and no build step.

- Design tokens in `tokens.css` (colours, type, spacing, radius, dark mode)
- Font: Onest (Google Fonts) plus IBM Plex Mono for labels
- Contact form sends through [FormSubmit](https://formsubmit.co)
- Accessible: keyboard navigation, focus trapping in dialogs, `prefers-reduced-motion` support

## Run locally

```bash
git clone https://github.com/nikhilrana2715/Nikhil-Rana-Portfolio.git
cd Nikhil-Rana-Portfolio
python -m http.server 8000
```

Open http://localhost:8000. Serve the site through a server; opening `index.html` directly won't work, because the contact form needs a real URL.

## Structure

```
index.html   all sections
tokens.css   design tokens (+ dark mode)
style.css    components and layout
script.js    interactions (theme cord, timeline, doors/rooms, card, form)
sw.js        service-worker kill-switch (clears stale caches)
assets/      profile photo, project screenshots, favicon
```

## Contact

- Email: nikhilrana21422@gmail.com
- LinkedIn: [linkedin.com/in/nikhilrana27](https://linkedin.com/in/nikhilrana27)
- GitHub: [github.com/nikhilrana2715](https://github.com/nikhilrana2715)
- Instagram: [instagram.com/nik.hil.21](https://instagram.com/nik.hil.21)

---

© Nikhil Rana
