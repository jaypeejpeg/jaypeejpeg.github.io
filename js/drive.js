// Reads public Google Drive folders through the Drive API.
// Only folders shared as "anyone with the link" are reachable with an API key.

const DRIVE = {
  key: () => (window.JPEG_CONFIG && window.JPEG_CONFIG.driveApiKey) || "",
  enabled: () => DRIVE.key().length > 0,
  cacheTtl: 10 * 60 * 1000,
};

// Pulls the folder id out of any Drive URL we store in data/events.json.
function folderIdFrom(url) {
  const match = String(url || "").match(/\/folders\/([-\w]{20,})/);
  return match ? match[1] : "";
}

function thumbUrl(id, width) {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

function downloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

function driveFolderUrl(id) {
  return `https://drive.google.com/drive/folders/${id}`;
}

function galleryUrl(folderId, title) {
  return `gallery.html?f=${encodeURIComponent(folderId)}&t=${encodeURIComponent(title || "")}`;
}

// Where a "View Photos" button should point: the on-site gallery when the API
// key is set, otherwise straight to Drive.
function photosUrl(driveUrlOrId, title) {
  const id = folderIdFrom(driveUrlOrId) || driveUrlOrId;
  return DRIVE.enabled() ? galleryUrl(id, title) : driveFolderUrl(id);
}

function readCache(folderId) {
  try {
    const raw = sessionStorage.getItem(`drive:${folderId}`);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < DRIVE.cacheTtl ? data : null;
  } catch {
    return null;
  }
}

function writeCache(folderId, data) {
  try {
    sessionStorage.setItem(`drive:${folderId}`, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage full or unavailable — caching is optional */
  }
}

// Lists one folder, following pagination. Returns { folders, files, name }.
async function listFolder(folderId) {
  if (!DRIVE.enabled()) throw new Error("NO_KEY");

  const cached = readCache(folderId);
  if (cached) return cached;

  const fields =
    "nextPageToken,files(id,name,mimeType,imageMediaMetadata(width,height,rotation))";
  const items = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields,
      orderBy: "folder,name_natural",
      pageSize: "1000",
      key: DRIVE.key(),
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      const err = new Error(detail?.error?.message || `Drive API error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const page = await res.json();
    items.push(...(page.files || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  // Folders prefixed with "_" stay private. The rule deliberately does not
  // apply to files: Canon names half its output _MG_1234.jpg.
  // Anything that is not an image, video or folder is ignored entirely.
  const isFolder = (f) => f.mimeType === "application/vnd.google-apps.folder";
  const data = {
    folders: items.filter((f) => isFolder(f) && !f.name.startsWith("_")),
    files: items.filter(
      (f) => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/")
    ),
  };

  writeCache(folderId, data);
  return data;
}

// Folder's own name, for breadcrumbs after drilling down.
async function folderName(folderId) {
  if (!DRIVE.enabled()) return "";
  const params = new URLSearchParams({ fields: "name", key: DRIVE.key() });
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?${params}`
  );
  if (!res.ok) return "";
  const data = await res.json();
  return data.name || "";
}
