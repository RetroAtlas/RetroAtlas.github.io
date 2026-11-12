#!/usr/bin/env node
// Reads the certificate GitHub Pages holds for each site straight from a Pages address, past
// Cloudflare's own, and checks the site answers through Cloudflare. Hosts default to the catalog.
// Usage: node tools/certs.mjs [host ...]

import { readFile } from "node:fs/promises";
import tls from "node:tls";

const PAGES_IPS = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"];

async function catalogSites() {
  const site = new URL("../public/", import.meta.url);
  const landing = (await readFile(new URL("CNAME", site), "utf8")).trim();
  const { maps } = JSON.parse(await readFile(new URL("catalog.json", site), "utf8"));
  return [
    { host: landing, live: true },
    ...maps.map((map) => ({ host: new URL(map.url).hostname, live: map.status === "live" })),
  ];
}

function peerCertificate(ip, host) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: ip, port: 443, servername: host, rejectUnauthorized: false, timeout: 15000 });
    const finish = (cert) => {
      socket.destroy();
      resolve(cert);
    };
    socket.once("secureConnect", () => finish(socket.getPeerCertificate()));
    socket.once("timeout", () => finish(null));
    socket.once("error", () => finish(null));
  });
}

async function originCertificate(host) {
  for (const ip of PAGES_IPS) {
    const cert = await peerCertificate(ip, host);
    if (cert?.valid_to) return cert;
  }
  return null;
}

async function edgeStatus(host) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://${host}/`, { redirect: "manual", signal: AbortSignal.timeout(20000) });
      return res.status;
    } catch {}
  }
  return 0;
}

async function check({ host, live }) {
  const [cert, status] = await Promise.all([originCertificate(host), edgeStatus(host)]);
  let held = "-";
  let expiry = "-";
  if (cert) {
    const expires = new Date(cert.valid_to);
    const days = Math.floor((expires - Date.now()) / 86400000);
    held = cert.subject?.CN ?? "?";
    expiry = `${expires.toISOString().slice(0, 10)} (${days}d)`;
  }
  let problem = "";
  if (status === 0) problem = "no answer through Cloudflare";
  else if (status >= 500 || (live && status >= 400)) problem = `answers ${status} through Cloudflare`;
  return { host, held, expiry, status: String(status || "-"), problem };
}

const hosts = process.argv.slice(2);
const sites = hosts.length ? hosts.map((host) => ({ host, live: true })) : await catalogSites();
const results = await Promise.all(sites.map(check));

const rows = [["site", "GitHub certificate", "expires", "edge", ""], ...results.map((r) => [r.host, r.held, r.expiry, r.status, r.problem])];
const widths = rows[0].map((_, i) => Math.max(...rows.map((row) => row[i].length)));
for (const row of rows) console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  ").trimEnd());

if (process.env.GITHUB_ACTIONS) {
  for (const r of results) if (r.problem) console.log(`::error title=${r.host}::${r.problem}`);
}
process.exitCode = results.some((r) => r.problem) ? 1 : 0;
