// Renders events and team cards from the JSON files in /data.
// events.json is ordered newest-first; rendering preserves array order.

document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = reduceMotion
  ? null
  : new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

function reveal(el) {
  if (revealObserver) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  }
  return el;
}

function eventCard(ev) {
  const card = document.createElement("article");
  card.className = "card";

  const cover = ev.cover
    ? Object.assign(document.createElement("img"), {
        className: "card-cover", src: ev.cover, alt: ev.name, loading: "lazy",
      })
    : Object.assign(document.createElement("div"), {
        className: "card-cover", textContent: "📷",
      });

  const body = document.createElement("div");
  body.className = "card-body";

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = ev.club;

  const title = document.createElement("h3");
  title.textContent = ev.name;

  const link = document.createElement("a");
  link.className = "btn";
  link.href = ev.drive;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View Photos";

  body.append(chip, title, link);
  card.append(cover, body);
  return reveal(card);
}

function featuredCard(ev, labelText) {
  const card = document.createElement("a");
  card.className = "featured-card";
  card.href = ev.drive;
  card.target = "_blank";
  card.rel = "noopener";

  if (ev.cover) {
    card.appendChild(
      Object.assign(document.createElement("img"), {
        src: ev.cover.replace("=w800", "=w1600"), alt: ev.name, loading: "lazy",
      })
    );
  }

  const overlay = document.createElement("div");
  overlay.className = "featured-overlay";

  const label = document.createElement("span");
  label.className = "featured-label";
  label.textContent = labelText || ev.club;

  const title = document.createElement("h3");
  title.textContent = ev.name;

  const cta = document.createElement("span");
  cta.className = "btn";
  cta.textContent = "View Photos →";

  overlay.append(label, title, cta);
  card.appendChild(overlay);
  return reveal(card);
}

const ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
};

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function iconLink(href, icon, label) {
  const a = document.createElement("a");
  a.className = "icon-btn";
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", label);
  a.innerHTML = ICONS[icon];
  return a;
}

function hitRow(ev, position) {
  const row = document.createElement("article");
  row.className = "hit";

  const media = document.createElement("a");
  media.className = "hit-media";
  media.href = ev.drive;
  media.target = "_blank";
  media.rel = "noopener";
  media.setAttribute("aria-label", `${ev.name} photos`);

  if (ev.cover) {
    media.appendChild(
      Object.assign(document.createElement("img"), {
        src: ev.cover.replace("=w800", "=w1200"), alt: ev.name, loading: "lazy",
      })
    );
  }

  const text = document.createElement("div");
  text.className = "hit-text";

  const rank = document.createElement("span");
  rank.className = "hit-rank";
  rank.textContent = String(position).padStart(2, "0");

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = ev.club;

  const title = document.createElement("h3");
  title.className = "hit-title";
  title.textContent = ev.name;

  const link = document.createElement("a");
  link.className = "btn";
  link.href = ev.drive;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View Photos →";

  text.append(rank, chip, title, link);
  row.append(media, text);
  return reveal(row);
}

function teamCard(member) {
  const card = document.createElement("article");
  card.className = "card";

  const photo = member.photo
    ? Object.assign(document.createElement("img"), {
        className: "team-photo", src: member.photo, alt: member.name, loading: "lazy",
      })
    : Object.assign(document.createElement("div"), {
        className: "team-photo team-initials", textContent: initials(member.name),
      });

  const body = document.createElement("div");
  body.className = "card-body";

  const name = document.createElement("h3");
  name.textContent = member.name;

  const icons = document.createElement("div");
  icons.className = "icon-row";
  if (member.instagram) {
    icons.appendChild(iconLink(`https://instagram.com/${member.instagram}`, "instagram", `${member.name} on Instagram`));
  }
  if (member.phone) {
    icons.appendChild(iconLink(`https://wa.me/${member.phone.replace(/\D/g, "")}`, "whatsapp", `Chat with ${member.name} on WhatsApp`));
  }

  body.append(name, icons);
  card.append(photo, body);
  return reveal(card);
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function show(sectionId) {
  document.getElementById(sectionId).hidden = false;
}

async function init() {
  const hitsEl = document.getElementById("hits");
  const bannerEl = document.getElementById("induction-banner");
  const featuredEl = document.getElementById("featured");
  const officialEl = document.getElementById("official-events");
  const clubEl = document.getElementById("club-events");
  const teamEl = document.getElementById("team");

  if (hitsEl || featuredEl) {
    try {
      const events = await loadJSON("data/events.json");

      if (bannerEl) {
        const hero = events.find((ev) => ev.featured === "hero");
        if (hero) {
          bannerEl.appendChild(featuredCard(hero, "Latest ★"));
          show("banner-section");
        }
      }

      if (hitsEl) {
        events
          .filter((ev) => ev.rank)
          .sort((a, b) => a.rank - b.rank)
          .forEach((ev, i) => hitsEl.appendChild(hitRow(ev, i + 1)));
      }

      if (featuredEl) {
        const highlight = events.find((ev) => ev.featured === "highlight");
        if (highlight) {
          featuredEl.appendChild(featuredCard(highlight));
          show("featured-section");
        }

        const rest = events.filter((ev) => ev.featured !== "highlight");
        const official = rest.filter((ev) => ev.category === "official");
        const club = rest.filter((ev) => ev.category === "club");

        if (official.length) {
          official.forEach((ev) => officialEl.appendChild(eventCard(ev)));
          show("official-section");
        }
        if (club.length) {
          club.forEach((ev) => clubEl.appendChild(eventCard(ev)));
          show("club-section");
        }
      }
    } catch {
      const el = featuredEl || hitsEl;
      el.innerHTML = '<p class="empty-note">Events coming soon.</p>';
    }
  }

  if (teamEl) {
    try {
      const team = await loadJSON("data/team.json");
      let currentRole = null;
      let grid = null;
      team.forEach((m) => {
        if (m.role !== currentRole) {
          currentRole = m.role;
          const heading = document.createElement("h2");
          heading.className = "section-heading";
          heading.textContent = m.role;
          grid = document.createElement("div");
          grid.className = "card-grid team-grid";
          teamEl.append(heading, grid);
        }
        grid.appendChild(teamCard(m));
      });
    } catch {
      teamEl.innerHTML = '<p class="empty-note">Team info coming soon.</p>';
    }
  }
}

init();
