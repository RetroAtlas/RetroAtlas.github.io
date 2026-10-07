import { load, platforms, search, sort } from "./catalog.js";

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const q = document.getElementById("q");

document.getElementById("contact").href = `mailto:${["hello", "retroatlas.org"].join("@")}`;

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const month = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" });

function card(map) {
  const linked = Boolean(map.url);
  const offsite = linked && map.hosting === "external";
  const node = el(linked ? "a" : "div", "card");
  if (linked) node.href = map.url;
  if (offsite) {
    node.target = "_blank";
    node.rel = "noopener";
  }

  const top = el("div", "card-top");
  top.append(el("h2", null, map.name));
  if (map.status) top.append(el("span", `status ${map.status}`, map.status.replace("-", " ")));
  node.append(top, el("p", "blurb", map.blurb ?? ""));

  const chips = el("div", "chips");
  for (const g of map.games ?? []) chips.append(el("span", "chip", g.name));
  for (const p of platforms(map)) chips.append(el("span", "chip platform", p));
  node.append(chips);

  const foot = el("div", "card-foot");
  const started = new Date(map.started);
  if (!Number.isNaN(started.getTime())) foot.append(el("span", null, `Started ${month.format(started)}`));
  if (offsite) foot.append(el("span", "offsite", `↗ ${new URL(map.url, location.href).host}`));
  if (foot.hasChildNodes()) node.append(foot);

  return node;
}

function render(maps) {
  grid.replaceChildren(...maps.map(card));
  empty.hidden = maps.length > 0;
  count.textContent = maps.length === 1 ? "1 map" : `${maps.length} maps`;
}

let maps = [];
try {
  maps = sort(await load());
  render(maps);
} catch (err) {
  grid.replaceChildren(el("p", "empty", "The catalog could not be loaded."));
  q.disabled = true;
  console.error(err);
}

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
