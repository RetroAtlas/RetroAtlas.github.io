export async function load(url = "catalog.json") {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`catalog: HTTP ${res.status}`);
  const data = await res.json();
  return data.maps ?? [];
}

export function platforms(map) {
  return [...new Set((map.games ?? []).map((g) => g.platform).filter(Boolean))];
}

function haystack(map) {
  return [
    map.name,
    map.franchise,
    map.blurb,
    map.status,
    ...(map.games ?? []).flatMap((g) => [g.name, g.platform, g.status]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function search(maps, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return maps;
  return maps.filter((map) => {
    const hay = haystack(map);
    return terms.every((t) => hay.includes(t));
  });
}
