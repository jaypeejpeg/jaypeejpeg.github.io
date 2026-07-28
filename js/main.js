// Renders events and team cards from the JSON files in /data.

document.getElementById("year").textContent = new Date().getFullYear();

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
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
  body.innerHTML = `
    <span class="card-date">${formatDate(ev.date)}</span>
    <h3></h3>
    <p class="card-blurb"></p>
  `;
  body.querySelector("h3").textContent = ev.name;
  body.querySelector(".card-blurb").textContent = ev.blurb || "";

  const link = document.createElement("a");
  link.className = "btn";
  link.href = ev.drive;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "View Photos";
  body.appendChild(link);

  card.append(cover, body);
  return card;
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
  return card;
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function init() {
  const eventsEl = document.getElementById("events");
  const latestEl = document.getElementById("latest-events");
  const teamEl = document.getElementById("team");

  if (eventsEl || latestEl) {
    try {
      const events = (await loadJSON("data/events.json"))
        .sort((a, b) => b.date.localeCompare(a.date));
      if (eventsEl) events.forEach((ev) => eventsEl.appendChild(eventCard(ev)));
      if (latestEl) events.slice(0, 3).forEach((ev) => latestEl.appendChild(eventCard(ev)));
    } catch {
      const el = eventsEl || latestEl;
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
