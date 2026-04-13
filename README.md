# carter_black — portfolio

> Personal developer portfolio built with vanilla HTML, CSS, and JavaScript.
> Live at **[carter-black.github.io](https://carter-black.github.io)**

---

## features

- **animated dot-grid background** — dots light up and expand near the cursor
- **custom cursor** — a pixel-art green arrow/hand that rotates as it moves and tilts when scrolling
- **typewriter header** — cycling titles with realistic typing and delete animation
- **github project cards** — auto-fetched from the GitHub API, with a local cache fallback
- **skills grid** — clean tag-style layout for languages and tools
- **live inspect mode** — toggle `>_ inspect` in the corner to click any element and edit its CSS live in the browser
- **edge console panels** — hover near the left or right screen edge to reveal a scrolling code console
- **fully responsive** — scales cleanly across screen sizes

---

## tech stack

| layer | tech |
|---|---|
| markup | HTML5 |
| styling | CSS3 (custom properties, grid, flexbox) |
| logic | vanilla JavaScript (ES6+) |
| data | GitHub REST API v3 |
| hosting | GitHub Pages |

---

## project structure

```
/
├── index.html       # all markup and section structure
├── style.css        # all styling — dark theme, green accent (#00FF41)
├── script.js        # cursor, typewriter, skills, GitHub API, inspect mode
└── assets/
    ├── green_cursor.png
    ├── green_hand.png
    └── resume.pdf
```

---

## customization

All site content is edited directly in `index.html` and `script.js`.

| what to change | where |
|---|---|
| typewriter titles | `script.js` → `const titles = [...]` |
| skills list | `script.js` → `const skills = [...]` |
| about text / terminal JSON | `index.html` → `#about` section |
| contact links | `index.html` → `#contact` section |
| github projects | auto-pulled from `Carter-Black` GitHub account |

---


*built by [Carter Black](https://www.linkedin.com/in/carterrblack) · 2026*
