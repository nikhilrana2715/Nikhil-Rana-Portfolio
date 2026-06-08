# Nikhil Rana — Developer Portfolio

A modern, fully responsive personal portfolio website built with vanilla **HTML5, CSS3, and JavaScript**. It showcases my projects, technical skills, certifications, and contact information through a clean dark-themed UI with smooth scroll animations and scroll-triggered effects.

<p align="center">
  <img src="img1.jpg" alt="Nikhil Rana" width="180" style="border-radius:50%" />
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-projects-showcased">Projects</a> •
  <a href="#-contact">Contact</a>
</p>

---

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Design-Responsive-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Overview

This portfolio is a single-page application (SPA-style static site) that serves as my professional online identity. It is built **without any frameworks or build tools** — pure HTML, CSS, and JavaScript — which keeps it lightweight, fast-loading, and easy to deploy on any static host like GitHub Pages, Netlify, or Vercel.

The design follows a modern **dark gradient aesthetic** (deep navy/slate tones with blue, sky-blue, and violet accents) and uses subtle motion to make the experience feel alive without being distracting.

---

## 🌐 Live Demo

| Resource | Link |
|----------|------|
| 🔗 Live Site | `https://nikhilrana2715.github.io/Nikhil-Rana-Portfolio/` |
| 📄 Resume | [View on Canva](https://www.canva.com/design/DAGh5iLuXO0/rZ2X4AYI9kpGK9Rows7Jew/view) |

> Update the live link above to match your actual GitHub Pages / Netlify / Vercel deployment URL.

---

## ✨ Features

- **Fully responsive design** — adapts cleanly from large desktops down to mobile screens.
- **Sticky navigation bar** with a blurred glass-morphism background and a hamburger menu for mobile.
- **Smooth scrolling** between sections via in-page anchor navigation.
- **Animated skill bars** that fill up automatically when scrolled into view, powered by the `IntersectionObserver` API.
- **Scroll-triggered animations** on stat boxes, certification cards, and contact items for a dynamic feel.
- **Interactive project cards** with a 3D tilt-on-hover effect.
- **Sectioned layout** — Hero, About, Skills, Projects, Certifications, and Contact.
- **Contact form** UI ready to wire up to a backend or a form service (Formspree, EmailJS, etc.).
- **Custom favicon** and clean typography using Google Fonts (*Poppins* + *Roboto Mono*).

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Markup** | HTML5 (semantic sections) |
| **Styling** | CSS3 — custom properties (CSS variables), Flexbox, Grid, gradients, keyframe animations |
| **Scripting** | Vanilla JavaScript (ES6), `IntersectionObserver` API |
| **Icons** | Font Awesome 6.4.0 |
| **Fonts** | Google Fonts — Poppins, Roboto Mono |
| **Hosting (suggested)** | GitHub Pages / Netlify / Vercel |

---

## 📂 Project Structure

```
Nikhil-Rana-Portfolio/
├── index.html          # Main page — all sections (Hero, About, Skills, Projects, etc.)
├── style.css           # All styling: theme variables, layout, responsive rules, animations
├── script.js           # Interactivity: mobile nav, smooth scroll, scroll animations
├── img1.jpg            # Profile photo (Hero section)
├── img2.jpg            # Project thumbnail — Hotel Ticket Booking
├── img3.jpg            # Project thumbnail — NexusTech AI Solutions
├── img4.jpg            # Project thumbnail — JRU University Tech Club
├── img5.jpg            # Project thumbnail — Student Management Dashboard
├── img6.jpg            # Project thumbnail — ShopHub Online Shopping
├── img7.jpg / img7.png # Project thumbnail — Doodle Jump + favicon
├── BIL Leaflet.pdf     # Supporting document / asset
└── README.md           # You are here
```

---

## 🚀 Getting Started

No build step or dependencies are required. You only need a browser.

### Option 1 — Open directly

```bash
# Clone the repository
git clone https://github.com/nikhilrana2715/Nikhil-Rana-Portfolio.git

# Move into the folder
cd Nikhil-Rana-Portfolio

# Open index.html in your browser (any of these)
start index.html      # Windows
open index.html       # macOS
xdg-open index.html   # Linux
```

### Option 2 — Run with a local server (recommended)

Using a local server avoids any path/caching quirks and mimics a real deployment:

```bash
# Python 3
python -m http.server 8000

# OR Node.js
npx serve
```

Then visit `http://localhost:8000` in your browser.

---

## 🧩 Sections Breakdown

| Section | What it contains |
|---------|------------------|
| **Hero** | Intro headline, role, short pitch, "Download Resume" + "Contact Me" buttons, profile image |
| **About** | Background story and quick stats (6+ projects, 1+ years experience, 4 certifications, 1 game project) |
| **Skills** | Two categories — *Web Development* (HTML/CSS, JavaScript, React, Node.js) and *Programming & Game Design* (Python, Game Dev, Java, SQL) — shown as animated progress bars |
| **Projects** | Grid of 6 featured projects, each with description, tech tags, live demo + source code links |
| **Certifications** | 4 certification cards with titles, descriptions, and issue dates |
| **Contact** | Email, location, phone, social links, and a message form |

---

## 💼 Projects Showcased

| # | Project | Description | Stack |
|---|---------|-------------|-------|
| 1 | **Hotel Ticket Booking** | A hotel booking platform with search, filtering, and reservation features. | JavaScript, HTML/CSS, Netlify |
| 2 | **NexusTech — AI Solutions** | A business landing site for AI/automation services. | JavaScript, HTML/CSS, GitHub Pages |
| 3 | **JRU University Tech Club** | Tech club website uniting 500+ student members. | JavaScript, HTML/CSS, GitHub Pages |
| 4 | **Student Management Dashboard** | Dashboard to manage student profiles, academics, and performance. | JavaScript, HTML/CSS, GitHub Pages |
| 5 | **ShopHub — Premium Online Shopping** | An e-commerce front-end with a smooth browsing experience. | JavaScript, HTML/CSS, GitHub Pages |
| 6 | **Doodle Jump Website Game** | Browser-based clone of the classic Doodle Jump game. | JavaScript, HTML5 Canvas, Game Design |

---

## 🎨 Customization Guide

Want to make it your own? Start here:

- **Colors / Theme** → edit the CSS variables at the top of `style.css`:

  ```css
  :root {
      --primary: #2563eb;
      --secondary: #0ea5e9;
      --accent: #8b5cf6;
      --dark: #1e293b;
      --darker: #0f172a;
      --light: #f8fafc;
  }
  ```

- **Text / Content** → update the relevant sections in `index.html`.
- **Skills & percentages** → change the `<span>` labels and the `data-width` attribute on each `.skill-progress` element.
- **Projects** → duplicate a `.project-card` block and swap the image, title, description, tags, and links.
- **Profile / project images** → replace the `imgX.jpg` files (keep the same names, or update the `src` paths).

---

## 🌍 Deployment

### GitHub Pages
1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under *Source*, select the `main` branch and `/root` folder.
4. Save — your site goes live at `https://<username>.github.io/<repo-name>/`.

### Netlify / Vercel
- Drag-and-drop the project folder into the Netlify dashboard, **or** connect the GitHub repo to Vercel and deploy with default settings (no build command needed for a static site).

---

## 🔧 Possible Future Improvements

- Wire up the contact form to a backend or service (EmailJS / Formspree).
- Add a light/dark theme toggle.
- Introduce a "Blog" or "Articles" section.
- Add page-load and section-reveal animations using a library like AOS.
- Improve accessibility (ARIA labels, keyboard navigation, alt text on all images).
- Add SEO meta tags and Open Graph tags for better link previews.

---

## 📬 Contact

**Nikhil Rana** — Computer Science Student & Developer, Ranchi, India

- 📧 Email: **nikhilrana21422@gmail.com**
- 💼 LinkedIn: [nikhilrana27](https://www.linkedin.com/in/nikhilrana27)
- 🐙 GitHub: [nikhilrana2715](https://github.com/nikhilrana2715)
- 📸 Instagram: [nik.hil.21](https://instagram.com/nik.hil.21)

---

## 📄 License

This project is open source and available under the **MIT License**. Feel free to use it as a reference or starting point for your own portfolio — a credit/star is always appreciated. ⭐

---

<p align="center">Made with ❤️ by Nikhil Rana</p>
