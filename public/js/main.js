import { load, platforms, search } from "./catalog.js";

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const q = document.getElementById("q");

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

function card(map) {
  const offsite = map.hosting === "external";
  const a = el("a", "card");
  a.href = map.url;
  if (offsite) {
    a.target = "_blank";
    a.rel = "noopener";
  }

  const top = el("div", "card-top");
  top.append(el("h2", null, map.name));
  if (map.status) top.append(el("span", `status ${map.status}`, map.status.replace("-", " ")));
  a.append(top, el("p", "blurb", map.blurb ?? ""));

  const chips = el("div", "chips");
  for (const g of map.games ?? []) chips.append(el("span", "chip", g.name));
  for (const p of platforms(map)) chips.append(el("span", "chip platform", p));
  a.append(chips);

  if (offsite) a.append(el("span", "offsite", `↗ ${new URL(map.url).host}`));

  return a;
}

function render(maps) {
  grid.replaceChildren(...maps.map(card));
  empty.hidden = maps.length > 0;
}

const maps = await load().catch((err) => {
  grid.replaceChildren(el("p", "empty", "The catalog could not be loaded."));
  console.error(err);
  return [];
});

render(maps);

q.addEventListener("input", () => render(search(maps, q.value)));

addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== q) {
    e.preventDefault();
    q.focus();
  } else if (e.key === "Escape" && document.activeElement === q) {
    q.value = "";
    render(maps);
    q.blur();
  }
});
