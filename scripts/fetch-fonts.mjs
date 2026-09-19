// Télécharge les polices du site depuis Fontshare quand elles manquent.
//
// Satoshi et Stardom (© Indian Type Foundry, licence ITF FFL) ne sont pas
// versionnées : la licence interdit de redistribuer les fichiers, y compris
// via un dépôt public. Chaque poste ou build les récupère donc lui-même à la
// source, sans les modifier (la licence interdit aussi de les convertir).
//
//   node scripts/fetch-fonts.mjs               télécharge toujours
//   node scripts/fetch-fonts.mjs --if-missing  ne fait rien si tout est présent
//
// Aucune dépendance : l'archive .zip est lue avec node:zlib.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.env.FONTS_DIR ?? join(root, "src", "app", "fonts");

const SOURCES = [
  {
    url: "https://api.fontshare.com/v2/fonts/download/satoshi",
    files: {
      "Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2": "Satoshi-Variable.woff2",
      "Satoshi_Complete/Fonts/OTF/Satoshi-Medium.otf": "og/Satoshi-Medium.otf",
    },
  },
  {
    url: "https://api.fontshare.com/v2/fonts/download/stardom",
    files: {
      "Stardom_Complete/Fonts/WEB/fonts/Stardom-Regular.woff2": "Stardom-Regular.woff2",
      "Stardom_Complete/Fonts/OTF/Stardom-Regular.otf": "og/Stardom-Regular.otf",
      "Stardom_Complete/License/FFL.txt": "FFL.txt",
    },
  },
];

const expected = SOURCES.flatMap((source) => Object.values(source.files));
const missing = expected.filter((file) => !existsSync(join(target, file)));

if (process.argv.includes("--if-missing") && missing.length === 0) {
  process.exit(0);
}

// Lecture minimale d'un zip : répertoire central, puis entrées stockées ou
// compressées en deflate.
function readZip(buffer) {
  const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("archive zip invalide");
  const count = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();

  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("répertoire central corrompu");
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength);

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    entries.set(name, method === 0 ? raw : inflateRawSync(raw));

    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

for (const source of SOURCES) {
  const wanted = Object.values(source.files);
  if (wanted.every((file) => existsSync(join(target, file))) && process.argv.includes("--if-missing")) continue;

  console.log(`Téléchargement : ${source.url}`);
  const response = await fetch(source.url);
  if (!response.ok) {
    console.error(`Échec (${response.status}) : ${source.url}`);
    process.exit(1);
  }
  const entries = readZip(Buffer.from(await response.arrayBuffer()));

  for (const [inside, destination] of Object.entries(source.files)) {
    const data = entries.get(inside);
    if (!data) {
      console.error(`Fichier absent de l'archive : ${inside}`);
      process.exit(1);
    }
    const path = join(target, destination);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
    console.log(`  écrit : ${destination} (${data.length} octets)`);
  }
}
