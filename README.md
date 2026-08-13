# JPEG — Photography Club

The website for JPEG, the photography club at Jaypee Institute of Information Technology.
Event coverage, photo archives, and the people behind the lens.

**Live at [jaypeejpeg.github.io](https://jaypeejpeg.github.io/)**

---

## How it works

Plain HTML, CSS and vanilla JavaScript. **No build step, no framework, no dependencies.**
GitHub Pages serves the repository root as-is from the `main` branch — push to `main` and the
site updates within a minute or two.

Photos are never stored in this repository. Every event points at a public Google Drive
folder, and the site reads those folders live through the Drive API.

Adding an event or editing the team usually means **changing one JSON file and nothing else.**

## Running it locally

The pages fetch JSON at runtime, which browsers block on `file://` URLs. Opening
`index.html` by double-clicking will show "Events coming soon." You need a local server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Any static server works.

## File and folder map

```
.
├── index.html          Home — hero, marquee, "Latest" banner, Greatest Hits
├── events.html         Full event archive, split into Official and Club sections
├── gallery.html        On-site photo browser (one page, driven by URL parameters)
├── team.html           Team page, grouped by role
│
├── data/
│   ├── events.json     ← every event on the site. The file you'll edit most.
│   └── team.json       ← every team member.
│
├── js/
│   ├── config.js       Google Drive API key
│   ├── drive.js        Drive API calls, URL builders, session caching
│   ├── main.js         Renders home / events / team from the JSON files
│   └── gallery.js      Renders the gallery page: albums, photo grid, lightbox
│
├── css/
│   └── style.css       All styling. Dark, high-contrast, hard shadows.
│
├── images/
│   ├── jpeg-logo-white.png
│   ├── favicon.png
│   ├── og-cover.jpg    Preview image shown when a link is shared
│   └── covers/         (unused — covers currently come from Drive)
│
├── .nojekyll           Stops GitHub Pages from hiding files that start with "_"
└── .gitignore
```

There is no templating, so the `<nav>` and `<footer>` markup is duplicated in all four HTML
files. **Changing the navigation means editing four files.**

Script load order matters and is fixed: `config.js` → `drive.js` → `main.js` (or
`gallery.js`). They are classic scripts sharing globals, not modules.

## The data files

### `data/events.json`

An array of events, **ordered newest first**. Rendering preserves array order.

```json
{
  "name": "Impressions 26",
  "club": "Main Fest",
  "category": "club",
  "drive": "https://drive.google.com/drive/folders/1Sl7JFKvN1KrVejVSlek3txemEs2EPjDt",
  "cover": "https://lh3.googleusercontent.com/d/1-FPdGAdzqe9MXvuo2g23g3QmN1n-yI40=w800",
  "featured": "highlight",
  "rank": 1
}
```

| Field | Required | What it does |
|---|---|---|
| `name` | yes | Card title, gallery page title, image alt text |
| `club` | yes | The small badge on the card — club or department name |
| `category` | yes | `"official"` or `"club"`. Picks the section on the events page |
| `drive` | yes | Public Drive folder URL, in `/drive/folders/<id>` form |
| `cover` | yes | Thumbnail. **Must end in `=w800`** — see below |
| `featured` | no | `"hero"` = the Latest banner on the home page. `"highlight"` = the big feature card on the events page |
| `rank` | no | Any number ≥ 1 puts the event in Greatest Hits on the home page, sorted ascending |

### `data/team.json`

One object per member. The page groups members by `role`, so **entries with the same role
must sit next to each other in the array** — a new heading starts every time the role value
changes.

```json
{ "name": "Arnav Mehta", "role": "Photography Heads", "photo": "", "instagram": "alt.clicks", "phone": "+91 88821 27230" }
```

`photo` may be left empty — the card falls back to the member's initials. `instagram` and
`phone` are both optional; each renders an icon button, and `phone` becomes a WhatsApp link.

---

## Common tasks

### Add an event

1. Upload the photos to a Google Drive folder.
2. Share the folder: **Anyone with the link → Viewer**. If you skip this, the gallery shows
   an error instead of the photos.
3. Pick one photo to use as the cover and copy its **file ID** — open the photo in Drive and
   take the long ID out of the URL:
   `drive.google.com/file/d/`**`1b7pDeooVe9yHsu1VJmWFPwnUZeeb_XvK`**`/view`
4. Add an entry to the **top** of `data/events.json`:

```json
{
  "name": "Event Name",
  "club": "Club or Department",
  "category": "club",
  "drive": "https://drive.google.com/drive/folders/FOLDER_ID_HERE",
  "cover": "https://lh3.googleusercontent.com/d/FILE_ID_HERE=w800"
}
```

Landscape covers work best — cards crop to 3:2.

### Make an event the "Latest" banner

Add `"featured": "hero"` to it and **remove it from whichever event has it now** (only the
first match is used).

Then update the home page text by hand, because the event name is hardcoded in
`index.html` in two places:

- the hero button — the `<a id="hero-cta">` element, both its `href` and its label
- the scrolling marquee — inside `<div class="marquee-track">`, where the name appears
  **four times across two `<span>` elements that must stay identical**, or the ticker
  visibly jumps as it loops

### Change the Greatest Hits showcase

Edit the `rank` values in `data/events.json`. Lowest number goes first; remove the `rank` key
to drop an event from the showcase. The large `01 / 02 / 03` numerals are based on position,
not on the rank value, so gaps in the numbering are harmless.

### Add or remove a team member

Edit `data/team.json`, keeping members of the same role adjacent.

---

## How the Google Drive integration behaves

- Folders must be shared **"Anyone with the link"**. Private folders show an error panel.
- Sub-folders become **albums** you can click into. Nesting works to any depth.
- **Folders whose name starts with `_` are hidden** from the site — a handy way to keep raw
  or unedited work private. This rule deliberately does *not* apply to files, since cameras
  name files like `_MG_1234.jpg`.
- Only images and videos are shown. Everything else in the folder is ignored.
- Listings are cached in the browser for 10 minutes, so newly added photos may take that long
  to appear in a tab that is already open.
- The API key lives in `js/config.js`. It is restricted to this domain and to read-only Drive
  access, and can only reach folders that are already public. **If the key is ever removed,
  the site still works** — every "View Photos" button simply opens Google Drive directly.

## Contributing

The `main` branch is live, so anything pushed there is public immediately.

**Content changes** (adding an event, fixing a name, swapping a cover) are just JSON edits and
can go straight to `main`.

**Code changes** (HTML, CSS, JS) should go through a branch and a pull request:

```bash
git checkout -b short-description
# make your changes, test locally with python3 -m http.server 8000
git commit -m "Short description of the change"
git push -u origin short-description
```

Before pushing, please check:

- [ ] `python3 -m json.tool data/events.json` — a syntax error blanks the whole page
- [ ] The home page, events page and team page all still render
- [ ] Any new event's "View Photos" button opens a working gallery
- [ ] The layout survives a narrow window (the grids collapse below 720px)

Commit messages are short and plain — see `git log` for the house style.

## Things that break quietly

Worth knowing before you edit, since none of these produce an error message:

| Mistake | What happens |
|---|---|
| `category` set to anything other than `"official"` or `"club"` | The event vanishes from the events page |
| A cover URL not ending in `=w800` | Larger renditions stop working; the image loads blurry or small |
| `"rank": 0` | The event silently disappears from Greatest Hits — start at 1 |
| Invalid JSON (a stray trailing comma) | The entire page falls back to "Events coming soon." |
| A Drive folder set back to private | That event's gallery shows an error panel |
| Two events with `"featured": "hero"` | Only the first is used |
| Changing the tagline text in `index.html` | The typewriter animation breaks — its width and step count are hardcoded to the current 26-character string in `css/style.css` |

## Known issues

- **Videos don't play in the lightbox.** Video files appear in the grid with a ▶ badge, but
  opening one shows a still frame — the lightbox always builds an `<img>`. Downloading the
  video works. Roughly 47 videos across the archive are affected.
