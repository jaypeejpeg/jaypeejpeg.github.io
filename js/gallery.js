// Browses a public Drive folder: albums, photo grid and a full-screen viewer.

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const els = {
  crumbs: document.getElementById("breadcrumb"),
  title: document.getElementById("gallery-title"),
  actions: document.getElementById("gallery-actions"),
  body: document.getElementById("gallery-body"),
  lightbox: document.getElementById("lightbox"),
  lbImg: document.getElementById("lightbox-img"),
  lbName: document.getElementById("lightbox-name"),
  lbCount: document.getElementById("lightbox-count"),
  lbDownload: document.getElementById("lightbox-download"),
};

const params = new URLSearchParams(location.search);
const rootId = params.get("f") || "";
const rootTitle = params.get("t") || "Gallery";

let trail = [];
let photos = [];
let index = 0;

/* ---------- rendering ---------- */

function setBody(html) {
  els.body.innerHTML = html;
}

function drivePanel(message, folderId) {
  return `
    <div class="notice">
      <p>${message}</p>
      ${folderId ? `<a class="btn" href="${driveFolderUrl(folderId)}" target="_blank" rel="noopener">Open in Google Drive ↗</a>` : ""}
    </div>`;
}

function renderCrumbs() {
  els.crumbs.innerHTML = "";
  const all = document.createElement("a");
  all.href = "events.html";
  all.textContent = "All events";
  els.crumbs.appendChild(all);

  trail.forEach((step, i) => {
    const sep = document.createElement("span");
    sep.className = "crumb-sep";
    sep.textContent = "/";
    els.crumbs.appendChild(sep);

    if (i === trail.length - 1) {
      const current = document.createElement("span");
      current.className = "crumb-current";
      current.textContent = step.name;
      els.crumbs.appendChild(current);
    } else {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = step.name;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        trail = trail.slice(0, i + 1);
        openFolder(step.id, step.name, false);
      });
      els.crumbs.appendChild(link);
    }
  });
}

// Drive's own mark, inlined so the button needs no external asset.
const DRIVE_LOGO =
  '<svg viewBox="0 0 87.3 78" aria-hidden="true" focusable="false">' +
  '<path fill="#0066da" d="M6.6 66.85 10.45 73.5c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"/>' +
  '<path fill="#00ac47" d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.35A9.06 9.06 0 0 0 0 52.85h27.5z"/>' +
  '<path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z"/>' +
  '<path fill="#00832d" d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"/>' +
  '<path fill="#2684fc" d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"/>' +
  '<path fill="#ffba00" d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"/>' +
  "</svg>";

function renderActions(folderId) {
  els.actions.innerHTML = "";
  const drive = document.createElement("a");
  drive.className = "btn btn-outline btn-drive";
  drive.href = driveFolderUrl(folderId);
  drive.target = "_blank";
  drive.rel = "noopener";
  drive.innerHTML = `${DRIVE_LOGO}<span>Google Drive</span>`;
  els.actions.appendChild(drive);
}

function albumCard(folder) {
  const card = document.createElement("button");
  card.className = "card album-card";
  card.innerHTML = `
    <span class="album-icon">📁</span>
    <span class="album-name"></span>`;
  card.querySelector(".album-name").textContent = folder.name;
  card.addEventListener("click", () => {
    trail.push({ id: folder.id, name: folder.name });
    openFolder(folder.id, folder.name, true);
  });
  return card;
}

function photoTile(file, i) {
  const tile = document.createElement("figure");
  tile.className = "photo-tile";

  const meta = file.imageMediaMetadata;
  const rotated = meta && (meta.rotation === 1 || meta.rotation === 3);
  const w = meta ? (rotated ? meta.height : meta.width) : 4;
  const h = meta ? (rotated ? meta.width : meta.height) : 3;
  tile.style.aspectRatio = `${w} / ${h}`;

  const img = document.createElement("img");
  img.src = thumbUrl(file.id, 600);
  img.alt = file.name;
  img.loading = "lazy";
  tile.appendChild(img);

  if (file.mimeType.startsWith("video/")) {
    const badge = document.createElement("span");
    badge.className = "video-badge";
    badge.textContent = "▶";
    tile.appendChild(badge);
  }

  const overlay = document.createElement("div");
  overlay.className = "photo-overlay";

  const view = document.createElement("button");
  view.className = "icon-btn";
  view.innerHTML = "⤢";
  view.setAttribute("aria-label", `Preview ${file.name}`);
  view.addEventListener("click", () => openLightbox(i));

  const download = document.createElement("a");
  download.className = "icon-btn";
  download.href = downloadUrl(file.id);
  download.setAttribute("download", file.name);
  download.setAttribute("aria-label", `Download ${file.name}`);
  download.textContent = "↓";
  download.addEventListener("click", (e) => e.stopPropagation());

  overlay.append(view, download);
  tile.appendChild(overlay);

  tile.addEventListener("click", (e) => {
    if (!e.target.closest(".icon-btn")) openLightbox(i);
  });

  return tile;
}

