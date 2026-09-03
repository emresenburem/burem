import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "client", "public", "brands", "normalized");

const sources = [
  { slug: "siemens", name: "Siemens", source: "https://www.logo.wine/a/logo/Siemens/Siemens-Logo.wine.svg" },
  { slug: "abb", name: "ABB", source: "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg" },
  { slug: "schneider-electric", name: "Schneider Electric", source: "https://www.logo.wine/a/logo/Schneider_Electric/Schneider_Electric-Logo.wine.svg" },
  { slug: "fanuc", name: "Fanuc", source: "https://www.logo.wine/a/logo/FANUC/FANUC-Logo.wine.svg" },
  { slug: "yaskawa", name: "Yaskawa", source: "https://www.logo.wine/a/logo/Yaskawa_Electric_Corporation/Yaskawa_Electric_Corporation-Logo.wine.svg" },
  { slug: "omron", name: "Omron", source: "https://www.logo.wine/a/logo/Omron/Omron-Logo.wine.svg" },
  { slug: "lenze", name: "Lenze", source: "https://cdn.freebiesupply.com/logos/large/2x/lenze-logo-png-transparent.png" },
  { slug: "mitsubishi", name: "Mitsubishi", source: "https://www.logo.wine/a/logo/Mitsubishi/Mitsubishi-Logo.wine.svg", shape: "square" },
  { slug: "danfoss", name: "Danfoss", source: "https://images.seeklogo.com/logo-png/3/2/danfoss-logo-png_seeklogo-38448.png" },
  { slug: "delta", name: "Delta", source: "https://companieslogo.com/img/orig/2308.TW_BIG-c8d9bd8a.png?t=1720244490" },
  { slug: "beckhoff", name: "Beckhoff", source: "https://cdn.worldvectorlogo.com/logos/beckhoff-logo.svg" },
  { slug: "allen-bradley", name: "Allen-Bradley", source: "https://images.seeklogo.com/logo-png/63/2/allen-bradley-logo-png_seeklogo-633934.png" },
  { slug: "fuji", name: "Fuji", source: "https://www.logo.wine/a/logo/Fuji_Electric/Fuji_Electric-Logo.wine.svg" },
  { slug: "rexroth", name: "Rexroth", source: "https://www.logo.wine/a/logo/Bosch_Rexroth/Bosch_Rexroth-Logo.wine.svg" },
  { slug: "baumuller", name: "Baumüller", source: "https://images.seeklogo.com/logo-png/1/1/baumuller-logo-png_seeklogo-17176.png" },
  { slug: "haas", name: "HAAS", source: "https://images.seeklogo.com/logo-png/32/1/haas-logo-png_seeklogo-321914.png", shape: "square" },
  { slug: "sew", name: "SEW", source: "https://images.seeklogo.com/logo-png/23/1/sew-eurodrive-logo-png_seeklogo-236154.png" },
  { slug: "mazak", name: "MAZAK", source: "https://images.seeklogo.com/logo-png/32/1/mazak-logo-png_seeklogo-321946.png" },
  { slug: "panasonic", name: "Panasonic", source: "https://cdn.simpleicons.org/panasonic/003087" },
  { slug: "b-and-r", name: "B&R", source: "https://upload.wikimedia.org/wikipedia/commons/9/96/B%26R_Logo_Tagline_below_RGB_HD.jpg" },
  { slug: "control-techniques", name: "Control Techniques", source: "https://cdn.worldvectorlogo.com/logos/control-techniques.svg" },
  { slug: "keb", name: "KEB", source: "https://www.keb-automation.com/_assets/d036344bd34e87e82af8c79946af49f4/Images/logo.svg" },
  { slug: "mecasonic", name: "Mecasonic", source: path.join(projectRoot, "client", "src", "assets", "logos", "mecasonic.png") },
  { slug: "fida", name: "FIDA", source: path.join(projectRoot, "client", "public", "fida-logo.png") },
];

const isUrl = (value) => /^https?:\/\//i.test(value);

async function readSource(source) {
  if (!isUrl(source)) {
    return fs.readFile(source);
  }

  const response = await fetch(source, {
    headers: { "user-agent": "Burem-Brand-Asset-Normalizer/1.0" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while downloading ${source}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function findVisibleBounds(input) {
  const decoded = await sharp(input, { density: 300 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = decoded;
  const pixelCount = info.width * info.height;
  let transparentPixels = 0;

  for (let offset = 3; offset < data.length; offset += info.channels) {
    if (data[offset] < 250) transparentPixels += 1;
  }

  const hasTransparentCanvas = transparentPixels > pixelCount * 0.01;
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const alpha = data[offset + 3];
      const isOpaqueWhite = red > 247 && green > 247 && blue > 247 && alpha > 247;
      const visible = alpha > 10 && (hasTransparentCanvas ? true : !isOpaqueWhite);

      if (!visible) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) {
    return { left: 0, top: 0, width: info.width, height: info.height };
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function normalizeLogo(entry) {
  const input = await readSource(entry.source);
  const bounds = await findVisibleBounds(input);
  const maxWidth = entry.shape === "square" ? 80 : 104;
  const maxHeight = entry.shape === "square" ? 34 : 30;
  const logo = await sharp(input, { density: 300 })
    .ensureAlpha()
    .extract(bounds)
    .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 140,
      height: 60,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(outputDirectory, `${entry.slug}.png`));

  return `${entry.name} → ${entry.slug}.png (${bounds.width}×${bounds.height})`;
}

await fs.mkdir(outputDirectory, { recursive: true });

for (const entry of sources) {
  try {
    console.log(await normalizeLogo(entry));
  } catch (error) {
    console.error(`Failed: ${entry.name}: ${error.message}`);
    process.exitCode = 1;
  }
}