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

function featuredCard(ev) {
  const card = document.createElement("a");
  card.className = "featured-card";
  card.href = ev.drive;
  card.target = "_blank";
  card.rel = "noopener";

  if (ev.cover) {
    card.appendChild(
      Object.assign(document.createElement("img"), {
        src: ev.cover, alt: ev.name, loading: "lazy",
      })
    );
  }

  const overlay = document.createElement("div");
  overlay.className = "featured-overlay";

  const label = document.createElement("span");
  label.className = "featured-label";
  label.textContent = ev.club;

  const title = document.createElement("h3");
  title.textContent = ev.name;

  const cta = document.createElement("span");
  cta.className = "btn";
  cta.textContent = "View Photos →";

  overlay.append(label, title, cta);
  card.appendChild(overlay);
  return reveal(card);
}

function teamCard(member) {
  const card = document.createElement("article");
  card.className = "card";

  const photo = member.photo
    ? Object.assign(document.createElement("img"), {
        className: "team-photo", src: member.photo, alt: member.name, loading: "lazy",
      })
    : Object.assign(document.createElement("div"), {
        className: "team-photo", textContent: "👤",
      });

  const body = document.createElement("div");
  body.className = "card-body";

  const role = document.createElement("span");
  role.className = "team-role";
  role.textContent = member.role;

  const name = document.createElement("h3");
  name.textContent = member.name;

  const contacts = document.createElement("div");
  contacts.className = "team-contacts";
  if (member.email) contacts.innerHTML += `<a href="mailto:${member.email}">✉ ${member.email}</a>`;
  if (member.instagram) contacts.innerHTML += `<a href="${member.instagram}" target="_blank" rel="noopener">📸 Instagram</a>`;
  if (member.phone) contacts.innerHTML += `<a href="tel:${member.phone}">📞 ${member.phone}</a>`;

  body.append(role, name, contacts);
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
  const latestEl = document.getElementById("latest-events");
  const featuredEl = document.getElementById("featured");
  const officialEl = document.getElementById("official-events");
  const clubEl = document.getElementById("club-events");
  const teamEl = document.getElementById("team");

  if (latestEl || featuredEl) {
    try {
      const events = await loadJSON("data/events.json");

      if (latestEl) {
        events.slice(0, 3).forEach((ev) => latestEl.appendChild(eventCard(ev)));
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
      const el = featuredEl || latestEl;
      el.innerHTML = '<p class="empty-note">Events coming soon.</p>';
    }
  }

  if (teamEl) {
    try {
      const team = await loadJSON("data/team.json");
      team.forEach((m) => teamEl.appendChild(teamCard(m)));
    } catch {
      teamEl.innerHTML = '<p class="empty-note">Team info coming soon.</p>';
    }
  }
}

init();