function renderFolder(data, folderId) {
  els.body.innerHTML = "";
  photos = data.files;

  if (!data.folders.length && !data.files.length) {
    setBody(drivePanel("This folder is empty.", folderId));
    return;
  }

  if (data.folders.length) {
    const heading = document.createElement("h2");
    heading.className = "section-heading";
    heading.textContent = "Albums";
    const grid = document.createElement("div");
    grid.className = "card-grid album-grid";
    data.folders.forEach((f) => grid.appendChild(albumCard(f)));
    els.body.append(heading, grid);
  }

  if (data.files.length) {
    const heading = document.createElement("h2");
    heading.className = "section-heading";
    heading.textContent = `Photos (${data.files.length})`;
    const grid = document.createElement("div");
    grid.className = "photo-grid";
    data.files.forEach((f, i) => grid.appendChild(photoTile(f, i)));
    els.body.append(heading, grid);
  }
}

/* ---------- lightbox ---------- */

function openLightbox(i) {
  index = i;
  showPhoto();
  els.lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  els.lightbox.hidden = true;
  els.lbImg.removeAttribute("src");
  document.body.style.overflow = "";
}

function step(delta) {
  if (!photos.length) return;
  index = (index + delta + photos.length) % photos.length;
  showPhoto();
}

function showPhoto() {
  const file = photos[index];
  if (!file) return;
  els.lbImg.src = thumbUrl(file.id, 1600);
  els.lbImg.alt = file.name;
  els.lbName.textContent = file.name;
  els.lbCount.textContent = `${String(index + 1).padStart(2, "0")} / ${photos.length}`;
  els.lbDownload.href = downloadUrl(file.id);
  els.lbDownload.setAttribute("download", file.name);
}

document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
document.getElementById("lightbox-prev").addEventListener("click", () => step(-1));
document.getElementById("lightbox-next").addEventListener("click", () => step(1));
els.lightbox.addEventListener("click", (e) => {
  if (e.target === els.lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (els.lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

/* ---------- navigation ---------- */

async function openFolder(folderId, name, push) {
  els.title.textContent = name;
  renderCrumbs();
  renderActions(folderId);
  setBody('<p class="empty-note">Loading photos…</p>');

  if (push) {
    const url = `gallery.html?f=${encodeURIComponent(folderId)}&t=${encodeURIComponent(name)}`;
    history.pushState({ trail }, "", url);
  }

  try {
    renderFolder(await listFolder(folderId), folderId);
  } catch (err) {
    if (err.message === "NO_KEY") {
      setBody(
        drivePanel(
          "The on-site gallery is not switched on yet, but all the photos are right here.",
          folderId
        )
      );
    } else if (err.status === 403 || err.status === 404) {
      setBody(
        drivePanel(
          "These photos could not be loaded — the folder may not be shared publicly.",
          folderId
        )
      );
    } else {
      setBody(drivePanel(`Could not load photos (${err.message}).`, folderId));
    }
  }
}

window.addEventListener("popstate", (e) => {
  const restored = e.state && e.state.trail;
  if (restored && restored.length) {
    trail = restored;
    const last = trail[trail.length - 1];
    openFolder(last.id, last.name, false);
  }
});

async function init() {
  if (!rootId) {
    els.title.textContent = "Gallery";
    setBody(drivePanel("No event selected. Pick one from the events page.", ""));
    return;
  }

  let name = rootTitle;
  if (name === "Gallery" && DRIVE.enabled()) {
    name = (await folderName(rootId)) || "Gallery";
  }

  trail = [{ id: rootId, name }];
  history.replaceState({ trail }, "", location.href);
  openFolder(rootId, name, false);
}

init();
