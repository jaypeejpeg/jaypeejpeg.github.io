# JPEG — Photography Club Website

Live at [jaypeejpeg.github.io](https://jaypeejpeg.github.io/).

## Updating the site

No coding needed for routine updates — everything is driven by two JSON files:

- **Add an event:** edit `data/events.json`, add an object with `name`, `date` (YYYY-MM-DD), `blurb`, `cover` (image path or empty), and `drive` (Google Drive folder link). Order doesn't matter; the site sorts by date.
- **Update the team:** edit `data/team.json`. Leave `email` / `instagram` / `phone` empty (`""`) to hide that contact.
- **Cover images:** drop them in `images/covers/` and reference like `images/covers/fest26.jpg`.

Commit and push to `main` — the site updates automatically in a minute or two.

## Google Drive folders

Set each event folder to **Anyone with the link → Viewer** before adding it to the site.
