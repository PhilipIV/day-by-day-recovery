import { readFileSync } from "node:fs";
import { join } from "node:path";

const siteDir = process.argv[2] || "test";
const html = readFileSync(join(siteDir, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(siteDir, "manifest.json"), "utf8"));
const serviceWorker = readFileSync(join(siteDir, "sw.js"), "utf8");

const requiredMarkup = [
  'id="todayPanel"',
  'id="historyPanel"',
  'id="customizePanel"',
  'id="settingsPanel"',
  'id="addSectionBtn"',
  'id="customSectionsContainer"',
  'class="counter-btn counter-minus"',
  'class="counter-btn counter-plus"',
  'ensureCounterItem(section)',
  'id="reminderMessage"',
  'data-copy="reminderText"',
  'data-panel="settingsPanel"'
];

for (const marker of requiredMarkup) {
  if (!html.includes(marker)) throw new Error(`Missing required UI marker: ${marker}`);
}

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
if (!inlineScripts.length) throw new Error("No application script found");
for (const script of inlineScripts) new Function(script);

if (!manifest.name || manifest.start_url !== "./") throw new Error("Invalid web app manifest");
if (!serviceWorker.includes("registration.scope")) throw new Error("Service worker cache is not isolated by deployment scope");
new Function(serviceWorker);

if (/file:\/\/|C:\\Users\\/i.test(html)) throw new Error("Local filesystem path leaked into build");

console.log(`Smoke tests passed for ${siteDir}`);
