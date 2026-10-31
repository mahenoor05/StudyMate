import * as THREE from "/static/vendor/three/build/three.module.js";
import { OrbitControls } from "/static/vendor/three/examples/jsm/controls/OrbitControls.js";

/**
 * StudyMate — 3D Cutaway Cozy Library Engine (Dark Academia Edition)
 * Real-time procedural Three.js scene with:
 * - Warm chevron parquet oak floor, walnut wainscoting, and antique mahogany bookshelves
 * - Curated Dark Academia aged-leather & antique cloth book spine palette
 * - Vintage arched mullioned window overlooking a stormy midnight sky, moonlit clouds, and soft rain
 * - Weathered slate & carved dark oak fireplace with charred logs, glowing ember bed, and flickering firelight
 * - Natural beeswax candles on the mantelpiece with melted wax drips, wicks, and flickering flames
 * - Muted earthy woven rugs, soft contact drop-shadows, and hover-only desk interactions
 */

const DESK_LAYOUTS = [
  // === FLOOR 1: GROUND FLOOR MAIN READING HALL (Desks 1-20) ===
  // Zone 1: Arched Rain Window Nook (Back-Left - Desks 1-5, centered over Rug 1 at x: -3.2, z: -2.3)
  { id: 1, floor: "ground", zone: "window", x: -5.2, y: 0, z: -3.2, rotY: 0.08, label: "Window Nook 1" },
  { id: 2, floor: "ground", zone: "window", x: -3.2, y: 0, z: -3.2, rotY: -0.06, label: "Window Nook 2" },
  { id: 3, floor: "ground", zone: "window", x: -1.2, y: 0, z: -3.2, rotY: 0.04, label: "Window Nook 3" },
  { id: 4, floor: "ground", zone: "window", x: -4.2, y: 0, z: -1.4, rotY: 0.06, label: "Window Nook 4" },
  { id: 5, floor: "ground", zone: "window", x: -2.2, y: 0, z: -1.4, rotY: -0.08, label: "Window Nook 5" },

  // Zone 2: Hearth & Fireside Alcove (Back-Right - Desks 6-10, centered over Rug 2 at x: 3.2, z: -2.3)
  { id: 6, floor: "ground", zone: "fireplace", x: 1.2, y: 0, z: -3.2, rotY: 0.06, label: "Hearthside 6" },
  { id: 7, floor: "ground", zone: "fireplace", x: 3.2, y: 0, z: -3.2, rotY: -0.10, label: "Hearthside 7" },
  { id: 8, floor: "ground", zone: "fireplace", x: 5.2, y: 0, z: -3.2, rotY: 0.05, label: "Hearthside 8" },
  { id: 9, floor: "ground", zone: "fireplace", x: 2.2, y: 0, z: -1.4, rotY: 0.08, label: "Hearthside 9" },
  { id: 10, floor: "ground", zone: "fireplace", x: 4.2, y: 0, z: -1.4, rotY: -0.06, label: "Hearthside 10" },

  // Zone 3: Main Archive Reading Table (Foreground-Left - Desks 11-15, centered over Rug 3 at x: -3.2, z: 2.1)
  { id: 11, floor: "ground", zone: "archive", x: -5.2, y: 0, z: 1.2, rotY: 0.05, label: "Main Archive 11" },
  { id: 12, floor: "ground", zone: "archive", x: -3.2, y: 0, z: 1.2, rotY: -0.05, label: "Main Archive 12" },
  { id: 13, floor: "ground", zone: "archive", x: -1.2, y: 0, z: 1.2, rotY: 0.06, label: "Main Archive 13" },
  { id: 14, floor: "ground", zone: "archive", x: -4.2, y: 0, z: 3.0, rotY: 0.07, label: "Main Archive 14" },
  { id: 15, floor: "ground", zone: "archive", x: -2.2, y: 0, z: 3.0, rotY: -0.06, label: "Main Archive 15" },

  // Zone 4: Quiet Corner Study (Foreground-Right - Desks 16-20, centered over Rug 4 at x: 3.2, z: 2.1)
  { id: 16, floor: "ground", zone: "corner", x: 1.2, y: 0, z: 1.2, rotY: 0.05, label: "Quiet Corner 16" },
  { id: 17, floor: "ground", zone: "corner", x: 3.2, y: 0, z: 1.2, rotY: -0.08, label: "Quiet Corner 17" },
  { id: 18, floor: "ground", zone: "corner", x: 5.0, y: 0, z: 1.2, rotY: 0.04, label: "Quiet Corner 18" },
  { id: 19, floor: "ground", zone: "corner", x: 1.8, y: 0, z: 3.0, rotY: 0.06, label: "Quiet Corner 19" },
  { id: 20, floor: "ground", zone: "corner", x: 3.5, y: 0, z: 3.0, rotY: -0.05, label: "Quiet Corner 20" },

  // === FLOOR 2: 2ND FLOOR UPPER MEZZANINE HALL (Desks 21-36, 16 Desks neatly 4 per rug at centerX = +18.0) ===
  // Mezzanine Rug 1 (Back-Left centered at x: 14.8, z: -2.3)
  { id: 21, floor: "mezzanine", zone: "mezz-nw", x: 13.4, y: 0, z: -3.15, rotY: 0.06, label: "Mezzanine Gallery 21" },
  { id: 22, floor: "mezzanine", zone: "mezz-nw", x: 16.2, y: 0, z: -3.15, rotY: -0.05, label: "Mezzanine Gallery 22" },
  { id: 23, floor: "mezzanine", zone: "mezz-nw", x: 13.4, y: 0, z: -1.45, rotY: 0.05, label: "Mezzanine Gallery 23" },
  { id: 24, floor: "mezzanine", zone: "mezz-nw", x: 16.2, y: 0, z: -1.45, rotY: -0.06, label: "Mezzanine Gallery 24" },

  // Mezzanine Rug 2 (Back-Right centered at x: 21.2, z: -2.3)
  { id: 25, floor: "mezzanine", zone: "mezz-ne", x: 19.8, y: 0, z: -3.15, rotY: 0.05, label: "Mezzanine Balustrade 25" },
  { id: 26, floor: "mezzanine", zone: "mezz-ne", x: 22.6, y: 0, z: -3.15, rotY: -0.06, label: "Mezzanine Balustrade 26" },
  { id: 27, floor: "mezzanine", zone: "mezz-ne", x: 19.8, y: 0, z: -1.45, rotY: 0.06, label: "Mezzanine Balustrade 27" },
  { id: 28, floor: "mezzanine", zone: "mezz-ne", x: 22.6, y: 0, z: -1.45, rotY: -0.05, label: "Mezzanine Balustrade 28" },

  // Mezzanine Rug 3 (Front-Left centered at x: 14.8, z: 2.1)
  { id: 29, floor: "mezzanine", zone: "mezz-sw", x: 13.4, y: 0, z: 1.25, rotY: 0.05, label: "Mezzanine Reading 29" },
  { id: 30, floor: "mezzanine", zone: "mezz-sw", x: 16.2, y: 0, z: 1.25, rotY: -0.05, label: "Mezzanine Reading 30" },
  { id: 31, floor: "mezzanine", zone: "mezz-sw", x: 13.4, y: 0, z: 2.95, rotY: 0.06, label: "Mezzanine Reading 31" },
  { id: 32, floor: "mezzanine", zone: "mezz-sw", x: 16.2, y: 0, z: 2.95, rotY: -0.06, label: "Mezzanine Reading 32" },

  // Mezzanine Rug 4 (Front-Right centered at x: 21.2, z: 2.1)
  { id: 33, floor: "mezzanine", zone: "mezz-se", x: 19.8, y: 0, z: 1.25, rotY: 0.05, label: "Mezzanine Alcove 33" },
  { id: 34, floor: "mezzanine", zone: "mezz-se", x: 22.6, y: 0, z: 1.25, rotY: -0.06, label: "Mezzanine Alcove 34" },
  { id: 35, floor: "mezzanine", zone: "mezz-se", x: 19.8, y: 0, z: 2.95, rotY: 0.06, label: "Mezzanine Alcove 35" },
  { id: 36, floor: "mezzanine", zone: "mezz-se", x: 22.6, y: 0, z: 2.95, rotY: -0.05, label: "Mezzanine Alcove 36" },

  // === FLOOR 3: WEST ARCHIVE WING (Desks 37-52, 16 Desks neatly 4 per rug at centerX = -18.0) ===
  // Archive Rug 1 (Back-Left centered at x: -21.2, z: -2.3)
  { id: 37, floor: "archive", zone: "arch-nw", x: -22.6, y: 0, z: -3.15, rotY: 0.06, label: "Archive Vault 37" },
  { id: 38, floor: "archive", zone: "arch-nw", x: -19.8, y: 0, z: -3.15, rotY: -0.05, label: "Archive Vault 38" },
  { id: 39, floor: "archive", zone: "arch-nw", x: -22.6, y: 0, z: -1.45, rotY: 0.05, label: "Archive Vault 39" },
  { id: 40, floor: "archive", zone: "arch-nw", x: -19.8, y: 0, z: -1.45, rotY: -0.06, label: "Archive Vault 40" },

  // Archive Rug 2 (Back-Right centered at x: -14.8, z: -2.3)
  { id: 41, floor: "archive", zone: "arch-ne", x: -16.2, y: 0, z: -3.15, rotY: 0.05, label: "Archive Stacks 41" },
  { id: 42, floor: "archive", zone: "arch-ne", x: -13.4, y: 0, z: -3.15, rotY: -0.06, label: "Archive Stacks 42" },
  { id: 43, floor: "archive", zone: "arch-ne", x: -16.2, y: 0, z: -1.45, rotY: 0.06, label: "Archive Stacks 43" },
  { id: 44, floor: "archive", zone: "arch-ne", x: -13.4, y: 0, z: -1.45, rotY: -0.05, label: "Archive Stacks 44" },

  // Archive Rug 3 (Front-Left centered at x: -21.2, z: 2.1)
  { id: 45, floor: "archive", zone: "arch-sw", x: -22.6, y: 0, z: 1.25, rotY: 0.05, label: "Archive Folio 45" },
  { id: 46, floor: "archive", zone: "arch-sw", x: -19.8, y: 0, z: 1.25, rotY: -0.05, label: "Archive Folio 46" },
  { id: 47, floor: "archive", zone: "arch-sw", x: -22.6, y: 0, z: 2.95, rotY: 0.06, label: "Archive Folio 47" },
  { id: 48, floor: "archive", zone: "arch-sw", x: -19.8, y: 0, z: 2.95, rotY: -0.06, label: "Archive Folio 48" },

  // Archive Rug 4 (Front-Right centered at x: -14.8, z: 2.1)
  { id: 49, floor: "archive", zone: "arch-se", x: -16.2, y: 0, z: 1.25, rotY: 0.05, label: "Archive Scriptorium 49" },
  { id: 50, floor: "archive", zone: "arch-se", x: -13.4, y: 0, z: 1.25, rotY: -0.06, label: "Archive Scriptorium 50" },
  { id: 51, floor: "archive", zone: "arch-se", x: -16.2, y: 0, z: 2.95, rotY: 0.06, label: "Archive Scriptorium 51" },
  { id: 52, floor: "archive", zone: "arch-se", x: -13.4, y: 0, z: 2.95, rotY: -0.05, label: "Archive Scriptorium 52" }
];

const CAMERA_PRESETS = {
  overview: {
    pos: new THREE.Vector3(1.2, 10.2, 14.8),
    target: new THREE.Vector3(0.3, 1.1, 0.4)
  },
  window: {
    pos: new THREE.Vector3(-2.8, 4.4, 4.6),
    target: new THREE.Vector3(-3.2, 1.4, -2.3)
  },
  fireside: {
    pos: new THREE.Vector3(2.8, 4.4, 4.6),
    target: new THREE.Vector3(3.2, 1.4, -2.3)
  },
  fireplace: {
    pos: new THREE.Vector3(2.8, 4.4, 4.6),
    target: new THREE.Vector3(3.2, 1.4, -2.3)
  },
  archive: {
    pos: new THREE.Vector3(-2.8, 4.4, 7.2),
    target: new THREE.Vector3(-3.2, 1.3, 2.1)
  },
  corner: {
    pos: new THREE.Vector3(2.8, 4.4, 7.2),
    target: new THREE.Vector3(3.2, 1.3, 2.1)
  },
  lounge: {
    pos: new THREE.Vector3(4.6, 3.6, 7.4),
    target: new THREE.Vector3(5.8, 0.55, 3.35)
  },
  top: {
    pos: new THREE.Vector3(0.0, 17.5, 3.0),
    target: new THREE.Vector3(0.0, 0.4, 0.0)
  },
  topdown: {
    pos: new THREE.Vector3(0.0, 17.5, 3.0),
    target: new THREE.Vector3(0.0, 0.4, 0.0)
  }
};

// Muted Dark Academia Attire Palette for Seated Students
const SWEATER_COLORS = {
  teal: 0x1f3b2b,
  amber: 0x8c6229,
  indigo: 0x263240,
  rose: 0x5c1d24,
  emerald: 0x283e31,
  purple: 0x3b2336,
  blue: 0x21303f,
  orange: 0x6b341c
};

const HAIR_PALETTE = [0x1c1410, 0x2d1d14, 0x4a3020, 0x63412c, 0x141619, 0x3b2219];
const SKIN_PALETTE = [0xf3d4b8, 0xe5b892, 0xc9946b, 0x9c6744, 0x73482d, 0xf7dfc6];

// Authentic Dark Academia brown leather-covered book bindings (warm espresso, chestnut, saddle brown, russet, and aged walnut)
const DARK_ACADEMIA_BOOK_PALETTE = [
  0x3b2214, // Deep Espresso Leather (#3b2214)
  0x52301b, // Aged Walnut Hide (#52301b)
  0x6b3e23, // Warm Chestnut Calfskin (#6b3e23)
  0x7d4b2b, // Saddle Brown Leather (#7d4b2b)
  0x8f5b38, // Antique Tan & Cognac Leather (#8f5b38)
  0x472918, // Dark Mahogany Morocco Leather (#472918)
  0x9e6f4a  // Weathered Honeyed Russet Leather (#9e6f4a)
];

const _projVec = new THREE.Vector3();
const _camPosGoal = new THREE.Vector3();
const _camTargetGoal = new THREE.Vector3();
const _fireColorA = new THREE.Color(0xff7a1a);
const _fireColorB = new THREE.Color(0xff9e42);
const _fireColorScratch = new THREE.Color();

let isSoftwareGl = false;

function hashString(str) {
  let h = 2166136261;
  const s = String(str || "studymate");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Generates a warm Dark Academia chevron/herringbone parquet wooden floor texture
 */
function createChevronParquetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#4a2e1b";
  ctx.fillRect(0, 0, 512, 512);

  const plankW = 64;
  const plankH = 16;
  const tones = ["#5c3a24", "#4f311d", "#684229", "#553520", "#4a2e1b", "#613d26"];

  for (let y = -plankW; y < 512 + plankW; y += plankH) {
    for (let x = -plankW; x < 512 + plankW; x += plankW) {
      const idx = Math.abs(Math.floor((x + y) / plankH)) % tones.length;
      ctx.save();
      ctx.translate(x, y);

      // Left chevron slat
      ctx.fillStyle = tones[idx];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(plankW * 0.5, plankH * 0.85);
      ctx.lineTo(plankW * 0.5, plankH * 1.85);
      ctx.lineTo(0, plankH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(15, 8, 4, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Right chevron slat
      ctx.fillStyle = tones[(idx + 2) % tones.length];
      ctx.beginPath();
      ctx.moveTo(plankW * 0.5, plankH * 0.85);
      ctx.lineTo(plankW, 0);
      ctx.lineTo(plankW, plankH);
      ctx.lineTo(plankW * 0.5, plankH * 1.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  // Subtle wood grain lines
  ctx.fillStyle = "rgba(255, 215, 170, 0.025)";
  for (let i = 0; i < 90; i++) {
    ctx.fillRect(0, (i * 19) % 512, 512, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4.5, 3.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a muted, earthy Dark Academia woven rug texture
 */
function createWovenRugTexture(primaryHex, borderHex, patternHex) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 512, 384);

  // Subtle woven linen threads
  ctx.strokeStyle = "rgba(255, 248, 232, 0.045)";
  ctx.lineWidth = 1;
  for (let y = 0; y < 384; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 384);
    ctx.stroke();
  }

  // Outer muted antique border
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 22;
  ctx.strokeRect(18, 18, 512 - 36, 384 - 36);

  // Inner subtle geometric frame
  ctx.strokeStyle = patternHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 38, 512 - 76, 384 - 76);
  ctx.strokeRect(46, 46, 512 - 92, 384 - 92);

  // Corner medallions
  const corners = [
    [62, 62],
    [512 - 62, 62],
    [62, 384 - 62],
    [512 - 62, 384 - 62]
  ];
  ctx.fillStyle = patternHex;
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center heritage diamond motif
  ctx.save();
  ctx.translate(256, 192);
  ctx.strokeStyle = patternHex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.lineTo(68, 0);
  ctx.lineTo(0, 48);
  ctx.lineTo(-68, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates weathered slate & dark stone coursework texture for the fireplace surround
 */
function createSlateStoneworkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Dark mortar base
  ctx.fillStyle = "#191615";
  ctx.fillRect(0, 0, 512, 512);

  const rows = 14;
  const rowH = 512 / rows;
  const stonePalette = ["#2b2724", "#24211e", "#322d29", "#201d1b", "#2d2926", "#36302b"];

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    let x = (r % 2) * -36;
    while (x < 512) {
      const w = 64 + ((r * 29 + Math.floor(x)) % 44);
      const tone = stonePalette[Math.abs(r * 7 + Math.floor(x)) % stonePalette.length];
      ctx.fillStyle = tone;
      ctx.fillRect(x + 2, y + 2, w - 4, rowH - 4);

      // Subtle top stone highlight and bottom shadow bevel
      ctx.fillStyle = "rgba(255, 245, 230, 0.05)";
      ctx.fillRect(x + 2, y + 2, w - 4, 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(x + 2, y + rowH - 4, w - 4, 2);

      x += w;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a realistic outdoor window sky backdrop with horizon gradient, clouds,
 * sun or moon with atmospheric halo, and layered tree canopies for each time of day / season.
 */
function createOutdoorSkyTexture(themeMode = "Autumn Fall") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const isDay = themeMode === "Daylight" || themeMode === "Cloudy Afternoon";
  const isGolden = themeMode === "Golden Hour";
  const isAutumn = themeMode === "Autumn Fall" || themeMode === "Autumn Rain" || themeMode === "Rainy Night";

  // 1. Multi-stop vertical sky gradient from zenith to lower horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  if (isDay) {
    skyGrad.addColorStop(0.0, "#2f7ed8");
    skyGrad.addColorStop(0.3, "#5b9ee6");
    skyGrad.addColorStop(0.62, "#9ec8f2");
    skyGrad.addColorStop(0.85, "#dcebfc");
    skyGrad.addColorStop(1.0, "#f4f8fd");
  } else if (isGolden) {
    skyGrad.addColorStop(0.0, "#26153b");
    skyGrad.addColorStop(0.22, "#6e2434");
    skyGrad.addColorStop(0.48, "#bf441f");
    skyGrad.addColorStop(0.72, "#e87c24");
    skyGrad.addColorStop(0.9, "#fcae38");
    skyGrad.addColorStop(1.0, "#ffe894");
  } else if (isAutumn) {
    skyGrad.addColorStop(0.0, "#2a1421");
    skyGrad.addColorStop(0.24, "#702d1d");
    skyGrad.addColorStop(0.50, "#b54c20");
    skyGrad.addColorStop(0.74, "#d66723");
    skyGrad.addColorStop(0.88, "#e89a3c");
    skyGrad.addColorStop(1.0, "#fcd280");
  } else {
    // Cozy Night
    skyGrad.addColorStop(0.0, "#030712");
    skyGrad.addColorStop(0.32, "#091326");
    skyGrad.addColorStop(0.68, "#13223d");
    skyGrad.addColorStop(0.9, "#1f3252");
    skyGrad.addColorStop(1.0, "#2a4163");
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle twinkling stars for Cozy Night
  if (!isDay && !isGolden && !isAutumn) {
    for (let s = 0; s < 110; s++) {
      const sx = ((s * 173 + 41) % 980) + 22;
      const sy = ((s * 97 + 19) % 520) + 20;
      const sr = (s % 3 === 0) ? 1.8 : 1.1;
      const alpha = 0.35 + ((s * 31) % 60) / 100;
      ctx.fillStyle = `rgba(240, 246, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Celestial body: Bright Sun (Daylight), Low Sun (Golden Hour), Crisp Sun Glow (Autumn Fall), or Crescent Moon (Cozy Night)
  if (isDay) {
    const sunX = 340;
    const sunY = 220;
    const halo = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 280);
    halo.addColorStop(0.0, "rgba(255, 253, 240, 0.95)");
    halo.addColorStop(0.25, "rgba(255, 246, 214, 0.52)");
    halo.addColorStop(0.6, "rgba(255, 240, 200, 0.16)");
    halo.addColorStop(1.0, "rgba(255, 240, 200, 0.0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 280, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 56, 0, Math.PI * 2);
    ctx.fill();
  } else if (isGolden) {
    const sunX = 480;
    const sunY = 470;
    const halo = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 360);
    halo.addColorStop(0.0, "rgba(255, 245, 180, 0.95)");
    halo.addColorStop(0.28, "rgba(255, 170, 43, 0.65)");
    halo.addColorStop(0.65, "rgba(232, 82, 30, 0.28)");
    halo.addColorStop(1.0, "rgba(180, 40, 20, 0.0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 360, 0, Math.PI * 2);
    ctx.fill();

    const sunDisc = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 82);
    sunDisc.addColorStop(0.0, "#fffae0");
    sunDisc.addColorStop(0.6, "#ffbe4f");
    sunDisc.addColorStop(1.0, "#f0681d");
    ctx.fillStyle = sunDisc;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 82, 0, Math.PI * 2);
    ctx.fill();
  } else if (isAutumn) {
    const sunX = 460;
    const sunY = 380;
    const halo = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 320);
    halo.addColorStop(0.0, "rgba(255, 242, 221, 0.88)");
    halo.addColorStop(0.3, "rgba(255, 184, 108, 0.45)");
    halo.addColorStop(0.7, "rgba(224, 120, 50, 0.15)");
    halo.addColorStop(1.0, "rgba(180, 80, 30, 0.0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff7ea";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 64, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const moonX = 680;
    const moonY = 240;
    const haloGrad = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 260);
    haloGrad.addColorStop(0.0, "rgba(225, 240, 255, 0.65)");
    haloGrad.addColorStop(0.32, "rgba(165, 202, 248, 0.28)");
    haloGrad.addColorStop(0.7, "rgba(105, 150, 210, 0.08)");
    haloGrad.addColorStop(1.0, "rgba(15, 26, 44, 0.0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 260, 0, Math.PI * 2);
    ctx.fill();

    const moonDiscGrad = ctx.createRadialGradient(moonX - 14, moonY - 14, 6, moonX, moonY, 58);
    moonDiscGrad.addColorStop(0.0, "#fffef2");
    moonDiscGrad.addColorStop(0.72, "#e4f0ff");
    moonDiscGrad.addColorStop(1.0, "#b6d0ed");
    ctx.fillStyle = moonDiscGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 56, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Layered soft drifting clouds across the upper and mid sky
  const drawCloudRow = (baseY, bodyColor, rimColor, scaleY, puffs) => {
    ctx.save();
    ctx.fillStyle = rimColor;
    puffs.forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.ellipse(px, baseY + py - 9, r, r * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = bodyColor;
    puffs.forEach(([px, py, r]) => {
      ctx.beginPath();
      ctx.ellipse(px, baseY + py + 4, r, r * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const cloudSetA = [
    [110, 12, 115], [240, -14, 140], [410, 6, 125],
    [590, -18, 155], [770, -4, 135], [920, 14, 115]
  ];
  const cloudSetB = [
    [70, 8, 130], [210, -10, 150], [380, -22, 165],
    [555, 4, 140], [725, -12, 160], [895, 10, 130]
  ];

  if (isDay) {
    drawCloudRow(310, "rgba(242, 247, 252, 0.88)", "rgba(255, 255, 255, 0.96)", 0.54, cloudSetA);
    drawCloudRow(455, "rgba(226, 236, 246, 0.82)", "rgba(255, 253, 246, 0.92)", 0.58, cloudSetB);
  } else if (isGolden) {
    drawCloudRow(320, "rgba(148, 72, 68, 0.72)", "rgba(255, 186, 102, 0.78)", 0.52, cloudSetA);
    drawCloudRow(465, "rgba(184, 88, 58, 0.68)", "rgba(255, 214, 122, 0.85)", 0.56, cloudSetB);
  } else if (isAutumn) {
    drawCloudRow(310, "rgba(186, 132, 108, 0.72)", "rgba(255, 238, 218, 0.82)", 0.54, cloudSetA);
    drawCloudRow(450, "rgba(208, 152, 122, 0.68)", "rgba(255, 222, 192, 0.88)", 0.58, cloudSetB);
  } else {
    drawCloudRow(330, "rgba(20, 32, 52, 0.76)", "rgba(138, 175, 220, 0.32)", 0.54, cloudSetA);
    drawCloudRow(470, "rgba(16, 26, 44, 0.84)", "rgba(110, 145, 190, 0.24)", 0.58, cloudSetB);
  }

  // 4. Layered Distant & Midground Tree Canopies + Branch Silhouettes at the Window Horizon
  const drawTreeLine = (horizonY, foliageColors, trunkColor, scaleMultiplier) => {
    ctx.save();
    const treeCenters = [70, 175, 290, 415, 535, 650, 775, 890, 980];

    // Trunks & branches
    ctx.strokeStyle = trunkColor;
    ctx.lineCap = "round";
    treeCenters.forEach((tx, idx) => {
      const treeH = (150 + ((idx * 37) % 85)) * scaleMultiplier;
      const topY = horizonY - treeH * 0.55;
      ctx.lineWidth = 10 * scaleMultiplier;
      ctx.beginPath();
      ctx.moveTo(tx, 1024);
      ctx.lineTo(tx, topY);
      ctx.stroke();

      // Main boughs
      ctx.lineWidth = 5.5 * scaleMultiplier;
      ctx.beginPath();
      ctx.moveTo(tx, topY + 45);
      ctx.lineTo(tx - 38 * scaleMultiplier, topY + 8);
      ctx.moveTo(tx, topY + 65);
      ctx.lineTo(tx + 42 * scaleMultiplier, topY + 22);
      ctx.stroke();
    });

    // Lush layered foliage clusters
    treeCenters.forEach((tx, idx) => {
      const treeH = (150 + ((idx * 37) % 85)) * scaleMultiplier;
      const cy = horizonY - treeH * 0.52;
      const baseR = (76 + ((idx * 23) % 34)) * scaleMultiplier;

      const crownOffsets = [
        [0, -baseR * 0.45, baseR * 0.85],
        [-baseR * 0.55, -baseR * 0.1, baseR * 0.78],
        [baseR * 0.55, -baseR * 0.08, baseR * 0.78],
        [-baseR * 0.3, baseR * 0.25, baseR * 0.82],
        [baseR * 0.32, baseR * 0.28, baseR * 0.82]
      ];

      crownOffsets.forEach(([ox, oy, cr], cIdx) => {
        ctx.fillStyle = foliageColors[(idx + cIdx) % foliageColors.length];
        ctx.beginPath();
        ctx.arc(tx + ox, cy + oy, cr, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Ground horizon fill
    ctx.fillStyle = foliageColors[0];
    ctx.fillRect(0, horizonY + 20, 1024, 1024 - horizonY);
    ctx.restore();
  };

  if (isDay) {
    // Distant soft sage-green treeline + closer warm olive/forest oak canopy
    drawTreeLine(735, ["#4e6e58", "#5c7d63", "#6b8c6e"], "#3d2c1e", 0.85);
    drawTreeLine(820, ["#2e4f34", "#3b613e", "#4a7348", "#59824f"], "#2e1f14", 1.12);
  } else if (isGolden) {
    // Sun-kissed bronze, amber, and warm olive-gold canopies
    drawTreeLine(735, ["#6e4228", "#8c532b", "#a66832"], "#2e1b10", 0.85);
    drawTreeLine(820, ["#3d2516", "#57341c", "#784722", "#965b28"], "#21130b", 1.12);
  } else if (isAutumn) {
    // Vibrant Autumn Fall leaves: crimson, copper, golden amber, burnt oak, ochre
    drawTreeLine(735, ["#78281a", "#963a1f", "#b85324"], "#2b1a12", 0.85);
    drawTreeLine(820, ["#5e1f14", "#822c19", "#a8381e", "#c45c26", "#d9822b"], "#1f120a", 1.12);
  } else {
    // Cozy Night moonlit indigo-charcoal and deep forest silhouettes
    drawTreeLine(735, ["#152233", "#1c2c40", "#22354a"], "#0d131c", 0.85);
    drawTreeLine(820, ["#0b131e", "#101b29", "#162436", "#1b2c40"], "#080c12", 1.12);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a soft radial contact drop-shadow texture to ground furniture & planters on the floor
 */
function createSoftShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0.0, "rgba(5, 4, 3, 0.62)");
  grad.addColorStop(0.55, "rgba(8, 6, 4, 0.32)");
  grad.addColorStop(1.0, "rgba(8, 6, 4, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Generates a dark carved oak wooden texture with gold leaf engraved member name
 */
function createCarvedOakNameplateTexture(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  // Rich dark carved oak wood grain background
  const grad = ctx.createLinearGradient(0, 0, 512, 128);
  grad.addColorStop(0.0, "#3a2012");
  grad.addColorStop(0.5, "#4d2b18");
  grad.addColorStop(1.0, "#2d180c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Brass inlay plaque plate inside the oak block
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.strokeStyle = "rgba(255, 232, 163, 0.65)";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 480, 96);

  // Subtle top label "RESERVED DESK"
  const cleanName = String(name || "SCHOLAR").toUpperCase().slice(0, 18);
  ctx.fillStyle = "#f3d27a";
  ctx.font = "bold 20px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★ RESERVED DESK ★", 256, 38);

  // Deep shadow for carved gold leaf name
  ctx.fillStyle = "rgba(10, 5, 2, 0.95)";
  ctx.font = "bold 36px Georgia, serif";
  ctx.fillText(cleanName, 258, 84);

  // Bright Gold Leaf Fill
  const goldGrad = ctx.createLinearGradient(0, 58, 0, 104);
  goldGrad.addColorStop(0.0, "#fff8d6");
  goldGrad.addColorStop(0.45, "#ffd700");
  goldGrad.addColorStop(1.0, "#cfa028");
  ctx.fillStyle = goldGrad;
  ctx.fillText(cleanName, 256, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export class CozyLibrary3DEngine {
  constructor() {
    this.container = null;
    this.labelsContainer = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);
    this.pointerDownPos = { x: 0, y: 0 };

    this.deskUnits = new Map();
    this.hitMeshes = [];
    this.loungeHitMesh = null;
    this.loungeOverlayEl = null;
    this.loungeArmchairs = [];
    this.hoveredDeskId = null;
    this.currentDesksData = [];
    this.currentUserId = 1;
    this.currentAtmosphere = "Daylight";
    this.currentFloor = "ground";
    this.isTopDownView = false;
    this.unlockedFloors = {
      ground: true,
      mezzanine: false,
      archive: false
    };

    // Animated scene & lighting references
    this.ambientLight = null;
    this.dirLight = null;
    this.ambientHemiLight = null;
    this.keyDirLight = null;
    this.skyMesh = null;
    this.windowSky = null;
    this.skyTextures = {};
    this.exteriorFoliageMats = [];
    this.windowMoonLight = null;
    this.fireplaceLight = null;
    this.fireplaceBaseIntensity = 2.2;
    this.fireplaceBasePos = new THREE.Vector3(4.3, 0.72, -3.95);
    this.fireplaceActive = true;
    this.interiorLampsActive = true;
    this.sconceLights = [];
    this.sconceBulbs = [];
    this.flameMeshes = [];
    this.emberMaterials = [];
    this.logCrackMaterials = [];
    this.candleFlames = [];
    this.candleLights = [];
    this.rainParticles = null;
    this.windowDroplets = [];

    this.clock = new THREE.Clock();
    this.cameraTransitionActive = false;
    this.lastPointerMoveTime = 0;
    this.isDisposed = false;
    this.frameId = null;
  }

  init(containerEl, labelsContainerEl) {
    const resolvedContainer =
      containerEl ||
      document.getElementById("library-canvas-container") ||
      document.getElementById("cozy-library-3d-canvas-wrap");
    if (!resolvedContainer) return;
    this.container = resolvedContainer;
    this.labelsContainer = labelsContainerEl || document.getElementById("cozy-library-3d-labels");

    const oldCanvas = this.container.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    const stageEl = document.getElementById("cozy-library-stage");
    const width = this.container.clientWidth || (stageEl ? stageEl.clientWidth : 0) || 1040;
    const height = this.container.clientHeight || (stageEl ? stageEl.clientHeight : 0) || 640;

    // 1. Scene & Late-Night Archive Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b120e);
    this.scene.fog = new THREE.FogExp2(0x0b120e, 0.017);

    // 2. Camera (Extended far plane so side-by-side Top View of all 3 halls never clips)
    this.camera = new THREE.PerspectiveCamera(37, width / height, 0.1, 160);
    this.camera.position.copy(CAMERA_PRESETS.overview.pos);
    _camPosGoal.copy(CAMERA_PRESETS.overview.pos);
    _camTargetGoal.copy(CAMERA_PRESETS.overview.target);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });

    const gl = this.renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const rendererStr = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
    isSoftwareGl = /SwiftShader|llvmpipe|softpipe/i.test(rendererStr);

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.32;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(CAMERA_PRESETS.overview.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.06;
    this.controls.minPolarAngle = 0.08;
    this.controls.minDistance = 4.2;
    this.controls.maxDistance = 75.0;
    this.controls.panSpeed = 0.75;
    this.controls.rotateSpeed = 0.75;

    this.controls.addEventListener("start", () => {
      this.cameraTransitionActive = false;
    });

    // 5. Build Shared Materials, Architectural Shell, Props, and Desks
    this.initSharedMaterials();
    this.buildLightingRig();

    // Capture all Ground Floor architectural children into this.groundFloorGroup for clean floor isolation
    const preGroundChildren = new Set(this.scene.children);
    this.buildRoomArchitecture();
    this.buildFloorRugs();
    this.buildBookcaseWalls();
    this.buildArchedRainWindow();
    this.buildStoneFireplace();
    this.buildBotanicalPlanters();
    this.buildBreakLoungeCorner();

    this.groundFloorGroup = new THREE.Group();
    this.groundFloorGroup.name = "GroundFloorHall";
    const groundMeshes = this.scene.children.filter((ch) => !preGroundChildren.has(ch));
    groundMeshes.forEach((ch) => {
      this.groundFloorGroup.add(ch);
    });
    if (this.sconceLights) {
      this.sconceLights.forEach((sl) => this.groundFloorGroup.add(sl));
    }
    if (this.fireplaceLight) {
      this.groundFloorGroup.add(this.fireplaceLight);
    }
    this.scene.add(this.groundFloorGroup);

    this.buildMezzanineFloor();
    this.buildArchiveWing();
    this.buildDesksAndChairs();
    this.updateFloorVisibility();
    this.applyTheme(this.currentAtmosphere || "Cozy Night");

    // Seed default offline desks immediately so the 3D scene renders desks, chairs, bookshelves & fireplace right away
    if (!this.currentDesksData || this.currentDesksData.length === 0) {
      const defaultDesks = DESK_LAYOUTS.map((d) => ({
        id: d.id,
        label: d.label,
        occupiedBy:
          d.id === 1
            ? {
                userId: 2,
                displayName: "Elena Rostova",
                avatarColor: "blue",
                subject: "Calculus III",
                goal: "Stokes' Theorem problem set",
                timerSeconds: 1140,
                lampOn: true,
                posture: "reading",
                isBuddy: true
              }
            : d.id === 3
            ? {
                userId: 3,
                displayName: "Dev Patel",
                avatarColor: "amber",
                subject: "Algorithms",
                goal: "Graph traversals & DFS/BFS",
                timerSeconds: 960,
                lampOn: true,
                posture: "typing",
                isBuddy: true
              }
            : null,
        reservedBy: null
      }));
      this.syncDesks(defaultDesks, window.STUDYMATE_USER?.id || 1, false);
    }

    // 6. Bind Pointer / Raycaster / Resize Listeners
    this.bindEvents();

    // 7. Start Render Loop
    this.startLoop();
  }

  initSharedMaterials() {
    const parquetTex = createChevronParquetTexture();
    const slateTex = createSlateStoneworkTexture();
    this.softShadowTex = createSoftShadowTexture();

    this.materials = {
      floorOak: new THREE.MeshStandardMaterial({
        map: parquetTex,
        roughness: 0.58,
        metalness: 0.06
      }),
      // Warm Dark Academia heritage plaster wall (warm taupe-brown that responds naturally to day & night light)
      wallPlaster: new THREE.MeshStandardMaterial({
        color: 0x6b5341,
        roughness: 0.82,
        metalness: 0.02
      }),
      // Warm antique chestnut (#4a2e1b, roughness: 0.5) for bookshelves
      bookshelfMahogany: new THREE.MeshStandardMaterial({
        color: 0x4a2e1b,
        roughness: 0.5,
        metalness: 0.08
      }),
      bookshelfWalnutTrim: new THREE.MeshStandardMaterial({
        color: 0x4a2e1b,
        roughness: 0.5,
        metalness: 0.08
      }),
      wainscotWalnut: new THREE.MeshStandardMaterial({
        color: 0x4a2e1b,
        roughness: 0.5,
        metalness: 0.08
      }),
      warmOak: new THREE.MeshStandardMaterial({
        color: 0x5c3a22,
        roughness: 0.5,
        metalness: 0.08
      }),
      deskTopWalnut: new THREE.MeshStandardMaterial({
        color: 0x52321c,
        roughness: 0.48,
        metalness: 0.08
      }),
      carvedDarkOak: new THREE.MeshStandardMaterial({
        color: 0x442917,
        roughness: 0.55,
        metalness: 0.08
      }),
      weatheredSlate: new THREE.MeshStandardMaterial({
        map: slateTex,
        roughness: 0.85,
        metalness: 0.06
      }),
      hearthBrick: new THREE.MeshStandardMaterial({
        color: 0x18110e,
        roughness: 0.94,
        metalness: 0.03
      }),
      chairCushion: new THREE.MeshStandardMaterial({
        color: 0x3b261a,
        roughness: 0.72,
        metalness: 0.03
      }),
      brushedBrass: new THREE.MeshStandardMaterial({
        color: 0xc5a049,
        roughness: 0.32,
        metalness: 0.82
      }),
      agedGoldTrim: new THREE.MeshStandardMaterial({
        color: 0xb89b42,
        roughness: 0.38,
        metalness: 0.72
      }),
      ceramicMug: new THREE.MeshStandardMaterial({
        color: 0xebe0cc,
        roughness: 0.34,
        metalness: 0.05
      }),
      coffeeLiquid: new THREE.MeshStandardMaterial({
        color: 0x26140b,
        roughness: 0.2,
        metalness: 0.1
      }),
      creamPaper: new THREE.MeshStandardMaterial({
        color: 0xf5f0e1,
        roughness: 0.76,
        metalness: 0.0
      }),
      notebookLeather: new THREE.MeshStandardMaterial({
        color: 0x3d2314,
        roughness: 0.56,
        metalness: 0.06
      }),
      notebookPages: new THREE.MeshStandardMaterial({
        color: 0xf5f0e1,
        roughness: 0.74,
        metalness: 0.0
      }),
      notebookRibbon: new THREE.MeshStandardMaterial({
        color: 0x801b1b,
        roughness: 0.58,
        metalness: 0.04
      }),
      pageEdgeMuted: new THREE.MeshStandardMaterial({
        color: 0x362b22,
        roughness: 0.9,
        metalness: 0.0
      }),
      laptopBody: new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.38,
        metalness: 0.68
      }),
      laptopScreen: new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        emissive: 0x2563eb,
        emissiveIntensity: 0.52,
        roughness: 0.25
      }),
      terracottaPot: new THREE.MeshStandardMaterial({
        color: 0x5c3222,
        roughness: 0.8,
        metalness: 0.04
      }),
      foliageDark: new THREE.MeshStandardMaterial({
        color: 0x2b4a32,
        roughness: 0.66,
        metalness: 0.02
      }),
      foliageMid: new THREE.MeshStandardMaterial({
        color: 0x385e3f,
        roughness: 0.62,
        metalness: 0.03
      }),
      candleBeeswax: new THREE.MeshStandardMaterial({
        color: 0xead8b1,
        roughness: 0.58,
        metalness: 0.02
      }),
      contactShadow: new THREE.MeshBasicMaterial({
        map: this.softShadowTex,
        transparent: true,
        opacity: 0.64,
        depthWrite: false
      })
    };

    // Generate authentic brown leather-covered book materials in varied natural shades
    this.bookMaterials = DARK_ACADEMIA_BOOK_PALETTE.map((hex, idx) => {
      return new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.48 + (idx % 3) * 0.06,
        metalness: 0.06
      });
    });
  }

  /**
   * Helper to place a soft contact drop-shadow plane beneath furniture or planters
   */
  addContactShadow(parent, x, z, width, depth, opacity = 0.6, yOffset = 0.004) {
    const mat = this.materials.contactShadow.clone();
    mat.opacity = opacity;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, yOffset, z);
    parent.add(plane);
    return plane;
  }

  buildLightingRig() {
    // 1. Warm AmbientLight so room, bookshelves, and floor are clearly visible
    this.ambientLight = new THREE.AmbientLight(0xd0c8b8, 0.65);
    this.scene.add(this.ambientLight);

    // Subtle warm hemisphere fill to ensure wood grain & brown leather book spines retain depth across all themes
    this.ambientHemiLight = new THREE.HemisphereLight(0xf5ead6, 0x7a5234, 0.88);
    this.ambientHemiLight.position.set(0, 12, 0);
    this.scene.add(this.ambientHemiLight);

    // 2. Primary Sun / Moon DirectionalLight casting distinct soft shadows through the arched window
    this.dirLight = new THREE.DirectionalLight(0xffe8cc, 0.85);
    this.dirLight.position.set(-3.5, 12, -7.5);
    this.dirLight.target = new THREE.Object3D();
    this.dirLight.target.position.set(-1.5, 0.1, 0.5);
    this.scene.add(this.dirLight.target);

    this.dirLight.castShadow = !isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.8;
    this.dirLight.shadow.camera.far = 45.0;
    const d = 12.5;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0003;
    this.dirLight.shadow.normalBias = 0.018;
    this.dirLight.shadow.radius = 2.5;
    this.scene.add(this.dirLight);
    this.keyDirLight = this.dirLight;

    // 3. Arched Window Sunbeam / Moonbeam SpotLight streaming through the window into the library
    this.windowMoonLight = new THREE.SpotLight(0x8cb4dc, 1.35, 18, Math.PI / 2.8, 0.65, 0.6);
    this.windowMoonLight.position.set(-2.2, 3.8, -5.6);
    this.windowMoonLight.target.position.set(-2.0, 0.2, -0.5);
    this.scene.add(this.windowMoonLight);
    this.scene.add(this.windowMoonLight.target);

    // 4. Cozy Fireplace Hearth PointLight (#ff7a1a, intensity: 2.2, distance: 10)
    this.fireplaceBaseIntensity = 2.2;
    this.fireplaceLight = new THREE.PointLight(0xff7a1a, 2.2, 10.5, 0.45);
    this.fireplaceLight.position.copy(this.fireplaceBasePos);
    this.fireplaceLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      this.fireplaceLight.shadow.bias = -0.002;
    }
    this.scene.add(this.fireplaceLight);

    // 5. Warm Brass Gallery Sconce Lights above the Antique Chestnut Bookcases
    this.sconceLights = [];
    const sconceCoords = [
      [-5.25, 4.15, -3.85], // Back-left bookcase
      [1.0, 4.15, -3.85],   // Back-center bookcase
      [-6.15, 4.15, -1.9],  // Left wall north bookcase
      [-6.15, 4.15, 1.85]   // Left wall south bookcase
    ];
    sconceCoords.forEach(([sx, sy, sz]) => {
      const sLight = new THREE.PointLight(0xffd28a, 1.05, 6.2, 0.55);
      sLight.position.set(sx, sy, sz);
      this.scene.add(sLight);
      this.sconceLights.push(sLight);
    });
  }

  buildRoomArchitecture() {
    const roomGroup = new THREE.Group();
    const roomW = 14.8;
    const roomD = 10.4;
    const wallH = 5.0;
    const wallThick = 0.35;

    // 1. Chevron Parquet Wooden Floor Platform
    const floorGeo = new THREE.BoxGeometry(roomW, 0.32, roomD);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials.floorOak);
    floorMesh.position.set(0, -0.16, 0);
    floorMesh.receiveShadow = !isSoftwareGl;
    roomGroup.add(floorMesh);

    const rimGeo = new THREE.BoxGeometry(roomW + 0.14, 0.28, roomD + 0.14);
    const rimMesh = new THREE.Mesh(rimGeo, this.materials.bookshelfWalnutTrim);
    rimMesh.position.set(0, -0.18, 0);
    roomGroup.add(rimMesh);

    // 2. Back Wall (North) with actual Arched Window Cutout Hole (prevents Z-fighting)
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-roomW / 2, 0);
    wallShape.lineTo(roomW / 2, 0);
    wallShape.lineTo(roomW / 2, wallH);
    wallShape.lineTo(-roomW / 2, wallH);
    wallShape.closePath();

    // Arched window cutout at x = -2.2, bottomY = 1.10, rectH = 1.95, winW = 2.65
    const winCenterX = -2.2;
    const winW = 2.65;
    const winHalfW = winW / 2;
    const winBottomY = 1.10;
    const winSpringY = winBottomY + 1.95;

    const winCutout = new THREE.Path();
    winCutout.moveTo(winCenterX - winHalfW, winBottomY);
    winCutout.lineTo(winCenterX + winHalfW, winBottomY);
    winCutout.lineTo(winCenterX + winHalfW, winSpringY);
    winCutout.absarc(winCenterX, winSpringY, winHalfW, 0, Math.PI, false);
    winCutout.lineTo(winCenterX - winHalfW, winBottomY);
    wallShape.holes.push(winCutout);

    const backWallGeo = new THREE.ExtrudeGeometry(wallShape, {
      depth: wallThick,
      bevelEnabled: false,
      curveSegments: 36
    });
    const backWall = new THREE.Mesh(backWallGeo, this.materials.wallPlaster);
    backWall.position.set(0, 0, -roomD / 2);
    backWall.receiveShadow = !isSoftwareGl;
    roomGroup.add(backWall);

    // 3. Left Wall (West)
    const leftWallGeo = new THREE.BoxGeometry(wallThick, wallH, roomD);
    const leftWall = new THREE.Mesh(leftWallGeo, this.materials.wallPlaster);
    leftWall.position.set(-roomW / 2 + wallThick / 2, wallH / 2, 0);
    leftWall.receiveShadow = !isSoftwareGl;
    roomGroup.add(leftWall);

    // 4. Lower Walnut Wainscoting Panels (segmented around the window sill to avoid overlap)
    const wainscotH = 1.25;
    const wainscotZ = -roomD / 2 + wallThick + 0.03;

    // Left of arched window (-7.3 to -3.55)
    const wainscotLeftW = (-3.55) - (-roomW / 2 + 0.1);
    const backWainscotLeft = new THREE.Mesh(
      new THREE.BoxGeometry(wainscotLeftW, wainscotH, 0.08),
      this.materials.wainscotWalnut
    );
    backWainscotLeft.position.set((-roomW / 2 + 0.1) + wainscotLeftW / 2, wainscotH / 2, wainscotZ);
    roomGroup.add(backWainscotLeft);

    // Beneath arched window sill (-3.55 to -0.85, height 0.98)
    const underWinW = 2.7;
    const underWinH = 0.98;
    const backWainscotUnderWin = new THREE.Mesh(
      new THREE.BoxGeometry(underWinW, underWinH, 0.08),
      this.materials.wainscotWalnut
    );
    backWainscotUnderWin.position.set(winCenterX, underWinH / 2, wainscotZ);
    roomGroup.add(backWainscotUnderWin);

    // Right of arched window (-0.85 to +7.3)
    const wainscotRightW = (roomW / 2 - 0.1) - (-0.85);
    const backWainscotRight = new THREE.Mesh(
      new THREE.BoxGeometry(wainscotRightW, wainscotH, 0.08),
      this.materials.wainscotWalnut
    );
    backWainscotRight.position.set(-0.85 + wainscotRightW / 2, wainscotH / 2, wainscotZ);
    roomGroup.add(backWainscotRight);

    const leftWainscot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, wainscotH, roomD - 0.2),
      this.materials.wainscotWalnut
    );
    leftWainscot.position.set(-roomW / 2 + wallThick + 0.03, wainscotH / 2, 0);
    roomGroup.add(leftWainscot);

    // Top Crown Molding
    const backCrown = new THREE.Mesh(
      new THREE.BoxGeometry(roomW + 0.06, 0.22, 0.46),
      this.materials.wainscotWalnut
    );
    backCrown.position.set(0, wallH - 0.05, -roomD / 2 + 0.2);
    roomGroup.add(backCrown);

    const leftCrown = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.22, roomD + 0.06),
      this.materials.wainscotWalnut
    );
    leftCrown.position.set(-roomW / 2 + 0.2, wallH - 0.05, 0);
    roomGroup.add(leftCrown);

    this.scene.add(roomGroup);
  }

  buildFloorRugs() {
    // Muted, earthy Dark Academia rugs that harmonize with the chevron oak floor
    const rugConfigs = [
      {
        // Window Nook: Antique Sage Green & Muted Parchment (Desks 1-5 comfortably centered)
        x: -3.2,
        z: -2.3,
        w: 6.2,
        d: 4.2,
        primary: "#223127",
        border: "#324438",
        pattern: "#7c725e"
      },
      {
        // Fireside Alcove: Terracotta / Antique Burgundy & Warm Oatmeal (Desks 6-10)
        x: 3.2,
        z: -2.3,
        w: 6.2,
        d: 4.2,
        primary: "#3f1b1b",
        border: "#592826",
        pattern: "#8c7254"
      },
      {
        // Central Reading Table / Main Archive: Warm Woven Oatmeal / Muted Umber (Desks 11-15)
        x: -3.2,
        z: 2.1,
        w: 6.2,
        d: 4.2,
        primary: "#3b3026",
        border: "#4f4033",
        pattern: "#8a7963"
      },
      {
        // Quiet Corner: Muted Walnut & Antique Sage-Beige (Desks 16-20)
        x: 3.2,
        z: 2.1,
        w: 6.2,
        d: 4.2,
        primary: "#2b241f",
        border: "#3d332c",
        pattern: "#756a5a"
      }
    ];

    rugConfigs.forEach((cfg) => {
      const tex = createWovenRugTexture(cfg.primary, cfg.border, cfg.pattern);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.9,
        metalness: 0.01
      });
      const geo = new THREE.BoxGeometry(cfg.w, 0.024, cfg.d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.x, 0.012, cfg.z);
      mesh.receiveShadow = !isSoftwareGl;
      this.scene.add(mesh);
    });
  }

  buildBookcaseWalls() {
    this.sconceBulbs = [];
    // 1. Back Wall Left Bookcase (with rolling brass library ladder)
    this.buildSingleBookcase({
      x: -5.25,
      z: -4.62,
      rotY: 0,
      width: 2.85,
      height: 4.35,
      depth: 0.56,
      shelves: 5,
      hasLadder: true
    });

    // 2. Back Wall Center-Right Bookcase (between Arched Window and Stone Fireplace)
    this.buildSingleBookcase({
      x: 1.0,
      z: -4.62,
      rotY: 0,
      width: 2.75,
      height: 4.35,
      depth: 0.56,
      shelves: 5,
      hasLadder: false
    });

    // 3. Left Wall North Bookcase
    this.buildSingleBookcase({
      x: -6.92,
      z: -1.9,
      rotY: Math.PI / 2,
      width: 3.2,
      height: 4.35,
      depth: 0.56,
      shelves: 5,
      hasLadder: false
    });

    // 4. Left Wall South Bookcase (with rolling brass library ladder)
    this.buildSingleBookcase({
      x: -6.92,
      z: 1.85,
      rotY: Math.PI / 2,
      width: 3.2,
      height: 4.35,
      depth: 0.56,
      shelves: 5,
      hasLadder: true
    });
  }

  buildSingleBookcase({ x, z, rotY, width, height, depth, shelves, hasLadder }) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Soft floor drop-shadow under bookcase
    this.addContactShadow(group, 0, 0.04, width + 0.35, depth + 0.35, 0.65);

    // Back panel in antique mahogany
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.06),
      this.materials.bookshelfMahogany
    );
    backPanel.position.set(0, height / 2, -depth / 2 + 0.03);
    backPanel.castShadow = !isSoftwareGl;
    backPanel.receiveShadow = !isSoftwareGl;
    group.add(backPanel);

    // Side pillars
    const sideGeo = new THREE.BoxGeometry(0.14, height, depth);
    const leftSide = new THREE.Mesh(sideGeo, this.materials.bookshelfMahogany);
    leftSide.position.set(-width / 2 + 0.07, height / 2, 0);
    leftSide.castShadow = !isSoftwareGl;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, this.materials.bookshelfMahogany);
    rightSide.position.set(width / 2 - 0.07, height / 2, 0);
    rightSide.castShadow = !isSoftwareGl;
    group.add(rightSide);

    // Top cornice
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.14, 0.18, depth + 0.1),
      this.materials.bookshelfWalnutTrim
    );
    cornice.position.set(0, height + 0.06, 0.02);
    group.add(cornice);

    // Brass gallery light fixture at top center
    const sconceArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.24, 8),
      this.materials.brushedBrass
    );
    sconceArm.rotation.x = Math.PI / 2;
    sconceArm.position.set(0, height + 0.02, depth / 2 + 0.08);
    group.add(sconceArm);

    const sconceShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.13, 12, 1, true),
      this.materials.brushedBrass
    );
    sconceShade.position.set(0, height - 0.02, depth / 2 + 0.18);
    group.add(sconceShade);

    const sconceBulbMat = new THREE.MeshBasicMaterial({ color: 0xffdf9a });
    const sconceBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      sconceBulbMat
    );
    sconceBulb.position.set(0, height - 0.05, depth / 2 + 0.18);
    group.add(sconceBulb);
    this.sconceBulbs.push(sconceBulbMat);

    // Shelves + 3D Brown Leather-Bound Books with Cream Page Edges & Gilt Spine Bands
    const shelfGeo = new THREE.BoxGeometry(width - 0.16, 0.08, depth - 0.04);

    for (let s = 0; s <= shelves; s++) {
      const sy = 0.22 + (s * (height - 0.34)) / shelves;
      const shelf = new THREE.Mesh(shelfGeo, this.materials.bookshelfMahogany);
      shelf.position.set(0, sy, 0.01);
      shelf.receiveShadow = !isSoftwareGl;
      group.add(shelf);

      if (s < shelves) {
        let cursorX = -width / 2 + 0.22;
        const maxBookX = width / 2 - 0.24;
        let bookIdx = s * 19 + Math.round(Math.abs(x * 10 + z * 7));

        while (cursorX < maxBookX) {
          const bw = 0.055 + ((bookIdx * 17) % 10) * 0.008;
          const bh = 0.34 + ((bookIdx * 23) % 10) * 0.024;
          const bd = 0.26 + ((bookIdx * 13) % 6) * 0.015;
          const mat = this.bookMaterials[bookIdx % this.bookMaterials.length];

          // Occasional horizontal vintage leather book stack
          if (bookIdx % 13 === 0 && cursorX + 0.34 < maxBookX) {
            const stackCount = 2 + (bookIdx % 2);
            let stackY = sy + 0.04;
            for (let k = 0; k < stackCount; k++) {
              const stackMat = this.bookMaterials[(bookIdx + k * 3) % this.bookMaterials.length];
              const hBook = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.055, bd), stackMat);
              hBook.position.set(cursorX + 0.14, stackY + 0.028, 0.04);
              hBook.rotation.y = (k % 2 === 0 ? 1 : -1) * 0.05;
              group.add(hBook);
              stackY += 0.058;
            }
            cursorX += 0.33;
            bookIdx++;
            continue;
          }

          const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
          const lean = bookIdx % 9 === 0 ? -0.11 : 0;
          bookMesh.position.set(cursorX + bw / 2, sy + 0.04 + bh / 2, 0.04 + (bookIdx % 3) * 0.012);
          bookMesh.rotation.z = lean;
          group.add(bookMesh);

          // Muted dark parchment page-edge block visible along the top of the brown leather cover
          const pageTop = new THREE.Mesh(
            new THREE.BoxGeometry(bw * 0.82, 0.008, bd * 0.92),
            this.materials.pageEdgeMuted
          );
          pageTop.position.set(
            bookMesh.position.x,
            sy + 0.04 + bh - 0.002,
            bookMesh.position.z - 0.004
          );
          pageTop.rotation.z = lean;
          group.add(pageTop);

          // Subtle gilded gold spine band on antique leather volumes
          if (bookIdx % 3 === 0) {
            const band = new THREE.Mesh(
              new THREE.BoxGeometry(bw + 0.004, 0.02, bd + 0.006),
              this.materials.agedGoldTrim
            );
            band.position.set(
              bookMesh.position.x,
              sy + 0.04 + bh * 0.76,
              bookMesh.position.z
            );
            band.rotation.z = lean;
            group.add(band);
          }

          cursorX += bw + 0.012 + (bookIdx % 7 === 0 ? 0.07 : 0);
          bookIdx++;
        }
      }
    }

    // Rolling Brass & Walnut Library Ladder
    if (hasLadder) {
      const ladderGroup = new THREE.Group();
      ladderGroup.position.set(width * 0.24, 0, depth / 2 + 0.26);
      ladderGroup.rotation.x = -0.13;

      const brassRail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, width - 0.1, 10),
        this.materials.brushedBrass
      );
      brassRail.rotation.z = Math.PI / 2;
      brassRail.position.set(0, height - 0.28, depth / 2 + 0.06);
      group.add(brassRail);

      const railGeo = new THREE.CylinderGeometry(0.026, 0.026, height - 0.15, 8);
      const leftRail = new THREE.Mesh(railGeo, this.materials.warmOak);
      leftRail.position.set(-0.22, (height - 0.15) / 2, 0);
      ladderGroup.add(leftRail);

      const rightRail = new THREE.Mesh(railGeo, this.materials.warmOak);
      rightRail.position.set(0.22, (height - 0.15) / 2, 0);
      ladderGroup.add(rightRail);

      for (let r = 1; r <= 8; r++) {
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, 0.44, 8),
          this.materials.brushedBrass
        );
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, r * 0.46, 0);
        ladderGroup.add(rung);
      }

      group.add(ladderGroup);
    }

    this.scene.add(group);
  }

  /**
   * Builds a vintage arched mullioned window set cleanly into the back wall cutout,
   * overlooking a realistic sky with clouds, sun or moon, and 3D exterior trees.
   */
  buildArchedRainWindow() {
    const winGroup = new THREE.Group();
    // Positioned at the front face of the North back wall cutout (z = -4.85) so zero Z-fighting occurs
    winGroup.position.set(-2.2, 2.55, -4.85);

    const winW = 2.65;
    const rectH = 1.95;
    const archR = winW / 2;
    const bottomY = -1.45;
    const springY = bottomY + rectH;
    const totalH = rectH + archR;

    // Helper to build an arched 2D shape
    const createArchShape = (w, rH, bY) => {
      const halfW = w / 2;
      const sY = bY + rH;
      const shape = new THREE.Shape();
      shape.moveTo(-halfW, bY);
      shape.lineTo(halfW, bY);
      shape.lineTo(halfW, sY);
      shape.absarc(0, sY, halfW, 0, Math.PI, false);
      shape.lineTo(-halfW, bY);
      return shape;
    };

    // 1. Pre-generate procedural outdoor sky textures (sky gradient, clouds, sun/moon, and trees)
    this.skyTextures = {
      "Daylight": createOutdoorSkyTexture("Daylight"),
      "Golden Hour": createOutdoorSkyTexture("Golden Hour"),
      "Autumn Rain": createOutdoorSkyTexture("Autumn Rain"),
      "Cozy Night": createOutdoorSkyTexture("Cozy Night")
    };
    this.skyTextures["Cloudy Afternoon"] = this.skyTextures["Daylight"];
    this.skyTextures["Rainy Night"] = this.skyTextures["Autumn Rain"];
    this.skyTextures["Midnight Study"] = this.skyTextures["Cozy Night"];

    // Exterior skyMesh (PlaneGeometry) fitted directly behind the arched window cutout frame (z = -0.09 inside winGroup)
    const skyPlaneGeo = new THREE.PlaneGeometry(2.85, 3.4);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTextures["Autumn Rain"],
      color: 0xffffff,
      fog: false,
      side: THREE.DoubleSide
    });
    this.skyMesh = new THREE.Mesh(skyPlaneGeo, skyMat);
    this.skyMesh.position.set(0, 0.18, -0.09);
    winGroup.add(this.skyMesh);
    this.windowSky = this.skyMesh;
    window.skyMesh = this.skyMesh;
    window.windowSky = this.skyMesh;

    // 1b. 3D Exterior Trees & Canopy Silhouettes outside the window (z = -6.3 to -7.1) for natural parallax
    const exteriorTreesGroup = new THREE.Group();
    exteriorTreesGroup.position.set(-2.2, 0, -6.5);
    const barkMat = new THREE.MeshStandardMaterial({
      color: 0x2b1d14,
      roughness: 0.9,
      metalness: 0.02
    });
    const foliageMatA = new THREE.MeshStandardMaterial({
      color: 0x3b5c3e,
      roughness: 0.78,
      metalness: 0.02,
      fog: false
    });
    const foliageMatB = new THREE.MeshStandardMaterial({
      color: 0x52734d,
      roughness: 0.75,
      metalness: 0.02,
      fog: false
    });
    this.exteriorFoliageMats = [foliageMatA, foliageMatB];

    const treeSpecs = [
      { x: -1.45, z: -0.15, h: 3.6, r: 1.05 },
      { x: 1.38, z: -0.25, h: 3.8, r: 1.15 },
      { x: -0.35, z: -0.65, h: 2.65, r: 0.95 }
    ];
    treeSpecs.forEach((ts, idx) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(ts.x, 0, ts.z);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.18, ts.h, 10),
        barkMat
      );
      trunk.position.y = ts.h / 2;
      tGroup.add(trunk);

      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.09, 1.1, 8),
        barkMat
      );
      branch.position.set(idx % 2 === 0 ? 0.34 : -0.34, ts.h * 0.72, 0.1);
      branch.rotation.z = idx % 2 === 0 ? -0.65 : 0.65;
      tGroup.add(branch);

      const crownOffsets = [
        [0, ts.h, 0, ts.r * 0.68],
        [-0.38, ts.h - 0.28, 0.12, ts.r * 0.56],
        [0.4, ts.h - 0.24, -0.08, ts.r * 0.58],
        [0.12, ts.h + 0.32, 0.06, ts.r * 0.52]
      ];
      crownOffsets.forEach(([cx, cy, cz, cr], cIdx) => {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(cr, 1),
          (idx + cIdx) % 2 === 0 ? foliageMatA : foliageMatB
        );
        puff.scale.set(1.15, 0.88, 0.95);
        puff.position.set(cx, cy, cz);
        tGroup.add(puff);
      });

      exteriorTreesGroup.add(tGroup);
    });
    this.scene.add(exteriorTreesGroup);

    // 2. Refractive Arched Window Glass with Specular Highlights (set inside the open arch cutout)
    const archGlassShape = createArchShape(winW - 0.04, rectH, bottomY);
    const archGlassGeo = new THREE.ShapeGeometry(archGlassShape, 36);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.12,
      roughness: 0.08,
      metalness: 0.04,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      depthWrite: false
    });
    const glassPane = new THREE.Mesh(archGlassGeo, glassMat);
    glassPane.position.set(0, 0, -0.08);
    winGroup.add(glassPane);

    // 3. Soft Refractive Rain Droplets Clinging to the Arched Glass
    const dropletGeo = new THREE.SphereGeometry(0.017, 8, 8);
    const dropletMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.62,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0
    });
    this.windowDroplets = [];
    for (let i = 0; i < 65; i++) {
      const dx = (Math.random() - 0.5) * (winW - 0.25);
      const dy = bottomY + 0.12 + Math.random() * (totalH - 0.35);
      if (dy > springY && (dx * dx + (dy - springY) * (dy - springY)) > (archR - 0.12) * (archR - 0.12)) {
        continue;
      }
      const drop = new THREE.Mesh(dropletGeo, dropletMat);
      const scale = 0.7 + Math.random() * 0.9;
      drop.scale.set(scale * 0.8, scale * 1.35, scale * 0.4);
      drop.position.set(dx, dy, -0.05);
      drop.userData = { speed: 0.12 + Math.random() * 0.22, minY: bottomY + 0.1, maxY: springY + 0.6 };
      winGroup.add(drop);
      this.windowDroplets.push(drop);
    }

    // 4. Subtle Translucent Downward Rain Streaks Outside the Cutout (z = -0.55 relative to window)
    const rainCount = 95;
    const rainPositions = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * (winW - 0.2);
      const ry = bottomY + Math.random() * (totalH - 0.2);
      const rz = -0.55;
      const streakLen = 0.22 + Math.random() * 0.12;
      rainPositions[i * 6 + 0] = rx;
      rainPositions[i * 6 + 1] = ry;
      rainPositions[i * 6 + 2] = rz;
      rainPositions[i * 6 + 3] = rx - 0.025;
      rainPositions[i * 6 + 4] = ry - streakLen;
      rainPositions[i * 6 + 5] = rz;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.36
    });
    this.rainParticles = new THREE.LineSegments(rainGeo, rainMat);
    winGroup.add(this.rainParticles);

    // 5. Vintage Arched Dark Carved Wood Window Frame & Mullioned Dividers
    const outerShape = createArchShape(winW + 0.34, rectH, bottomY);
    const innerHole = createArchShape(winW - 0.04, rectH, bottomY);
    outerShape.holes.push(innerHole);

    const frameGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });
    const archFrameMesh = new THREE.Mesh(frameGeo, this.materials.carvedDarkOak);
    archFrameMesh.position.set(0, 0, -0.36);
    archFrameMesh.castShadow = !isSoftwareGl;
    winGroup.add(archFrameMesh);

    // Vertical dark wooden mullions clipped cleanly to the arch height
    [-0.46, 0.46].forEach((mx) => {
      const maxH = springY + Math.sqrt(Math.max(0, archR * archR - mx * mx)) - bottomY;
      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, maxH, 0.1),
        this.materials.carvedDarkOak
      );
      vMullion.position.set(mx, bottomY + maxH / 2, 0.06);
      vMullion.castShadow = !isSoftwareGl;
      winGroup.add(vMullion);
    });

    // Center primary vertical mullion
    const centerMullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, totalH, 0.11),
      this.materials.carvedDarkOak
    );
    centerMullion.position.set(0, bottomY + totalH / 2, 0.06);
    centerMullion.castShadow = !isSoftwareGl;
    winGroup.add(centerMullion);

    // Horizontal dark wooden transoms
    [-0.5, 0.5].forEach((my) => {
      const hTransom = new THREE.Mesh(
        new THREE.BoxGeometry(winW, 0.06, 0.11),
        this.materials.carvedDarkOak
      );
      hTransom.position.set(0, my, 0.06);
      hTransom.castShadow = !isSoftwareGl;
      winGroup.add(hTransom);
    });

    // Arched Gothic/Georgian fanlight tracery ring inside the upper arch
    const innerTracery = new THREE.Mesh(
      new THREE.TorusGeometry(archR * 0.56, 0.026, 8, 28, Math.PI),
      this.materials.carvedDarkOak
    );
    innerTracery.position.set(0, springY, 0.06);
    innerTracery.castShadow = !isSoftwareGl;
    winGroup.add(innerTracery);

    // 6. Deep Carved Walnut Windowsill Ledge + Stacked Brown Leather Books
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(winW + 0.54, 0.15, 0.46),
      this.materials.carvedDarkOak
    );
    sill.position.set(0, bottomY - 0.04, 0.17);
    sill.castShadow = !isSoftwareGl;
    winGroup.add(sill);

    const sillBook1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.065, 0.25),
      this.bookMaterials[0]
    );
    sillBook1.position.set(0.76, bottomY + 0.06, 0.18);
    sillBook1.rotation.y = 0.12;
    winGroup.add(sillBook1);

    const sillBook2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.055, 0.23),
      this.bookMaterials[2]
    );
    sillBook2.position.set(0.76, bottomY + 0.12, 0.18);
    sillBook2.rotation.y = -0.08;
    winGroup.add(sillBook2);

    this.scene.add(winGroup);
  }

  /**
   * Builds a realistic cozy fireplace with weathered slate/stone, carved dark oak mantel,
   * irregular glowing ember bed, charred wood logs, and natural flickering beeswax candles.
   */
  buildStoneFireplace() {
    const fpGroup = new THREE.Group();
    fpGroup.position.set(4.3, 0, -4.42);

    // Soft contact drop-shadow under hearth
    this.addContactShadow(fpGroup, 0, 0.25, 3.3, 1.8, 0.72);

    // 1. Weathered Slate Hearth Slab
    const hearthSlab = new THREE.Mesh(
      new THREE.BoxGeometry(3.05, 0.18, 1.55),
      this.materials.weatheredSlate
    );
    hearthSlab.position.set(0, 0.09, 0.24);
    hearthSlab.receiveShadow = !isSoftwareGl;
    fpGroup.add(hearthSlab);

    // 2. Weathered Slate Surround Pillars & Chimney Breast
    const pillarGeo = new THREE.BoxGeometry(0.68, 2.85, 0.95);
    const leftPillar = new THREE.Mesh(pillarGeo, this.materials.weatheredSlate);
    leftPillar.position.set(-1.05, 1.5, 0);
    leftPillar.castShadow = !isSoftwareGl;
    leftPillar.receiveShadow = !isSoftwareGl;
    fpGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, this.materials.weatheredSlate);
    rightPillar.position.set(1.05, 1.5, 0);
    rightPillar.castShadow = !isSoftwareGl;
    rightPillar.receiveShadow = !isSoftwareGl;
    fpGroup.add(rightPillar);

    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(2.78, 0.65, 0.98),
      this.materials.weatheredSlate
    );
    lintel.position.set(0, 2.58, 0.02);
    fpGroup.add(lintel);

    const chimneyBreast = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, 2.1, 0.62),
      this.materials.weatheredSlate
    );
    chimneyBreast.position.set(0, 3.95, -0.14);
    fpGroup.add(chimneyBreast);

    // 3. Dark Carved Oak Mantelpiece Shelf, Frieze & Corbels
    const mantelShelf = new THREE.Mesh(
      new THREE.BoxGeometry(3.18, 0.22, 1.18),
      this.materials.carvedDarkOak
    );
    mantelShelf.position.set(0, 2.96, 0.08);
    mantelShelf.castShadow = !isSoftwareGl;
    fpGroup.add(mantelShelf);

    // Carved Oak Corbel Brackets under Mantel
    [-1.05, 1.05].forEach((cx) => {
      const corbel = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.36, 0.32),
        this.materials.carvedDarkOak
      );
      corbel.position.set(cx, 2.7, 0.48);
      fpGroup.add(corbel);
    });

    const oakFrieze = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.24, 0.08),
      this.materials.carvedDarkOak
    );
    oakFrieze.position.set(0, 2.74, 0.5);
    fpGroup.add(oakFrieze);

    // 4. Soot-Darkened Brick Firebox Interior
    const fireboxBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.15, 0.18),
      this.materials.hearthBrick
    );
    fireboxBack.position.set(0, 1.18, -0.34);
    fpGroup.add(fireboxBack);

    const fireboxLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 2.15, 0.8),
      this.materials.hearthBrick
    );
    fireboxLeft.position.set(-0.68, 1.18, -0.02);
    fpGroup.add(fireboxLeft);

    const fireboxRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 2.15, 0.8),
      this.materials.hearthBrick
    );
    fireboxRight.position.set(0.68, 1.18, -0.02);
    fpGroup.add(fireboxRight);

    // Cast-Iron Andirons with Brass Finials
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1a1918,
      roughness: 0.6,
      metalness: 0.75
    });
    [-0.42, 0.42].forEach((ax) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.36, 10), ironMat);
      post.position.set(ax, 0.35, 0.24);
      fpGroup.add(post);

      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), this.materials.brushedBrass);
      finial.position.set(ax, 0.55, 0.24);
      fpGroup.add(finial);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.48), ironMat);
      bar.position.set(ax, 0.24, 0.02);
      fpGroup.add(bar);
    });

    // 5. Irregular Glowing Ember Bed (Dodecahedron coal/ash mounds with emissive orange-red glow)
    this.emberMaterials = [];
    const baseEmberMat = new THREE.MeshStandardMaterial({
      color: 0x2e0d05,
      emissive: 0xff4500,
      emissiveIntensity: 1.45,
      roughness: 0.88
    });
    const hotEmberMat = new THREE.MeshStandardMaterial({
      color: 0x451406,
      emissive: 0xff851b,
      emissiveIntensity: 2.1,
      roughness: 0.75
    });
    this.emberMaterials.push(baseEmberMat, hotEmberMat);

    const emberClusters = [
      { x: 0.0, y: 0.21, z: 0.02, sx: 1.8, sy: 0.38, sz: 1.1, r: 0.28, hot: false },
      { x: -0.26, y: 0.23, z: 0.06, sx: 1.2, sy: 0.42, sz: 0.9, r: 0.22, hot: true },
      { x: 0.28, y: 0.22, z: 0.04, sx: 1.3, sy: 0.36, sz: 0.95, r: 0.22, hot: true },
      { x: 0.04, y: 0.25, z: -0.06, sx: 1.1, sy: 0.45, sz: 0.8, r: 0.2, hot: true },
      { x: -0.38, y: 0.20, z: -0.04, sx: 0.9, sy: 0.32, sz: 0.7, r: 0.16, hot: false },
      { x: 0.38, y: 0.20, z: 0.1, sx: 0.85, sy: 0.32, sz: 0.7, r: 0.16, hot: false }
    ];
    emberClusters.forEach((ec, idx) => {
      const geo = new THREE.DodecahedronGeometry(ec.r, 1);
      const mesh = new THREE.Mesh(geo, ec.hot ? hotEmberMat : baseEmberMat);
      mesh.scale.set(ec.sx, ec.sy, ec.sz);
      mesh.position.set(ec.x, ec.y, ec.z);
      mesh.rotation.set(idx * 0.4, idx * 0.7, idx * 0.3);
      fpGroup.add(mesh);
    });

    // 6. Charred Wood Logs Resting on the Glowing Ember Bed (no yellow cylinder pegs)
    const charredBarkMat = new THREE.MeshStandardMaterial({
      color: 0x1a120e,
      roughness: 0.95,
      metalness: 0.02
    });
    const glowingCrackMat = new THREE.MeshStandardMaterial({
      color: 0x2a1008,
      emissive: 0xea580c,
      emissiveIntensity: 0.95,
      roughness: 0.9
    });
    this.logCrackMaterials = [glowingCrackMat];

    const logSpecs = [
      // Bottom front charred oak log
      { r1: 0.095, r2: 0.088, len: 0.96, x: 0.0, y: 0.31, z: 0.11, rx: 0.04, ry: 0.14, rz: Math.PI / 2 },
      // Bottom back charred oak log
      { r1: 0.105, r2: 0.095, len: 1.04, x: 0.0, y: 0.33, z: -0.09, rx: -0.05, ry: -0.1, rz: Math.PI / 2 },
      // Crossed diagonal left split log
      { r1: 0.082, r2: 0.072, len: 0.82, x: -0.12, y: 0.44, z: 0.02, rx: 0.22, ry: 0.38, rz: 1.36 },
      // Crossed diagonal right split log
      { r1: 0.078, r2: 0.068, len: 0.78, x: 0.16, y: 0.43, z: 0.01, rx: -0.18, ry: -0.34, rz: 1.78 }
    ];

    logSpecs.forEach((ls) => {
      const logGroup = new THREE.Group();
      logGroup.position.set(ls.x, ls.y, ls.z);
      logGroup.rotation.set(ls.rx, ls.ry, ls.rz);

      const mainLog = new THREE.Mesh(
        new THREE.CylinderGeometry(ls.r1, ls.r2, ls.len, 10),
        charredBarkMat
      );
      logGroup.add(mainLog);

      // Glowing ember seam along the underside of the log
      const emberStrip = new THREE.Mesh(
        new THREE.CylinderGeometry(ls.r1 * 0.92, ls.r2 * 0.92, ls.len * 0.76, 8),
        glowingCrackMat
      );
      emberStrip.position.set(-0.015, 0, 0);
      logGroup.add(emberStrip);

      fpGroup.add(logGroup);
    });

    // 7. Layered Organic Translucent Fire Flames (Rising between the charred logs)
    this.flameMeshes = [];
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff5a1f,
      transparent: true,
      opacity: 0.74
    });
    const midFlameMat = new THREE.MeshBasicMaterial({
      color: 0xff9e2c,
      transparent: true,
      opacity: 0.82
    });
    const coreFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffe89e,
      transparent: true,
      opacity: 0.9
    });

    const flamePositions = [
      { x: -0.26, y: 0.48, z: 0.02, r: 0.10, h: 0.34, phase: 0.0 },
      { x: -0.08, y: 0.52, z: -0.02, r: 0.12, h: 0.44, phase: 1.3 },
      { x: 0.08, y: 0.50, z: 0.04, r: 0.11, h: 0.40, phase: 2.5 },
      { x: 0.25, y: 0.47, z: -0.01, r: 0.095, h: 0.32, phase: 3.8 },
      { x: 0.0, y: 0.46, z: 0.08, r: 0.085, h: 0.28, phase: 5.1 }
    ];

    flamePositions.forEach((fp) => {
      const fGroup = new THREE.Group();
      fGroup.position.set(fp.x, fp.y, fp.z);

      const outerCone = new THREE.Mesh(new THREE.ConeGeometry(fp.r, fp.h, 10), outerFlameMat);
      outerCone.position.y = fp.h * 0.35;
      fGroup.add(outerCone);

      const midCone = new THREE.Mesh(new THREE.ConeGeometry(fp.r * 0.7, fp.h * 0.78, 10), midFlameMat);
      midCone.position.y = fp.h * 0.28;
      fGroup.add(midCone);

      const coreCone = new THREE.Mesh(new THREE.ConeGeometry(fp.r * 0.42, fp.h * 0.5, 8), coreFlameMat);
      coreCone.position.y = fp.h * 0.18;
      fGroup.add(coreCone);

      fGroup.userData = { baseX: fp.x, baseY: fp.y, phase: fp.phase };
      fpGroup.add(fGroup);
      this.flameMeshes.push(fGroup);
    });

    // 8. Mantelpiece Props: Vintage Brass Clock & Natural Multi-Part Beeswax Candles
    const clockBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.34, 0.16),
      this.materials.carvedDarkOak
    );
    clockBody.position.set(0, 3.24, 0.08);
    fpGroup.add(clockBody);

    const clockBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.115, 0.014, 8, 20),
      this.materials.brushedBrass
    );
    clockBezel.position.set(0, 3.25, 0.165);
    fpGroup.add(clockBezel);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 20),
      this.materials.creamPaper
    );
    clockFace.position.set(0, 3.25, 0.166);
    fpGroup.add(clockFace);

    // Natural Candle Clusters on Left & Right of Mantelpiece
    this.candleFlames = [];
    this.candleLights = [];

    const mantelCandles = [
      // Left candelabra cluster (3 staggered beeswax pillar/taper candles)
      { x: -1.12, z: 0.08, radius: 0.044, height: 0.28, holderH: 0.12, phase: 0.4, hasLight: true },
      { x: -0.94, z: 0.14, radius: 0.038, height: 0.21, holderH: 0.08, phase: 1.9, hasLight: false },
      { x: -1.26, z: 0.15, radius: 0.035, height: 0.17, holderH: 0.06, phase: 3.4, hasLight: false },
      // Right candelabra cluster (2 staggered beeswax candles)
      { x: 1.06, z: 0.09, radius: 0.042, height: 0.26, holderH: 0.11, phase: 2.2, hasLight: true },
      { x: 1.22, z: 0.15, radius: 0.036, height: 0.19, holderH: 0.07, phase: 4.7, hasLight: false }
    ];

    mantelCandles.forEach((mc) => {
      this.buildNaturalCandle(fpGroup, mc.x, 3.07, mc.z, mc.radius, mc.height, mc.holderH, mc.phase, mc.hasLight);
    });

    this.scene.add(fpGroup);
  }

  /**
   * Builds a natural beeswax/ivory candle with antique brass saucer holder, uneven melted wax rim,
   * side wax drips, charred cotton wick, and a dual-layered teardrop flame.
   */
  buildNaturalCandle(parent, x, baseY, z, radius, waxHeight, holderHeight, phase, addPointLight = false) {
    const cGroup = new THREE.Group();
    cGroup.position.set(x, baseY, z);

    // 1. Antique Brass Candle Holder (Saucer base + turned stem + drip cup)
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.65, radius * 1.35, 0.025, 14),
      this.materials.brushedBrass
    );
    saucer.position.y = 0.012;
    cGroup.add(saucer);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.42, radius * 0.72, holderHeight, 12),
      this.materials.brushedBrass
    );
    stem.position.y = 0.025 + holderHeight / 2;
    cGroup.add(stem);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.18, radius * 0.85, 0.035, 14),
      this.materials.brushedBrass
    );
    cup.position.y = 0.025 + holderHeight + 0.015;
    cGroup.add(cup);

    const waxStartY = 0.025 + holderHeight + 0.03;

    // 2. Natural Beeswax Pillar Body
    const candleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.94, radius, waxHeight, 16),
      this.materials.candleBeeswax
    );
    candleBody.position.y = waxStartY + waxHeight / 2;
    cGroup.add(candleBody);

    // 3. Uneven Melted Wax Rim & Organic Wax Drips down the sides
    const rimTorus = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.78, radius * 0.18, 8, 16),
      this.materials.candleBeeswax
    );
    rimTorus.rotation.x = Math.PI / 2;
    rimTorus.rotation.y = 0.08;
    rimTorus.position.y = waxStartY + waxHeight - 0.005;
    cGroup.add(rimTorus);

    // 3 organic wax drips at varied angles & lengths
    for (let d = 0; d < 3; d++) {
      const angle = phase + d * 2.1;
      const dripLen = waxHeight * (0.28 + (d % 2) * 0.22);
      const dripR = radius * 0.16;
      const dx = Math.cos(angle) * (radius * 0.92);
      const dz = Math.sin(angle) * (radius * 0.92);

      const drip = new THREE.Mesh(
        new THREE.CylinderGeometry(dripR * 0.7, dripR, dripLen, 8),
        this.materials.candleBeeswax
      );
      drip.position.set(dx, waxStartY + waxHeight - dripLen / 2, dz);
      cGroup.add(drip);

      const dripDrop = new THREE.Mesh(
        new THREE.SphereGeometry(dripR * 1.05, 8, 8),
        this.materials.candleBeeswax
      );
      dripDrop.position.set(dx, waxStartY + waxHeight - dripLen, dz);
      cGroup.add(dripDrop);
    }

    // 4. Charred Cotton Wick with tiny glowing tip
    const wickTopY = waxStartY + waxHeight + 0.024;
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.005, 0.032, 6),
      new THREE.MeshBasicMaterial({ color: 0x1c1410 })
    );
    wick.position.set(0, waxStartY + waxHeight + 0.012, 0);
    wick.rotation.z = 0.09;
    cGroup.add(wick);

    const wickEmber = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6b1a })
    );
    wickEmber.position.set(0.001, wickTopY, 0);
    cGroup.add(wickEmber);

    // 5. Dual-Layered Teardrop Candle Flame (Warm White Core + Soft Amber Halo)
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0.001, wickTopY + 0.004, 0);

    const innerCore = new THREE.Mesh(
      new THREE.ConeGeometry(0.014, 0.052, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff8dc })
    );
    innerCore.position.y = 0.024;
    flameGroup.add(innerCore);

    const outerHalo = new THREE.Mesh(
      new THREE.ConeGeometry(0.024, 0.08, 10),
      new THREE.MeshBasicMaterial({
        color: 0xff9d2e,
        transparent: true,
        opacity: 0.68
      })
    );
    outerHalo.position.y = 0.032;
    flameGroup.add(outerHalo);

    flameGroup.userData = { phase };
    cGroup.add(flameGroup);
    this.candleFlames.push(flameGroup);

    if (addPointLight) {
      const cLight = new THREE.PointLight(0xffb14d, 0.42, 3.2, 1.6);
      cLight.position.set(0, wickTopY + 0.06, 0.08);
      cLight.userData = { baseIntensity: 0.42, phase };
      cGroup.add(cLight);
      this.candleLights.push(cLight);
    }

    parent.add(cGroup);
  }

  buildBotanicalPlanters() {
    const plantSpots = [
      { x: -6.2, z: 4.1, scale: 1.05 },
      { x: -0.55, z: -4.2, scale: 0.9 },
      { x: 6.3, z: -3.7, scale: 0.95 },
      { x: 6.3, z: 3.8, scale: 1.0 }
    ];

    plantSpots.forEach((spot, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(spot.x, 0, spot.z);
      pGroup.scale.setScalar(spot.scale);

      // Soft contact drop-shadow beneath potted plant
      this.addContactShadow(pGroup, 0, 0, 0.85, 0.85, 0.65);

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.21, 0.46, 14),
        this.materials.terracottaPot
      );
      pot.position.y = 0.23;
      pot.castShadow = !isSoftwareGl;
      pot.receiveShadow = !isSoftwareGl;
      pGroup.add(pot);

      const potRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.03, 8, 16),
        this.materials.terracottaPot
      );
      potRim.rotation.x = Math.PI / 2;
      potRim.position.y = 0.45;
      pGroup.add(potRim);

      const leafCount = 7;
      for (let l = 0; l < leafCount; l++) {
        const angle = (l / leafCount) * Math.PI * 2 + idx;
        const leafMat = l % 2 === 0 ? this.materials.foliageDark : this.materials.foliageMid;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), leafMat);
        leaf.scale.set(0.7, 0.25, 1.65);
        leaf.position.set(
          Math.cos(angle) * 0.22,
          0.54 + (l % 3) * 0.09,
          Math.sin(angle) * 0.22
        );
        leaf.rotation.y = -angle + Math.PI / 2;
        leaf.rotation.x = 0.38;
        leaf.castShadow = !isSoftwareGl;
        pGroup.add(leaf);
      }

      this.scene.add(pGroup);
    });
  }

  buildBreakLoungeCorner() {
    const loungeGroup = new THREE.Group();
    loungeGroup.name = "BreakLoungeCorner";
    loungeGroup.position.set(5.8, 0, 3.35);

    // 1. Warm Woven Circular Area Rug under the Break Lounge
    const loungeRug = new THREE.Mesh(
      new THREE.CylinderGeometry(1.52, 1.55, 0.018, 32),
      new THREE.MeshStandardMaterial({
        color: 0x6b281e,
        roughness: 0.88,
        metalness: 0.02
      })
    );
    loungeRug.position.set(0, 0.01, 0);
    loungeRug.receiveShadow = !isSoftwareGl;
    loungeGroup.add(loungeRug);

    const rugTrim = new THREE.Mesh(
      new THREE.RingGeometry(1.36, 1.48, 32),
      new THREE.MeshStandardMaterial({
        color: 0xc2a649,
        roughness: 0.7,
        side: THREE.DoubleSide
      })
    );
    rugTrim.rotation.x = -Math.PI / 2;
    rugTrim.position.set(0, 0.021, 0);
    loungeGroup.add(rugTrim);

    // Soft Floor Shadow under Lounge Group
    this.addContactShadow(loungeGroup, 0, 0, 2.5, 2.5, 0.65);

    // 2. Round Carved Oak Coffee Table
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.58, 0.055, 24),
      this.materials.deskTopWalnut
    );
    tableTop.position.set(0, 0.44, 0);
    tableTop.castShadow = !isSoftwareGl;
    tableTop.receiveShadow = !isSoftwareGl;
    loungeGroup.add(tableTop);

    const tableBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.26, 0.42, 16),
      this.materials.warmOak
    );
    tableBase.position.set(0, 0.21, 0);
    loungeGroup.add(tableBase);

    // Warm Brass Table Lamp + Amber Shade on Coffee Table
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 0.22, 12),
      this.materials.brushedBrass
    );
    lampBase.position.set(0, 0.56, 0);
    loungeGroup.add(lampBase);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.14, 16, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xffd180,
        emissive: 0xffb74d,
        emissiveIntensity: 0.75,
        roughness: 0.3,
        side: THREE.DoubleSide
      })
    );
    lampShade.position.set(0, 0.68, 0);
    loungeGroup.add(lampShade);

    const loungeLight = new THREE.PointLight(0xffca7a, 1.15, 4.5);
    loungeLight.position.set(0, 0.75, 0);
    loungeGroup.add(loungeLight);

    // Ceramic Teapot & 4 Steaming Coffee/Tea Mugs on Coffee Table
    const mugColors = [0x2d4f3b, 0x8c3b28, 0x1f3b58, 0x8a6e32];
    [
      [-0.24, -0.20],
      [0.24, -0.20],
      [-0.24, 0.20],
      [0.24, 0.20]
    ].forEach(([mx, mz], idx) => {
      const mugMat = new THREE.MeshStandardMaterial({
        color: mugColors[idx % mugColors.length],
        roughness: 0.3,
        metalness: 0.1
      });
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.095, 12), mugMat);
      mug.position.set(mx, 0.51, mz);
      loungeGroup.add(mug);
    });

    // 3. Four Cozy Tufted Leather Armchairs surrounding Coffee Table
    const armchairGeo = new THREE.BoxGeometry(0.56, 0.46, 0.54);
    const armchairMat = new THREE.MeshStandardMaterial({
      color: 0x4a2518,
      roughness: 0.68,
      metalness: 0.06
    });

    this.loungeArmchairs = [];
    const armchairPositions = [
      { x: -0.96, z: 0, rotY: Math.PI / 2 },
      { x: 0.96, z: 0, rotY: -Math.PI / 2 },
      { x: 0, z: -0.96, rotY: 0 },
      { x: 0, z: 0.96, rotY: Math.PI }
    ];

    armchairPositions.forEach((ap, idx) => {
      const chair = new THREE.Group();
      chair.position.set(ap.x, 0, ap.z);
      chair.rotation.y = ap.rotY;

      const seat = new THREE.Mesh(armchairGeo, armchairMat);
      seat.position.set(0, 0.30, 0);
      seat.castShadow = !isSoftwareGl;
      chair.add(seat);

      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.48, 0.13),
        armchairMat
      );
      back.position.set(0, 0.62, -0.21);
      chair.add(back);

      [-0.26, 0.26].forEach((ax) => {
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.30, 0.52),
          armchairMat
        );
        arm.position.set(ax, 0.48, 0);
        chair.add(arm);
      });

      const charGroup = new THREE.Group();
      chair.add(charGroup);

      loungeGroup.add(chair);
      this.loungeArmchairs.push({ chairGroup: chair, characterGroup: charGroup, index: idx });
    });

    // Invisible Raycast Hit Volume for clicking the Break Lounge directly in 3D
    const loungeHitGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.5, 16);
    const loungeHitMat = new THREE.MeshBasicMaterial({ visible: false });
    const loungeHitMesh = new THREE.Mesh(loungeHitGeo, loungeHitMat);
    loungeHitMesh.position.set(0, 0.75, 0);
    loungeHitMesh.userData = { isBreakLounge: true };
    loungeGroup.add(loungeHitMesh);
    this.loungeHitMesh = loungeHitMesh;

    this.scene.add(loungeGroup);
    this.loungeGroup = loungeGroup;
  }

  /**
   * Shared helper to construct a complete 14.8m x 10.4m cutaway isometric study hall shell
   * (chevron oak floor, walnut rim, North & West heritage walls, wainscoting, crown molding, 4 woven rugs,
   *  mahogany bookcases with leather books & brass ladders, and twin overhead chandeliers).
   */
  buildFullIsometricHallBase(hallGroup, rugConfigs) {
    const roomW = 14.8;
    const roomD = 10.4;
    const wallH = 5.0;
    const wallThick = 0.35;

    // 1. Chevron Parquet Wooden Floor Platform & Trim Rim
    const floorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(roomW, 0.32, roomD),
      this.materials.floorOak
    );
    floorMesh.position.set(0, -0.16, 0);
    floorMesh.receiveShadow = !isSoftwareGl;
    hallGroup.add(floorMesh);

    const rimMesh = new THREE.Mesh(
      new THREE.BoxGeometry(roomW + 0.14, 0.28, roomD + 0.14),
      this.materials.bookshelfWalnutTrim
    );
    rimMesh.position.set(0, -0.18, 0);
    hallGroup.add(rimMesh);

    // 2. North Back Wall & West Left Wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomW, wallH, wallThick),
      this.materials.wallPlaster
    );
    backWall.position.set(0, wallH / 2, -roomD / 2 + wallThick / 2);
    backWall.receiveShadow = !isSoftwareGl;
    hallGroup.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThick, wallH, roomD),
      this.materials.wallPlaster
    );
    leftWall.position.set(-roomW / 2 + wallThick / 2, wallH / 2, 0);
    leftWall.receiveShadow = !isSoftwareGl;
    hallGroup.add(leftWall);

    // 3. Lower Walnut Wainscoting Panels & Top Crown Molding
    const wainscotH = 1.25;
    const backWainscot = new THREE.Mesh(
      new THREE.BoxGeometry(roomW - 0.2, wainscotH, 0.08),
      this.materials.wainscotWalnut
    );
    backWainscot.position.set(0, wainscotH / 2, -roomD / 2 + wallThick + 0.03);
    hallGroup.add(backWainscot);

    const leftWainscot = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, wainscotH, roomD - 0.2),
      this.materials.wainscotWalnut
    );
    leftWainscot.position.set(-roomW / 2 + wallThick + 0.03, wainscotH / 2, 0);
    hallGroup.add(leftWainscot);

    const backCrown = new THREE.Mesh(
      new THREE.BoxGeometry(roomW + 0.06, 0.22, 0.46),
      this.materials.wainscotWalnut
    );
    backCrown.position.set(0, wallH - 0.05, -roomD / 2 + 0.2);
    hallGroup.add(backCrown);

    const leftCrown = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.22, roomD + 0.06),
      this.materials.wainscotWalnut
    );
    leftCrown.position.set(-roomW / 2 + 0.2, wallH - 0.05, 0);
    hallGroup.add(leftCrown);

    // 4. Four Large Woven Area Rugs (6.2m x 4.2m) matching Ground Floor rug zones
    rugConfigs.forEach((cfg) => {
      const tex = createWovenRugTexture(cfg.primary, cfg.border, cfg.pattern);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.9,
        metalness: 0.01
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, 0.024, cfg.d), mat);
      mesh.position.set(cfg.x, 0.012, cfg.z);
      mesh.receiveShadow = !isSoftwareGl;
      hallGroup.add(mesh);
    });

    // 5. Heritage Mahogany Bookcases with Leather Volumes & Brass Rolling Ladders
    const bookcaseSpecs = [
      { x: -5.25, z: -4.62, rotY: 0, width: 2.85, height: 4.35, depth: 0.56, hasLadder: true },
      { x: 5.25, z: -4.62, rotY: 0, width: 2.85, height: 4.35, depth: 0.56, hasLadder: false },
      { x: -6.92, z: -1.9, rotY: Math.PI / 2, width: 3.2, height: 4.35, depth: 0.56, hasLadder: false },
      { x: -6.92, z: 1.85, rotY: Math.PI / 2, width: 3.2, height: 4.35, depth: 0.56, hasLadder: true }
    ];

    bookcaseSpecs.forEach((spec) => {
      const bcGroup = new THREE.Group();
      bcGroup.position.set(spec.x, 0, spec.z);
      bcGroup.rotation.y = spec.rotY;

      this.addContactShadow(bcGroup, 0, 0.04, spec.width + 0.35, spec.depth + 0.35, 0.65);

      const backPanel = new THREE.Mesh(
        new THREE.BoxGeometry(spec.width, spec.height, 0.06),
        this.materials.bookshelfMahogany
      );
      backPanel.position.set(0, spec.height / 2, -spec.depth / 2 + 0.03);
      bcGroup.add(backPanel);

      const sideGeo = new THREE.BoxGeometry(0.14, spec.height, spec.depth);
      [-spec.width / 2 + 0.07, spec.width / 2 - 0.07].forEach((sx) => {
        const side = new THREE.Mesh(sideGeo, this.materials.bookshelfMahogany);
        side.position.set(sx, spec.height / 2, 0);
        bcGroup.add(side);
      });

      const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(spec.width + 0.14, 0.18, spec.depth + 0.1),
        this.materials.bookshelfWalnutTrim
      );
      cornice.position.set(0, spec.height + 0.06, 0.02);
      bcGroup.add(cornice);

      const shelfGeo = new THREE.BoxGeometry(spec.width - 0.16, 0.08, spec.depth - 0.04);
      const shelves = 5;
      for (let s = 0; s <= shelves; s++) {
        const sy = 0.22 + (s * (spec.height - 0.34)) / shelves;
        const shelf = new THREE.Mesh(shelfGeo, this.materials.bookshelfMahogany);
        shelf.position.set(0, sy, 0.01);
        bcGroup.add(shelf);

        if (s < shelves) {
          let cursorX = -spec.width / 2 + 0.22;
          const maxBookX = spec.width / 2 - 0.24;
          let bookIdx = s * 17 + Math.round(Math.abs(spec.x * 9 + spec.z * 5));
          while (cursorX < maxBookX) {
            const bw = 0.06 + ((bookIdx * 13) % 8) * 0.008;
            const bh = 0.34 + ((bookIdx * 19) % 9) * 0.024;
            const bd = 0.26;
            const mat = this.bookMaterials[bookIdx % this.bookMaterials.length];
            const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
            bookMesh.position.set(cursorX + bw / 2, sy + 0.04 + bh / 2, 0.04);
            bcGroup.add(bookMesh);
            cursorX += bw + 0.014;
            bookIdx++;
          }
        }
      }

      if (spec.hasLadder) {
        const ladderGroup = new THREE.Group();
        ladderGroup.position.set(spec.width * 0.24, 0, spec.depth / 2 + 0.24);
        ladderGroup.rotation.x = -0.13;
        const railGeo = new THREE.CylinderGeometry(0.024, 0.024, spec.height - 0.15, 8);
        [-0.21, 0.21].forEach((lx) => {
          const rMesh = new THREE.Mesh(railGeo, this.materials.warmOak);
          rMesh.position.set(lx, (spec.height - 0.15) / 2, 0);
          ladderGroup.add(rMesh);
        });
        for (let r = 1; r <= 8; r++) {
          const rung = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8),
            this.materials.brushedBrass
          );
          rung.rotation.z = Math.PI / 2;
          rung.position.set(0, r * 0.46, 0);
          ladderGroup.add(rung);
        }
        bcGroup.add(ladderGroup);
      }

      hallGroup.add(bcGroup);
    });

    // 6. Twin Overhead Brass & Warm Glass Chandeliers
    const warmLampGlow = new THREE.MeshBasicMaterial({ color: 0xffe29a });
    [-3.2, 3.2].forEach((hx) => {
      const chGroup = new THREE.Group();
      chGroup.position.set(hx, 4.35, 0.0);

      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8),
        this.materials.brushedBrass
      );
      rod.position.set(0, 0.55, 0);
      chGroup.add(rod);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.048, 12, 24),
        this.materials.brushedBrass
      );
      ring.rotation.x = Math.PI / 2;
      chGroup.add(ring);

      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), warmLampGlow);
        globe.position.set(Math.cos(ang) * 0.88, 0.12, Math.sin(ang) * 0.88);
        chGroup.add(globe);
      }

      const chLight = new THREE.PointLight(0xffca7a, 1.9, 15.0);
      chLight.position.set(0, -0.2, 0);
      chGroup.add(chLight);

      hallGroup.add(chGroup);
    });
  }

  buildMezzanineFloor() {
    const mezzGroup = new THREE.Group();
    mezzGroup.name = "MezzanineFloor";
    // Positioned at x = +18.0 so it is a complete isometric room side-by-side in Top View
    mezzGroup.position.set(18.0, 0, 0);
    mezzGroup.visible = false;

    const rugConfigs = [
      { x: -3.2, z: -2.3, w: 6.2, d: 4.2, primary: "#3d1818", border: "#592422", pattern: "#9e7f4e" },
      { x: 3.2, z: -2.3, w: 6.2, d: 4.2, primary: "#1e3326", border: "#2f4d3a", pattern: "#8a7d62" },
      { x: -3.2, z: 2.1, w: 6.2, d: 4.2, primary: "#38291d", border: "#4f3a29", pattern: "#967e5c" },
      { x: 3.2, z: 2.1, w: 6.2, d: 4.2, primary: "#1d2938", border: "#2b3d54", pattern: "#87795e" }
    ];
    this.buildFullIsometricHallBase(mezzGroup, rugConfigs);

    // Mezzanine Focal Feature: Central Grand Mahogany & Brass Balustrade Gallery Overlook + Arched Skylight Windows
    const skyTex = (this.skyTextures && this.skyTextures["Cozy Night"]) || createOutdoorSkyTexture("Cozy Night");
    [-1.85, 1.85].forEach((wx) => {
      const winFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 2.35, 0.18),
        this.materials.carvedDarkOak
      );
      winFrame.position.set(wx, 2.65, -4.92);
      mezzGroup.add(winFrame);

      const pane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.48, 2.08),
        new THREE.MeshBasicMaterial({ map: skyTex, color: 0xffffff })
      );
      pane.position.set(wx, 2.65, -4.81);
      mezzGroup.add(pane);

      const vMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 2.08, 0.08),
        this.materials.carvedDarkOak
      );
      vMullion.position.set(wx, 2.65, -4.79);
      mezzGroup.add(vMullion);

      const hMullion = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 0.05, 0.08),
        this.materials.carvedDarkOak
      );
      hMullion.position.set(wx, 2.65, -4.79);
      mezzGroup.add(hMullion);
    });

    // Central Mezzanine Stairwell Balustrade & Crimson Carpet Landing at (0, 0, -4.25)
    const landingCarpet = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.03, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x661a1a, roughness: 0.85 })
    );
    landingCarpet.position.set(0, 0.018, -4.35);
    mezzGroup.add(landingCarpet);

    const railTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.09, 0.14),
      this.materials.carvedDarkOak
    );
    railTop.position.set(0, 0.96, -3.82);
    mezzGroup.add(railTop);

    for (let sx = -1.25; sx <= 1.25; sx += 0.25) {
      const spindle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.92, 8),
        this.materials.brushedBrass
      );
      spindle.position.set(sx, 0.48, -3.82);
      mezzGroup.add(spindle);
    }

    this.scene.add(mezzGroup);
    this.mezzanineGroup = mezzGroup;
  }

  buildArchiveWing() {
    const archGroup = new THREE.Group();
    archGroup.name = "ArchiveWing";
    // Positioned at x = -18.0 so it is a complete isometric room side-by-side in Top View
    archGroup.position.set(-18.0, 0, 0);
    archGroup.visible = false;

    const rugConfigs = [
      { x: -3.2, z: -2.3, w: 6.2, d: 4.2, primary: "#451515", border: "#611f1f", pattern: "#9e7c44" },
      { x: 3.2, z: -2.3, w: 6.2, d: 4.2, primary: "#2e2018", border: "#422e22", pattern: "#8a7356" },
      { x: -3.2, z: 2.1, w: 6.2, d: 4.2, primary: "#212e22", border: "#314533", pattern: "#85785a" },
      { x: 3.2, z: 2.1, w: 6.2, d: 4.2, primary: "#3b171b", border: "#542227", pattern: "#947a5c" }
    ];
    this.buildFullIsometricHallBase(archGroup, rugConfigs);

    // Archive Wing Focal Features:
    // 1. Central Vaulted Rare-Manuscript Shrine along North Wall (x = 0, z = -4.55)
    const vaultFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 4.45, 0.62),
      this.materials.bookshelfMahogany
    );
    vaultFrame.position.set(0, 2.22, -4.62);
    archGroup.add(vaultFrame);

    for (let sy = 0.52; sy <= 3.85; sy += 0.55) {
      const folioRow = new THREE.Mesh(
        new THREE.BoxGeometry(3.05, 0.38, 0.54),
        this.bookMaterials[Math.round(sy * 3) % this.bookMaterials.length]
      );
      folioRow.position.set(0, sy, -4.56);
      archGroup.add(folioRow);
    }

    // 2. Central Illuminated Manuscript Lectern & Antique Celestial Globe in the Center Aisle
    const lecternGroup = new THREE.Group();
    lecternGroup.position.set(0, 0, -0.1);
    this.addContactShadow(lecternGroup, 0, 0, 0.95, 0.95, 0.6);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.32, 1.05, 16),
      this.materials.carvedDarkOak
    );
    pedestal.position.set(0, 0.52, 0);
    lecternGroup.add(pedestal);

    const bookRest = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.06, 0.58),
      this.materials.carvedDarkOak
    );
    bookRest.position.set(0, 1.08, 0);
    bookRest.rotation.x = 0.38;
    lecternGroup.add(bookRest);

    const manuscript = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.03, 0.48),
      this.materials.creamPaper
    );
    manuscript.position.set(0, 1.12, 0);
    manuscript.rotation.x = 0.38;
    lecternGroup.add(manuscript);
    archGroup.add(lecternGroup);

    // 3. Antique Brass Celestial Globe in Foreground-Right Corner (5.8, 0, 3.35)
    const globeGroup = new THREE.Group();
    globeGroup.position.set(5.8, 0, 3.35);
    this.addContactShadow(globeGroup, 0, 0, 1.1, 1.1, 0.62);

    const globeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.36, 0.62, 14),
      this.materials.carvedDarkOak
    );
    globeBase.position.set(0, 0.31, 0);
    globeGroup.add(globeBase);

    const globeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.03, 12, 24),
      this.materials.brushedBrass
    );
    globeRing.position.set(0, 0.92, 0);
    globeRing.rotation.y = Math.PI / 4;
    globeGroup.add(globeRing);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0x244c5a, roughness: 0.42, metalness: 0.15 })
    );
    sphere.position.set(0, 0.92, 0);
    globeGroup.add(sphere);
    archGroup.add(globeGroup);

    this.scene.add(archGroup);
    this.archiveWingGroup = archGroup;
  }

  buildDesksAndChairs() {
    this.deskUnits.clear();
    this.hitMeshes = [];
    if (this.loungeHitMesh) {
      this.hitMeshes.push(this.loungeHitMesh);
    }

    // Build all 52 desks across Ground Floor (1-20), 2nd Floor Mezzanine (21-36), and Archive Wing (37-52)
    DESK_LAYOUTS.forEach((layout) => {
      const unit = this.createDeskStation(layout);
      this.deskUnits.set(layout.id, unit);
      this.scene.add(unit.group);
    });
  }

  createDeskStation(layout) {
    const group = new THREE.Group();
    group.position.set(layout.x, layout.y || 0, layout.z);
    group.rotation.y = layout.rotY || 0;

    const deskW = 1.68;
    const deskD = 0.88;
    const deskH = 0.78;

    // 1. Soft Floor Drop-Shadows under Desk & Chair
    this.addContactShadow(group, 0, 0.02, deskW + 0.36, deskD + 0.36, 0.66);
    const chairShadow = this.addContactShadow(group, 0, -0.62, 0.86, 0.86, 0.58);

    // 2. Carved Walnut Desk Surface with Subtle Soft-Gold Hover Highlight Material
    const highlightMat = this.materials.deskTopWalnut.clone();
    const topGeo = new THREE.BoxGeometry(deskW, 0.075, deskD);
    const deskTop = new THREE.Mesh(topGeo, highlightMat);
    deskTop.position.set(0, deskH, 0);
    deskTop.castShadow = !isSoftwareGl;
    deskTop.receiveShadow = !isSoftwareGl;
    group.add(deskTop);

    // Desk Apron & Brass Drawer Pulls
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(deskW - 0.14, 0.13, deskD - 0.12),
      this.materials.warmOak
    );
    apron.position.set(0, deskH - 0.09, 0);
    group.add(apron);

    [-0.38, 0.38].forEach((dx) => {
      const pull = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        this.materials.brushedBrass
      );
      pull.position.set(dx, deskH - 0.09, -(deskD - 0.12) / 2 - 0.012);
      group.add(pull);
    });

    // 4 Turned Wooden Legs with Brass Ferrules
    const legGeo = new THREE.CylinderGeometry(0.042, 0.028, deskH - 0.04, 10);
    const ferruleGeo = new THREE.CylinderGeometry(0.03, 0.026, 0.08, 10);
    const legOffsets = [
      [-deskW / 2 + 0.12, -deskD / 2 + 0.12],
      [deskW / 2 - 0.12, -deskD / 2 + 0.12],
      [-deskW / 2 + 0.12, deskD / 2 - 0.12],
      [deskW / 2 - 0.12, deskD / 2 - 0.12]
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, this.materials.warmOak);
      leg.position.set(lx, (deskH - 0.04) / 2, lz);
      leg.castShadow = !isSoftwareGl;
      group.add(leg);

      const ferrule = new THREE.Mesh(ferruleGeo, this.materials.brushedBrass);
      ferrule.position.set(lx, 0.04, lz);
      group.add(ferrule);
    });

    // 3. Bankers Brass Reading Lamp (Left Corner of Desk)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-0.56, deskH + 0.04, 0.16);

    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.125, 0.04, 14),
      this.materials.brushedBrass
    );
    lampGroup.add(lampBase);

    const lampStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.34, 10),
      this.materials.brushedBrass
    );
    lampStem.position.y = 0.18;
    lampGroup.add(lampStem);

    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0x1d402c,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.28,
      metalness: 0.15
    });
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.14, 14, 1, false),
      lampShadeMat
    );
    lampShade.position.set(0.04, 0.35, -0.02);
    lampShade.rotation.z = -0.15;
    lampGroup.add(lampShade);

    // Warm Amber Cone of Light (#ffd180, intensity: 1.5, distance: 4 when occupied)
    const lampLight = new THREE.PointLight(0xffd180, 0, 4.0, 0.45);
    lampLight.position.set(0.08, 0.27, -0.05);
    lampGroup.add(lampLight);

    // Soft translucent volumetric amber light cone under active lamp
    const lampConeMat = new THREE.MeshBasicMaterial({
      color: 0xffd180,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const lampLightCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.34, 18, 1, true),
      lampConeMat
    );
    lampLightCone.position.set(0.06, 0.17, -0.03);
    lampLightCone.visible = false;
    lampGroup.add(lampLightCone);

    group.add(lampGroup);

    // 4. Ceramic Coffee Mug (Right Corner of Desk)
    const mugGroup = new THREE.Group();
    mugGroup.position.set(0.54, deskH + 0.04, -0.08);

    const mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.048, 0.11, 14),
      this.materials.ceramicMug
    );
    mugBody.position.y = 0.055;
    mugGroup.add(mugBody);

    const mugCoffee = new THREE.Mesh(
      new THREE.CircleGeometry(0.048, 12),
      this.materials.coffeeLiquid
    );
    mugCoffee.rotation.x = -Math.PI / 2;
    mugCoffee.position.y = 0.106;
    mugGroup.add(mugCoffee);

    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.009, 8, 12, Math.PI),
      this.materials.ceramicMug
    );
    mugHandle.rotation.z = -Math.PI / 2;
    mugHandle.position.set(0.052, 0.055, 0);
    mugGroup.add(mugHandle);

    // Animated Steam Puffs (visible when occupied)
    const steamGroup = new THREE.Group();
    steamGroup.position.set(0, 0.14, 0);
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.32
    });
    for (let s = 0; s < 3; s++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.018 + s * 0.005, 8, 8), steamMat);
      puff.position.set((s - 1) * 0.012, s * 0.06, 0);
      puff.userData = { offset: s * 1.1 };
      steamGroup.add(puff);
    }
    steamGroup.visible = false;
    mugGroup.add(steamGroup);

    group.add(mugGroup);

    // 5. Dynamic Center Study Props Container (populated immediately with hand-placed cozy notebook)
    const propsGroup = new THREE.Group();
    propsGroup.position.set(0, deskH + 0.04, -0.06);
    this.populateDeskProps(propsGroup, false, "reading", layout.id);
    group.add(propsGroup);

    // 6. Cute Carved Wooden Study Chair
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, -0.62);

    const seatMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.07, 0.52),
      this.materials.chairCushion
    );
    seatMesh.position.set(0, 0.46, 0);
    seatMesh.castShadow = !isSoftwareGl;
    chairGroup.add(seatMesh);

    const seatFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.05, 0.56),
      this.materials.warmOak
    );
    seatFrame.position.set(0, 0.43, 0);
    chairGroup.add(seatFrame);

    [-0.24, 0.24].forEach((bx) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.022, 0.54, 8),
        this.materials.warmOak
      );
      post.position.set(bx, 0.72, -0.23);
      post.rotation.x = -0.08;
      chairGroup.add(post);
    });

    const backrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.24, 0.06),
      this.materials.warmOak
    );
    backrest.position.set(0, 0.86, -0.25);
    backrest.castShadow = !isSoftwareGl;
    chairGroup.add(backrest);

    const backPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.16, 0.04),
      this.materials.chairCushion
    );
    backPad.position.set(0, 0.86, -0.21);
    chairGroup.add(backPad);

    const cLegGeo = new THREE.CylinderGeometry(0.025, 0.018, 0.44, 8);
    [
      [-0.24, -0.22],
      [0.24, -0.22],
      [-0.24, 0.22],
      [0.24, 0.22]
    ].forEach(([cx, cz]) => {
      const cLeg = new THREE.Mesh(cLegGeo, this.materials.warmOak);
      cLeg.position.set(cx, 0.22, cz);
      chairGroup.add(cLeg);
    });

    const characterGroup = new THREE.Group();
    chairGroup.add(characterGroup);

    group.add(chairGroup);

    // 7. Physical Carved Dark Oak & Brass Engraved Nameplate resting prominently on the front-right of the desk
    const plateGeo = new THREE.BoxGeometry(0.50, 0.115, 0.085);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.15
    });
    const woodenNameplateMesh = new THREE.Mesh(plateGeo, plateMat);
    woodenNameplateMesh.position.set(0.36, deskH + 0.062, 0.22);
    woodenNameplateMesh.rotation.y = -0.10;
    woodenNameplateMesh.rotation.x = -0.22;
    woodenNameplateMesh.visible = false;
    group.add(woodenNameplateMesh);

    // 8. Invisible Raycast Hit Volume
    const hitGeo = new THREE.BoxGeometry(deskW + 0.2, 1.85, deskD + 0.9);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.set(0, 0.92, -0.2);
    hitMesh.userData = { deskId: layout.id };
    group.add(hitMesh);
    this.hitMeshes.push(hitMesh);

    return {
      id: layout.id,
      layout,
      group,
      hitMesh,
      lampLight,
      lampShadeMat,
      lampLightCone,
      chairShadow,
      propsGroup,
      characterGroup,
      chairGroup,
      steamGroup,
      highlightMat,
      woodenNameplateMesh,
      occupiedBy: null,
      reservedBy: null,
      isMyDesk: false
    };
  }

  /**
   * Builds a realistic cozy notebook with a dark leather cover (#3d2314),
   * cream-colored inner page block (#f5f0e1), subtle red ribbon bookmark (#801b1b),
   * and an organic hand-placed rotation angle.
   */
  buildCozyNotebook({ isOpen = false, deskId = 1, scale = 1.0 }) {
    const nbGroup = new THREE.Group();
    nbGroup.scale.setScalar(scale);

    // Deterministic organic rotation angle so each desk's notebook looks placed by hand
    const angles = [0.14, -0.11, 0.17, -0.15, 0.12, -0.16, 0.19, -0.13];
    const organicAngle = angles[(Math.abs(Number(deskId) || 1) - 1) % angles.length];
    nbGroup.rotation.y = organicAngle;

    if (!isOpen) {
      const w = 0.34;
      const d = 0.25;

      // 1. Bottom dark leather cover (#3d2314)
      const bottomCover = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.007, d),
        this.materials.notebookLeather
      );
      bottomCover.position.set(0, 0.0035, 0);
      bottomCover.castShadow = !isSoftwareGl;
      bottomCover.receiveShadow = !isSoftwareGl;
      nbGroup.add(bottomCover);

      // 2. Cream-colored inner page block (#f5f0e1) recessed slightly inside leather boards
      const pageBlock = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.018, 0.028, d - 0.016),
        this.materials.notebookPages
      );
      pageBlock.position.set(0.004, 0.021, 0);
      pageBlock.castShadow = !isSoftwareGl;
      pageBlock.receiveShadow = !isSoftwareGl;
      nbGroup.add(pageBlock);

      // 3. Top dark leather cover (#3d2314)
      const topCover = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.007, d),
        this.materials.notebookLeather
      );
      topCover.position.set(0, 0.0385, 0);
      topCover.castShadow = !isSoftwareGl;
      topCover.receiveShadow = !isSoftwareGl;
      nbGroup.add(topCover);

      // 4. Rounded dark leather spine binding along the left edge (#3d2314)
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.021, 0.021, d, 12),
        this.materials.notebookLeather
      );
      spine.rotation.x = Math.PI / 2;
      spine.position.set(-w / 2 + 0.004, 0.021, 0);
      nbGroup.add(spine);

      // 5. Subtle red ribbon bookmark (#801b1b) emerging from the cream pages & draping onto the desk
      const ribbonTail = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.004, 0.075),
        this.materials.notebookRibbon
      );
      ribbonTail.position.set(0.035, 0.012, d / 2 + 0.028);
      ribbonTail.rotation.x = 0.22;
      ribbonTail.rotation.y = 0.16;
      nbGroup.add(ribbonTail);

      return nbGroup;
    }

    // Open notebook: dark leather cover (#3d2314), arched cream inner page blocks (#f5f0e1), and red ribbon bookmark (#801b1b)
    const openW = 0.48;
    const openD = 0.32;

    // 1. Dark leather open cover boards & central spine (#3d2314)
    const leatherBase = new THREE.Mesh(
      new THREE.BoxGeometry(openW, 0.009, openD),
      this.materials.notebookLeather
    );
    leatherBase.position.set(0, 0.0045, 0);
    leatherBase.castShadow = !isSoftwareGl;
    leatherBase.receiveShadow = !isSoftwareGl;
    nbGroup.add(leatherBase);

    const centerSpine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, openD, 10),
      this.materials.notebookLeather
    );
    centerSpine.rotation.x = Math.PI / 2;
    centerSpine.position.set(0, 0.009, 0);
    nbGroup.add(centerSpine);

    // 2. Left & right cream-colored inner page blocks (#f5f0e1)
    const leftPageBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.024, openD - 0.024),
      this.materials.notebookPages
    );
    leftPageBlock.position.set(-0.114, 0.021, 0);
    leftPageBlock.rotation.z = -0.05;
    leftPageBlock.castShadow = !isSoftwareGl;
    leftPageBlock.receiveShadow = !isSoftwareGl;
    nbGroup.add(leftPageBlock);

    const rightPageBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.024, openD - 0.024),
      this.materials.notebookPages
    );
    rightPageBlock.position.set(0.114, 0.021, 0);
    rightPageBlock.rotation.z = 0.05;
    rightPageBlock.castShadow = !isSoftwareGl;
    rightPageBlock.receiveShadow = !isSoftwareGl;
    nbGroup.add(rightPageBlock);

    // 3. Red ribbon bookmark (#801b1b) lying across the center crease and extending past the bottom edge
    const openRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.004, openD + 0.065),
      this.materials.notebookRibbon
    );
    openRibbon.position.set(0.012, 0.034, 0.028);
    openRibbon.rotation.y = 0.09;
    nbGroup.add(openRibbon);

    return nbGroup;
  }

  populateDeskProps(propsGroup, isOccupied, posture, deskId = 1) {
    while (propsGroup.children.length > 0) {
      propsGroup.remove(propsGroup.children[0]);
    }

    if (!isOccupied) {
      // Closed hand-placed cozy leather notebook (#3d2314 cover, #f5f0e1 cream pages, #801b1b red ribbon) + brass pen
      const closedNotebook = this.buildCozyNotebook({ isOpen: false, deskId, scale: 1.0 });
      closedNotebook.position.set(-0.02, 0, 0.04);
      propsGroup.add(closedNotebook);

      const brassPen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8),
        this.materials.brushedBrass
      );
      brassPen.rotation.x = Math.PI / 2;
      brassPen.rotation.z = 0.22;
      brassPen.position.set(0.24, 0.012, 0.04);
      propsGroup.add(brassPen);
      return;
    }

    if (posture === "typing") {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.022, 0.29),
        this.materials.laptopBody
      );
      base.position.set(-0.08, 0.012, 0.04);
      propsGroup.add(base);

      const lidGroup = new THREE.Group();
      lidGroup.position.set(-0.08, 0.022, 0.175);
      lidGroup.rotation.x = 0.32;

      const lidBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.27, 0.016),
        this.materials.laptopBody
      );
      lidBack.position.set(0, 0.135, 0);
      lidGroup.add(lidBack);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.23),
        this.materials.laptopScreen
      );
      screen.rotation.y = Math.PI;
      screen.position.set(0, 0.135, -0.01);
      lidGroup.add(screen);

      propsGroup.add(lidGroup);

      // Hand-placed closed leather notebook beside the laptop
      const sideNotebook = this.buildCozyNotebook({ isOpen: false, deskId: deskId + 3, scale: 0.78 });
      sideNotebook.position.set(0.28, 0, 0.05);
      propsGroup.add(sideNotebook);
    } else {
      // Open hand-placed leather study notebook (#3d2314 cover, #f5f0e1 cream pages, #801b1b red ribbon)
      const openNotebook = this.buildCozyNotebook({ isOpen: true, deskId, scale: 1.0 });
      openNotebook.position.set(0, 0, 0.04);
      propsGroup.add(openNotebook);

      const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.009, 0.006, 0.22, 8),
        this.materials.brushedBrass
      );
      pen.rotation.x = Math.PI / 2;
      pen.rotation.z = posture === "writing" ? 0.52 : 0.26;
      pen.position.set(0.29, 0.015, 0.04);
      propsGroup.add(pen);
    }
  }

  populateSeatedCharacter(characterGroup, occupiedBy) {
    while (characterGroup.children.length > 0) {
      characterGroup.remove(characterGroup.children[0]);
    }
    if (!occupiedBy) return;

    const seed = hashString(occupiedBy.displayName || occupiedBy.userId || "student");
    const sweaterHex = SWEATER_COLORS[occupiedBy.avatarColor] || SWEATER_COLORS.teal;
    const hairHex = HAIR_PALETTE[seed % HAIR_PALETTE.length];
    const skinHex = SKIN_PALETTE[(seed >> 3) % SKIN_PALETTE.length];
    const hasGlasses = (seed % 2) === 0;
    const hasBun = (seed % 3) === 0;
    const posture = occupiedBy.posture || "reading";

    const sweaterMat = new THREE.MeshStandardMaterial({
      color: sweaterHex,
      roughness: 0.76,
      metalness: 0.04
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinHex,
      roughness: 0.56,
      metalness: 0.02
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairHex,
      roughness: 0.68,
      metalness: 0.05
    });
    const trousersMat = new THREE.MeshStandardMaterial({
      color: 0x1e252f,
      roughness: 0.8
    });

    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.36), trousersMat);
    hips.position.set(0, 0.56, 0);
    characterGroup.add(hips);

    [-0.12, 0.12].forEach((lx) => {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.36, 10), trousersMat);
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(lx, 0.56, 0.18);
      characterGroup.add(thigh);

      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.42, 10), trousersMat);
      calf.position.set(lx, 0.32, 0.33);
      characterGroup.add(calf);
    });

    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.64, 0.02);
    upperBody.rotation.x = posture === "coffee" ? 0.05 : 0.16;

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.52, 14), sweaterMat);
    torso.scale.set(1.15, 1.0, 0.82);
    torso.position.set(0, 0.26, 0);
    torso.castShadow = !isSoftwareGl;
    upperBody.add(torso);

    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.025, 8, 16),
      this.materials.creamPaper
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.52, 0.02);
    upperBody.add(collar);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.68, 0.04);
    headGroup.rotation.x = posture === "coffee" ? 0.08 : 0.24;

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 18), skinMat);
    head.castShadow = !isSoftwareGl;
    headGroup.add(head);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.184, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.64),
      hairMat
    );
    hairCap.position.set(0, 0.015, -0.015);
    hairCap.rotation.x = -0.22;
    headGroup.add(hairCap);

    [-0.14, 0.14].forEach((hx) => {
      const sideLock = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), hairMat);
      sideLock.scale.set(0.7, 1.35, 0.9);
      sideLock.position.set(hx, -0.01, 0.03);
      headGroup.add(sideLock);
    });

    if (hasBun) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), hairMat);
      bun.position.set(0, 0.15, -0.14);
      headGroup.add(bun);
    }

    if (hasGlasses) {
      [-0.062, 0.062].forEach((gx) => {
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.038, 0.006, 6, 14),
          this.materials.brushedBrass
        );
        rim.position.set(gx, 0.01, 0.168);
        headGroup.add(rim);
      });
    }

    upperBody.add(headGroup);

    [-1, 1].forEach((side) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.23, 0.44, 0.02);

      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), sweaterMat);
      armGroup.add(shoulder);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.28, 10), sweaterMat);
      upperArm.position.set(side * 0.02, -0.11, 0.12);
      upperArm.rotation.x = -0.82;
      upperArm.rotation.z = side * -0.15;
      armGroup.add(upperArm);

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.28, 10), sweaterMat);
      forearm.position.set(side * -0.03, -0.18, 0.34);
      forearm.rotation.x = -1.42;
      forearm.rotation.z = side * 0.26;
      armGroup.add(forearm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), skinMat);
      hand.position.set(side * -0.08, -0.19, 0.48);
      armGroup.add(hand);

      upperBody.add(armGroup);
    });

    characterGroup.userData = { upperBody, headGroup, phase: (seed % 100) * 0.06 };
    characterGroup.add(upperBody);
  }

  updateDeskLampLights() {
    this.deskUnits.forEach((unit) => {
      const isOccupied = Boolean(unit.occupiedBy);
      const userWantsLamp = isOccupied && unit.occupiedBy.lampOn !== false;
      // During Daylight, desk lamps are off; at Golden Hour, Autumn Rain, and Cozy Night, occupied lamps glow warmly
      const isLampLit = userWantsLamp && this.interiorLampsActive;

      unit.lampLight.color.setHex(0xffd180);
      unit.lampLight.distance = 4.2;
      unit.lampLight.intensity = isLampLit ? 1.55 : 0;
      unit.lampShadeMat.color.setHex(isLampLit ? 0x24593d : 0x1d402c);
      unit.lampShadeMat.emissive.setHex(isLampLit ? 0xffd180 : 0x000000);
      unit.lampShadeMat.emissiveIntensity = isLampLit ? 0.65 : 0;
      if (unit.lampLightCone) {
        unit.lampLightCone.visible = isLampLit;
      }
    });
  }

  updateInteriorFixturesForTheme(sconceIntensity = 1.05) {
    const active = this.interiorLampsActive;
    const fireOn = this.fireplaceActive;

    // Bookcase brass gallery sconces
    this.sconceLights.forEach((sLight) => {
      sLight.intensity = active ? sconceIntensity : 0;
    });
    this.sconceBulbs.forEach((bulbMat) => {
      bulbMat.color.setHex(active ? 0xffdf9a : 0x8a7968);
    });

    // Fireplace hearth light, flames, glowing coals, and log cracks
    if (this.fireplaceLight) {
      this.fireplaceLight.intensity = fireOn ? this.fireplaceBaseIntensity : 0;
    }
    this.flameMeshes.forEach((fGroup) => {
      fGroup.visible = fireOn;
    });
    if (this.emberMaterials.length >= 2) {
      this.emberMaterials[0].emissiveIntensity = fireOn ? 1.45 : 0;
      this.emberMaterials[1].emissiveIntensity = fireOn ? 2.1 : 0;
    }
    this.logCrackMaterials.forEach((mat) => {
      mat.emissiveIntensity = fireOn ? 0.95 : 0;
    });

    // Mantelpiece beeswax candles
    this.candleFlames.forEach((flame) => {
      flame.visible = active;
    });
    this.candleLights.forEach((cLight) => {
      cLight.intensity = active ? cLight.userData.baseIntensity : 0;
    });

    // Desk reading lamps
    this.updateDeskLampLights();
  }

  syncDesks(desksArray, currentUserId, isGroupLibrary = false) {
    this.currentDesksData = Array.isArray(desksArray) ? desksArray : [];
    this.currentUserId = currentUserId || 1;
    this.isGroupLibrary = Boolean(isGroupLibrary);

    this.currentDesksData.forEach((deskData) => {
      const unit = this.deskUnits.get(Number(deskData.id));
      if (!unit) return;

      const isOccupied = Boolean(deskData.occupiedBy);
      const isMyDesk = isOccupied && !deskData.occupiedBy.isBuddy && String(deskData.occupiedBy.userId) === String(this.currentUserId);
      const posture = isOccupied ? (deskData.occupiedBy.posture || "reading") : "reading";

      unit.occupiedBy = deskData.occupiedBy || null;
      unit.reservedBy = this.isGroupLibrary ? (deskData.reservedBy || null) : null;
      unit.isMyDesk = isMyDesk;

      // Physical Carved Oak & Gold Leaf Nameplate on desk surface (ONLY in Group Libraries)
      if (unit.woodenNameplateMesh) {
        if (this.isGroupLibrary && deskData.reservedBy) {
          unit.woodenNameplateMesh.visible = true;
          const resName = deskData.reservedBy.displayName || "Scholar";
          if (unit.lastReservedName !== resName) {
            unit.lastReservedName = resName;
            const tex = createCarvedOakNameplateTexture(resName);
            unit.woodenNameplateMesh.material.map = tex;
            unit.woodenNameplateMesh.material.needsUpdate = true;
          }
        } else {
          unit.woodenNameplateMesh.visible = false;
        }
      }

      // Chair tucked-in when empty vs pulled out slightly when occupied
      unit.chairGroup.position.z = isOccupied ? -0.52 : -0.58;
      unit.chairGroup.rotation.y = isOccupied ? 0 : (unit.id % 2 === 0 ? 0.08 : -0.08);
      if (unit.chairShadow) {
        unit.chairShadow.position.z = unit.chairGroup.position.z;
      }

      unit.steamGroup.visible = isOccupied;

      this.populateDeskProps(unit.propsGroup, isOccupied, posture, unit.id);
      this.populateSeatedCharacter(unit.characterGroup, deskData.occupiedBy);
    });

    // Populate Break Lounge armchairs with scholars currently taking a coffee break
    if (Array.isArray(this.loungeArmchairs)) {
      const breakScholars = [];
      this.currentDesksData.forEach((d) => {
        if (d.occupiedBy && d.occupiedBy.posture === "coffee") {
          breakScholars.push(d.occupiedBy);
        }
      });
      if (typeof window !== "undefined" && window.currentBreakLoungeUser && !breakScholars.some((u) => String(u.userId) === String(window.currentBreakLoungeUser.userId))) {
        breakScholars.unshift(window.currentBreakLoungeUser);
      }
      this.loungeArmchairs.forEach((armchair, idx) => {
        const occupant = breakScholars[idx] || null;
        this.populateSeatedCharacter(armchair.characterGroup, occupant);
      });
    }

    this.updateDeskLampLights();
    this.rebuildProjectedLabels();
  }

  updateFloorVisibility() {
    const isTop = Boolean(this.isTopDownView);
    const activeFloor = this.currentFloor || "ground";
    const hasMezz = Boolean(this.unlockedFloors?.mezzanine);
    const hasArch = Boolean(this.unlockedFloors?.archive);

    // In Top View: show all unlocked floors side-by-side.
    // In single-floor mode: show ONLY the currently selected floor room so walls/trees never clip.
    if (this.groundFloorGroup) {
      this.groundFloorGroup.visible = isTop ? true : (activeFloor === "ground");
    }
    if (this.mezzanineGroup) {
      this.mezzanineGroup.visible = isTop ? hasMezz : (activeFloor === "mezzanine");
    }
    if (this.archiveWingGroup) {
      this.archiveWingGroup.visible = isTop ? hasArch : (activeFloor === "archive");
    }

    const groundLimit = this.groundDeskLimit || 20;
    this.deskUnits.forEach((unit) => {
      const floorKey = unit.layout.floor || "ground";
      const floorVisible = isTop ? Boolean(this.unlockedFloors[floorKey]) : (floorKey === activeFloor);
      if (!floorVisible) {
        unit.group.visible = false;
        return;
      }
      if (floorKey === "ground" && unit.id > groundLimit && !unit.occupiedBy && !unit.reservedBy) {
        unit.group.visible = false;
        return;
      }
      unit.group.visible = true;
    });

    if (this.scene && this.scene.fog) {
      this.scene.fog.density = isTop ? 0.0045 : 0.015;
    }
  }

  setUnlockedFloors(unlocked = { ground: true, mezzanine: false, archive: false }) {
    this.unlockedFloors = {
      ground: true,
      mezzanine: Boolean(unlocked.mezzanine),
      archive: Boolean(unlocked.archive)
    };
    this.updateFloorVisibility();
    if (this.isTopDownView) {
      this.setCameraPreset("topdown");
    } else {
      this.updateProjectedOverlays();
    }
  }

  setDeskCountLimit(count = 20) {
    this.groundDeskLimit = Number(count) || 20;
    this.updateFloorVisibility();
    this.updateProjectedOverlays();
  }

  rebuildProjectedLabels() {
    if (!this.labelsContainer) return;
    this.labelsContainer.innerHTML = "";

    this.deskUnits.forEach((unit) => {
      const isHovered = this.hoveredDeskId === unit.id;
      const wrapper = document.createElement("div");
      wrapper.className = `spatial-3d-desk-overlay ${unit.occupiedBy ? "occupied" : "empty"} ${unit.isMyDesk ? "my-desk" : ""} ${isHovered ? "is-hovered" : ""}`;
      wrapper.dataset.deskId = String(unit.id);
      wrapper.dataset.floor = unit.layout.floor || "ground";
      wrapper.dataset.userId = unit.occupiedBy && unit.occupiedBy.userId ? String(unit.occupiedBy.userId) : "";

      if (unit.occupiedBy) {
        const occ = unit.occupiedBy;
        const firstName = (occ.displayName || "Student").split(" ")[0];
        const mins = Math.max(1, Math.floor((occ.timerSeconds || 1500) / 60));
        const posture = occ.posture || "reading";
        const postureLabel = posture === "coffee" ? "Coffee Break" : posture.charAt(0).toUpperCase() + posture.slice(1);
        const clickFn = unit.isMyDesk ? `openDeskModal(${unit.id})` : `togglePeerPopover(${unit.id})`;

        wrapper.innerHTML = `
          <button type="button" class="desk-3d-name-pill ${unit.isMyDesk ? "is-mine" : ""}" data-desk-id="${unit.id}" data-user-id="${escapeHtmlText(occ.userId || "")}" onclick="${clickFn}; event.stopPropagation();" title="${unit.isMyDesk ? "Click to edit your session or leave seat" : escapeHtmlText(occ.displayName)}">
            <span class="pill-dot"></span>
            <span class="pill-name">${escapeHtmlText(firstName)}</span>
            <span class="pill-sep">•</span>
            <span class="pill-mins" id="desk-3d-mins-${unit.id}">${mins}m</span>
          </button>

          <div class="desk-paper-tooltip" id="peer-popover-${unit.id}">
            <div class="tooltip-subject">${escapeHtmlText(occ.subject || "Focus Study")}</div>
            <div class="tooltip-activity">${escapeHtmlText(postureLabel)}${occ.goal ? ` • “${escapeHtmlText(occ.goal)}”` : ""}</div>
            <div class="tooltip-cheer-row">
              <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${unit.id}, 'Coffee'); event.stopPropagation();" title="Send Warm Coffee">Coffee</button>
              <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${unit.id}, 'Applause'); event.stopPropagation();" title="Send Applause">Applaud</button>
              <button type="button" class="tooltip-cheer-btn" onclick="sendDeskCheer(${unit.id}, 'Focus'); event.stopPropagation();" title="Send Focus Boost">Inspire</button>
            </div>
          </div>
        `;
      } else {
        wrapper.innerHTML = `
          <button type="button" class="desk-3d-sit-pill" id="desk-3d-sit-${unit.id}" data-desk-id="${unit.id}" onclick="openDeskModal(${unit.id}); event.stopPropagation();">
            <span>Sit here</span>
          </button>
        `;
      }

      unit.overlayEl = wrapper;
      this.labelsContainer.appendChild(wrapper);
    });

    // Interactive Floating 3D Pill for the Common Break Lounge
    const loungeEl = document.createElement("div");
    loungeEl.className = "spatial-3d-desk-overlay lounge-overlay";
    const isAtLounge = typeof window !== "undefined" && Boolean(window.isAtBreakLounge);
    loungeEl.innerHTML = `
      <button type="button" class="lounge-3d-overlay-pill" onclick="if(window.sitAtBreakLounge) window.sitAtBreakLounge(); event.stopPropagation();" title="Take a cozy coffee break at the Oak Lounge Table">
        <span>☕ ${isAtLounge ? "On Break • Resume Study" : "Break Lounge"}</span>
      </button>
    `;
    this.loungeOverlayEl = loungeEl;
    this.labelsContainer.appendChild(loungeEl);
  }

  updateDeskTimerBadge(deskId, timerSeconds) {
    const mins = Math.max(1, Math.floor((timerSeconds || 0) / 60));
    const el = document.getElementById(`desk-3d-mins-${deskId}`);
    if (el) el.textContent = `${mins}m`;
    const unit = this.deskUnits.get(Number(deskId));
    if (unit && unit.occupiedBy) {
      unit.occupiedBy.timerSeconds = timerSeconds;
    }
  }

  /**
   * Calculates physically-based solar position, elevation angle, hour angle, and direct beam transmittance
   * for modulating window sunlight and shadow projection across the library floor.
   * 
   * Window location: x = -2.2, y = 2.55, z = -4.85 (North back wall)
   */
  calculateSolarLighting(themeName) {
    const windowPos = new THREE.Vector3(-2.2, 2.55, -4.85);

    let hourAngleDeg = 22.5;
    let declinationDeg = 20.0;
    let latDeg = 45.0;
    let directIrradiance = 1.45;
    let lightColorHex = 0xfff8e6;
    let spotColorHex = 0xfffaed;
    let ambientHex = 0xfef5e6;
    let ambientIntensity = 0.88;
    let hemiSkyHex = 0xfffbf0;
    let hemiGroundHex = 0x9c7a56;
    let hemiIntensity = 1.15;
    let plasterHex = 0x7c6755;
    let foliageColorA = 0x2e5c33;
    let foliageColorB = 0x477d4c;
    let isNight = false;

    switch (themeName) {
      case "Daylight":
        hourAngleDeg = 22.5;   // ~1:30 PM (high sun elevation)
        declinationDeg = 20.0; // Summer
        directIrradiance = 1.45;
        lightColorHex = 0xfff8e6;
        spotColorHex = 0xfffaed;
        ambientHex = 0xfef5e6;
        ambientIntensity = 0.88;
        hemiSkyHex = 0xfffbf0;
        hemiGroundHex = 0x9c7a56;
        hemiIntensity = 1.15;
        plasterHex = 0x7c6755;
        foliageColorA = 0x2e5c33;
        foliageColorB = 0x477d4c;
        break;

      case "Golden Hour":
        hourAngleDeg = 86.5;   // ~5:46 PM late-afternoon sunset (low sun elevation)
        declinationDeg = 4.0;  // Late-summer sunset
        directIrradiance = 2.15; // Direct glowing sunbeam
        lightColorHex = 0xff7700; // Fiery golden-orange
        spotColorHex = 0xff8811;
        ambientHex = 0xf5b875;
        ambientIntensity = 0.58;
        hemiSkyHex = 0xffcb85;
        hemiGroundHex = 0x7a3e18;
        hemiIntensity = 0.95;
        plasterHex = 0x6b442d;
        foliageColorA = 0x82441b;
        foliageColorB = 0xa65d24;
        break;

      case "Cozy Night":
      default:
        isNight = true;
        hourAngleDeg = 155.0;  // Night time (sun well below horizon)
        declinationDeg = -15.0;
        directIrradiance = 0.45;
        lightColorHex = 0x5c7499;
        spotColorHex = 0x6b94c2;
        ambientHex = 0x685748;
        ambientIntensity = 0.30;
        hemiSkyHex = 0xd2c3b2;
        hemiGroundHex = 0x523620;
        hemiIntensity = 0.75;
        plasterHex = 0x3d2c20;
        foliageColorA = 0x0f1c2b;
        foliageColorB = 0x182a40;
        break;
    }

    // Convert angles to radians
    const hRad = (hourAngleDeg * Math.PI) / 180;
    const decRad = (declinationDeg * Math.PI) / 180;
    const latRad = (latDeg * Math.PI) / 180;

    // Calculate Solar Elevation Angle alpha (rad)
    const sinAlpha = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad);
    const alpha = isNight ? (38.0 * Math.PI) / 180 : Math.asin(Math.max(-1, Math.min(1, sinAlpha)));

    // Calculate Solar Azimuth Angle theta (rad)
    const cosTheta = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(alpha)) / (Math.cos(latRad) * Math.cos(alpha) || 0.001);
    const theta = (hourAngleDeg >= 0 ? 1 : -1) * Math.acos(Math.max(-1, Math.min(1, cosTheta)));

    // Atmospheric Air Mass & Extinction Transmittance Modulation
    const sinAlphaClamped = Math.max(0.08, Math.sin(alpha));
    const airMass = 1.0 / (sinAlphaClamped + 0.15 * Math.pow(Math.max(0.1, (alpha * 180) / Math.PI) + 3.885, -1.25));
    const atmosphericTransmittance = Math.exp(-0.12 * airMass);

    // Physically-derived Directional Light Source position offset from Arched Window Center
    const distance = 16.0;
    const sunX = windowPos.x - distance * Math.cos(alpha) * Math.sin(theta);
    const sunY = windowPos.y + distance * Math.sin(alpha);
    const sunZ = windowPos.z - distance * Math.cos(alpha) * Math.cos(theta);

    // Shadow projection target on the library floor
    // Golden Hour low elevation (alpha ~ 12.8°) extends the target deep across the floor (z = +2.8, x = +0.8) for long distinct shadows
    const shadowTargetZ = isNight ? -0.5 : (alpha < 0.35 ? 2.8 : 0.8);
    const shadowTargetX = isNight ? -2.0 : (hourAngleDeg > 40 ? 0.8 : -1.2);

    const modulatedDirIntensity = isNight
      ? 0.42
      : directIrradiance * Math.pow(sinAlphaClamped, 0.5) * (0.65 + 0.35 * atmosphericTransmittance);

    const modulatedSpotIntensity = isNight
      ? 1.4
      : (themeName === "Golden Hour" ? 3.4 : (themeName === "Daylight" ? 2.6 : 2.2));

    return {
      isNight,
      hourAngleDeg,
      elevationDeg: (alpha * 180) / Math.PI,
      azimuthDeg: (theta * 180) / Math.PI,
      sunPosition: new THREE.Vector3(sunX, sunY, sunZ),
      targetPosition: new THREE.Vector3(shadowTargetX, 0.1, shadowTargetZ),
      dirIntensity: modulatedDirIntensity,
      spotIntensity: modulatedSpotIntensity,
      lightColorHex,
      spotColorHex,
      ambientHex,
      ambientIntensity,
      hemiSkyHex,
      hemiGroundHex,
      hemiIntensity,
      plasterHex,
      foliageColorA,
      foliageColorB
    };
  }

  applyTheme(themeName) {
    const keyMap = {
      cloudy: "Daylight",
      daylight: "Daylight",
      "Daylight": "Daylight",
      "Cloudy Afternoon": "Daylight",
      sunny: "Golden Hour",
      "Golden Hour": "Golden Hour",
      rainy: "Cozy Night",
      "Autumn Rain": "Cozy Night",
      "Autumn Fall": "Cozy Night",
      "Rainy Night": "Cozy Night",
      midnight: "Cozy Night",
      candlelight: "Cozy Night",
      "Cozy Night": "Cozy Night",
      "Midnight Study": "Cozy Night"
    };
    const resolvedTheme = keyMap[themeName] || "Daylight";
    this.currentAtmosphere = resolvedTheme;

    const ambientLight = this.ambientLight;
    const dirLight = this.dirLight;
    const skyMesh = this.skyMesh || this.windowSky;
    if (!ambientLight || !dirLight || !skyMesh) return;

    // Compute physically-based solar position & illumination parameters
    const solar = this.calculateSolarLighting(resolvedTheme);

    // Background & fog around the 3D room stays constant dark academia (#0b120e)
    if (this.scene) {
      this.scene.background.setHex(0x0b120e);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0x0b120e);
        this.scene.fog.density = 0.015;
      }
    }

    const setRainVisible = (vis) => {
      if (this.rainParticles) this.rainParticles.visible = vis;
      if (this.windowDroplets) {
        this.windowDroplets.forEach((d) => {
          d.visible = vis;
        });
      }
    };

    // Apply solar position, target, and physical light modulation
    dirLight.position.copy(solar.sunPosition);
    if (dirLight.target) {
      dirLight.target.position.copy(solar.targetPosition);
    }
    dirLight.color.setHex(solar.lightColorHex);
    dirLight.intensity = solar.dirIntensity;

    if (this.windowMoonLight) {
      this.windowMoonLight.position.set(-2.2, 3.8, -5.6);
      if (this.windowMoonLight.target) {
        this.windowMoonLight.target.position.copy(solar.targetPosition);
      }
      this.windowMoonLight.color.setHex(solar.spotColorHex);
      this.windowMoonLight.intensity = solar.spotIntensity;
    }

    ambientLight.color.setHex(solar.ambientHex);
    ambientLight.intensity = solar.ambientIntensity;

    if (this.ambientHemiLight) {
      this.ambientHemiLight.color.setHex(solar.hemiSkyHex);
      this.ambientHemiLight.groundColor.setHex(solar.hemiGroundHex);
      this.ambientHemiLight.intensity = solar.hemiIntensity;
    }

    if (this.materials && this.materials.wallPlaster) {
      this.materials.wallPlaster.color.setHex(solar.plasterHex);
    }

    if (this.exteriorFoliageMats && this.exteriorFoliageMats.length >= 2) {
      this.exteriorFoliageMats[0].color.setHex(solar.foliageColorA);
      this.exteriorFoliageMats[1].color.setHex(solar.foliageColorB);
    }

    if (this.skyTextures && this.skyTextures[resolvedTheme]) {
      skyMesh.material.map = this.skyTextures[resolvedTheme];
    }
    skyMesh.material.color.setHex(0xffffff);

    switch (resolvedTheme) {
      case "Daylight":
        this.interiorLampsActive = false;
        this.fireplaceActive = false;
        setRainVisible(false);
        this.updateInteriorFixturesForTheme(0);
        break;

      case "Golden Hour":
        this.interiorLampsActive = true;
        this.fireplaceActive = true;
        this.fireplaceBaseIntensity = 1.6;
        setRainVisible(false);
        this.updateInteriorFixturesForTheme(0.85);
        break;

      case "Cozy Night":
      default:
        this.interiorLampsActive = true;
        this.fireplaceActive = true;
        this.fireplaceBaseIntensity = 2.6;
        setRainVisible(false);
        this.updateInteriorFixturesForTheme(1.4);
        break;
    }

    skyMesh.material.needsUpdate = true;
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setAtmosphere(atmosphere) {
    this.applyTheme(atmosphere);
  }

  setCameraPreset(presetName) {
    if (presetName === "topdown") {
      this.isTopDownView = true;
      this.updateFloorVisibility();
      const hasMezz = Boolean(this.unlockedFloors?.mezzanine);
      const hasArch = Boolean(this.unlockedFloors?.archive);

      if (hasMezz && hasArch) {
        // Side-by-side Top View framing Archive Wing (x=-18) + Ground Floor (x=0) + 2nd Floor (x=+18)
        _camPosGoal.set(0.0, 41.5, 14.5);
        _camTargetGoal.set(0.0, 0.4, 0.0);
      } else if (hasMezz) {
        // Side-by-side Top View framing Ground Floor (x=0) + 2nd Floor (x=+18)
        _camPosGoal.set(9.0, 27.5, 9.5);
        _camTargetGoal.set(9.0, 0.4, 0.0);
      } else {
        // Top View framing Ground Floor only (x=0)
        _camPosGoal.set(0.0, 17.5, 3.0);
        _camTargetGoal.set(0.0, 0.4, 0.0);
      }
      this.cameraTransitionActive = true;
      this.updateProjectedOverlays();
      return;
    }

    this.isTopDownView = false;
    if (presetName === "lounge") {
      this.currentFloor = "ground";
    }
    this.updateFloorVisibility();
    const preset = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.overview;
    _camPosGoal.copy(preset.pos);
    _camTargetGoal.copy(preset.target);
    this.cameraTransitionActive = true;
    this.updateProjectedOverlays();
  }

  switchFloor(floorId) {
    this.currentFloor = floorId || "ground";
    this.isTopDownView = false;

    if (floorId === "mezzanine") {
      this.unlockedFloors.mezzanine = true;
      this.updateFloorVisibility();
      // Full isometric room view centered on 2nd Floor Hall (centerX = +18.0)
      _camPosGoal.set(18.0 + 1.2, 10.2, 14.8);
      _camTargetGoal.set(18.0 + 0.3, 1.1, 0.4);
    } else if (floorId === "archive") {
      this.unlockedFloors.archive = true;
      this.updateFloorVisibility();
      // Full isometric room view centered on Archive Wing Hall (centerX = -18.0)
      _camPosGoal.set(-18.0 + 1.2, 10.2, 14.8);
      _camTargetGoal.set(-18.0 + 0.3, 1.1, 0.4);
    } else {
      this.updateFloorVisibility();
      _camPosGoal.copy(CAMERA_PRESETS.overview.pos);
      _camTargetGoal.copy(CAMERA_PRESETS.overview.target);
    }
    this.cameraTransitionActive = true;
    this.updateProjectedOverlays();
  }

  bindEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener("pointerdown", (e) => {
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
    });

    dom.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - this.lastPointerMoveTime < 24) return;
      this.lastPointerMoveTime = now;

      const rect = dom.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const visibleHits = this.raycaster
        .intersectObjects(this.hitMeshes, false)
        .filter((h) => {
          if (h.object.userData.isBreakLounge) return true;
          const unit = this.deskUnits.get(h.object.userData.deskId);
          return unit && unit.group.visible;
        });

      const topHit = visibleHits.length > 0 ? visibleHits[0].object : null;
      const hitDeskId = topHit && topHit.userData.deskId ? topHit.userData.deskId : null;
      const hitLounge = topHit && Boolean(topHit.userData.isBreakLounge);

      if (hitDeskId !== this.hoveredDeskId) {
        if (this.hoveredDeskId) {
          const prevUnit = this.deskUnits.get(this.hoveredDeskId);
          if (prevUnit) {
            prevUnit.highlightMat.emissive.setHex(0x000000);
            prevUnit.highlightMat.emissiveIntensity = 0;
            if (prevUnit.overlayEl) prevUnit.overlayEl.classList.remove("is-hovered");
          }
        }
        this.hoveredDeskId = hitDeskId;
        if (hitDeskId) {
          const nextUnit = this.deskUnits.get(hitDeskId);
          if (nextUnit) {
            nextUnit.highlightMat.emissive.setHex(0xc2a649);
            nextUnit.highlightMat.emissiveIntensity = 0.24;
            if (nextUnit.overlayEl) nextUnit.overlayEl.classList.add("is-hovered");
          }
        }
      }
      dom.style.cursor = (hitDeskId || hitLounge) ? "pointer" : "grab";
    });

    dom.addEventListener("pointerup", (e) => {
      const dx = Math.abs(e.clientX - this.pointerDownPos.x);
      const dy = Math.abs(e.clientY - this.pointerDownPos.y);
      if (dx > 6 || dy > 6) return;

      const rect = dom.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const visibleHits = this.raycaster
        .intersectObjects(this.hitMeshes, false)
        .filter((h) => {
          if (h.object.userData.isBreakLounge) return true;
          const unit = this.deskUnits.get(h.object.userData.deskId);
          return unit && unit.group.visible;
        });

      if (visibleHits.length > 0) {
        const hitObj = visibleHits[0].object;
        if (hitObj.userData.isBreakLounge) {
          if (typeof window.sitAtBreakLounge === "function") {
            window.sitAtBreakLounge();
          }
          return;
        }
        const deskId = hitObj.userData.deskId;
        const unit = this.deskUnits.get(deskId);
        if (!unit) return;
        if (unit.occupiedBy && !unit.isMyDesk) {
          if (typeof window.togglePeerPopover === "function") {
            window.togglePeerPopover(deskId);
          }
        } else if (typeof window.openDeskModal === "function") {
          window.openDeskModal(deskId);
        }
      }
    });

    window.addEventListener("resize", () => this.handleResize());
    if (typeof ResizeObserver !== "undefined" && this.container) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    }
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const stageEl = document.getElementById("cozy-library-stage");
    const width = this.container.clientWidth || (stageEl ? stageEl.clientWidth : 0);
    const height = this.container.clientHeight || (stageEl ? stageEl.clientHeight : 0);
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
    this.updateProjectedOverlays();
  }

  onResize() {
    this.handleResize();
  }

  updateProjectedOverlays() {
    if (!this.container || !this.camera) return;
    const stageEl = document.getElementById("cozy-library-stage");
    const width = this.container.clientWidth || (stageEl ? stageEl.clientWidth : 960);
    const height = this.container.clientHeight || (stageEl ? stageEl.clientHeight : 600);
    if (width <= 0 || height <= 0) return;

    this.deskUnits.forEach((unit) => {
      if (!unit.overlayEl) return;
      const floorKey = unit.layout.floor || "ground";
      const isFloorUnlocked = Boolean(this.unlockedFloors[floorKey]);
      const shouldShowOnFloor = isFloorUnlocked && (this.isTopDownView || floorKey === this.currentFloor);

      if (!shouldShowOnFloor || !unit.group.visible) {
        unit.overlayEl.style.display = "none";
        return;
      }

      const baseY = unit.layout.y || 0;
      _projVec.set(
        unit.layout.x,
        baseY + (unit.occupiedBy ? 0.32 : (unit.reservedBy ? 1.02 : 1.06)),
        unit.layout.z + (unit.occupiedBy ? 0.56 : 0)
      );
      _projVec.project(this.camera);

      if (_projVec.z > 1) {
        unit.overlayEl.style.display = "none";
        return;
      }
      unit.overlayEl.style.display = "flex";
      const sx = (_projVec.x * 0.5 + 0.5) * width;
      const sy = (-_projVec.y * 0.5 + 0.5) * height;
      unit.overlayEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    });

    if (this.loungeOverlayEl) {
      const showLounge = this.isTopDownView || this.currentFloor === "ground";
      if (!showLounge) {
        this.loungeOverlayEl.style.display = "none";
      } else {
        _projVec.set(5.8, 1.15, 3.35);
        _projVec.project(this.camera);
        if (_projVec.z > 1) {
          this.loungeOverlayEl.style.display = "none";
        } else {
          this.loungeOverlayEl.style.display = "flex";
          const lx = (_projVec.x * 0.5 + 0.5) * width;
          const ly = (-_projVec.y * 0.5 + 0.5) * height;
          this.loungeOverlayEl.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
      }
    }
  }

  afterDraw(cb) {
    const gl = this.renderer.getContext();
    if (!gl || typeof gl.fenceSync !== "function") {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  startLoop() {
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.updateProjectedOverlays();
    }

    const tick = () => {
      if (this.isDisposed) return;

      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      const roomEl = document.getElementById("cozy-library-room");
      const sectionEl = document.getElementById("cozy-library");
      const isVisible = sectionEl && sectionEl.classList.contains("active") && roomEl && !roomEl.hidden;

      if (isVisible) {
        if (this.container && (this.renderer.domElement.width === 0 || Math.abs(this.container.clientWidth - this.renderer.domElement.clientWidth) > 2)) {
          this.handleResize();
        }

        // 1. Smooth Camera Preset Damping
        if (this.cameraTransitionActive) {
          this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camPosGoal.x, 5, dt);
          this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camPosGoal.y, 5, dt);
          this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camPosGoal.z, 5, dt);

          this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, _camTargetGoal.x, 5, dt);
          this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, _camTargetGoal.y, 5, dt);
          this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, _camTargetGoal.z, 5, dt);

          if (this.camera.position.distanceToSquared(_camPosGoal) < 0.002) {
            this.cameraTransitionActive = false;
          }
        }

        if (this.controls) this.controls.update();

        // 2. Organic Fireplace Light Flicker & Candle Flicker (only when active at dusk/rain/night)
        if (this.fireplaceActive) {
          if (this.fireplaceLight) {
            const wave1 = Math.sin(elapsed * 6.8) * 0.22;
            const wave2 = Math.cos(elapsed * 13.4) * 0.14;
            const microJitter = (Math.random() - 0.5) * 0.08;
            this.fireplaceLight.intensity = Math.max(1.1, this.fireplaceBaseIntensity + wave1 + wave2 + microJitter);

            const colorMix = 0.5 + 0.5 * Math.sin(elapsed * 5.2 + Math.cos(elapsed * 8.1));
            _fireColorScratch.copy(_fireColorA).lerp(_fireColorB, colorMix);
            this.fireplaceLight.color.copy(_fireColorScratch);

            this.fireplaceLight.position.copy(this.fireplaceBasePos);
          }

          if (this.emberMaterials.length >= 2) {
            this.emberMaterials[0].emissiveIntensity = 1.35 + Math.sin(elapsed * 4.2) * 0.22;
            this.emberMaterials[1].emissiveIntensity = 2.0 + Math.cos(elapsed * 6.1) * 0.32;
          }

          this.flameMeshes.forEach((fGroup) => {
            const p = fGroup.userData.phase;
            const sy = 1.0 + Math.sin(elapsed * 8.4 + p) * 0.15 + Math.cos(elapsed * 14.2 + p) * 0.06;
            const sx = 1.0 + Math.cos(elapsed * 6.5 + p) * 0.08;
            fGroup.scale.set(sx, sy, sx);
            fGroup.rotation.z = Math.sin(elapsed * 5.4 + p) * 0.09;
          });
        }

        // 3. Animate Natural Mantelpiece Candle Flames & Candlelight Micro-Flicker
        if (this.interiorLampsActive) {
          this.candleFlames.forEach((flame) => {
            const p = flame.userData.phase;
            const scaleY = 1.0 + Math.sin(elapsed * 9.5 + p) * 0.1 + Math.cos(elapsed * 15.0 + p) * 0.05;
            const swayZ = Math.sin(elapsed * 4.2 + p) * 0.08;
            const swayX = Math.cos(elapsed * 3.7 + p) * 0.05;
            flame.scale.set(1.0, scaleY, 1.0);
            flame.rotation.set(swayX, 0, swayZ);
          });

          this.candleLights.forEach((cLight) => {
            const p = cLight.userData.phase;
            cLight.intensity = cLight.userData.baseIntensity + Math.sin(elapsed * 8.2 + p) * 0.06;
          });
        }

        // 4. Animate Downward Rain Streaks & Glass Droplets on Arched Window
        if (this.rainParticles && this.rainParticles.visible) {
          const posAttr = this.rainParticles.geometry.attributes.position;
          const arr = posAttr.array;
          for (let i = 0; i < arr.length; i += 6) {
            arr[i + 1] -= dt * 2.9;
            arr[i + 4] -= dt * 2.9;
            if (arr[i + 1] < -1.35) {
              const resetY = 1.55;
              arr[i + 1] = resetY;
              arr[i + 4] = resetY - 0.24;
            }
          }
          posAttr.needsUpdate = true;

          this.windowDroplets.forEach((drop) => {
            drop.position.y -= dt * drop.userData.speed;
            if (drop.position.y < drop.userData.minY) {
              drop.position.y = drop.userData.maxY;
            }
          });
        }

        // 5. Animate Seated 3D Characters & Mug Steam
        this.deskUnits.forEach((unit) => {
          if (unit.occupiedBy && unit.characterGroup.userData.upperBody) {
            const { upperBody, headGroup, phase } = unit.characterGroup.userData;
            upperBody.position.y = 0.64 + Math.sin(elapsed * 2.2 + phase) * 0.008;
            if (headGroup) {
              headGroup.rotation.y = Math.sin(elapsed * 0.9 + phase) * 0.07;
            }
          }
          if (unit.steamGroup && unit.steamGroup.visible) {
            unit.steamGroup.children.forEach((puff) => {
              const cycle = (elapsed * 0.45 + puff.userData.offset) % 1;
              puff.position.y = cycle * 0.22;
              puff.scale.setScalar(0.7 + cycle * 0.6);
            });
          }
        });

        this.renderer.render(this.scene, this.camera);
        this.updateProjectedOverlays();

        if (isSoftwareGl) {
          this.afterDraw(tick);
        } else {
          this.frameId = requestAnimationFrame(tick);
        }
      } else {
        this.frameId = window.setTimeout(tick, 180);
      }
    };

    this.frameId = requestAnimationFrame(tick);
  }
}

function escapeHtmlText(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const cozyLibrary3D = new CozyLibrary3DEngine();
window.cozyLibrary3D = cozyLibrary3D;
window.DESK_LAYOUTS = DESK_LAYOUTS;
window.applyTheme = (themeName) => cozyLibrary3D.applyTheme(themeName);

function mountCozy3DIfReady() {
  const canvasWrap =
    document.getElementById("library-canvas-container") ||
    document.getElementById("cozy-library-3d-canvas-wrap");
  const labelsWrap = document.getElementById("cozy-library-3d-labels");
  if (canvasWrap) {
    if (!cozyLibrary3D.renderer || !canvasWrap.querySelector("canvas")) {
      cozyLibrary3D.init(canvasWrap, labelsWrap);
    }
    if (typeof window.syncCozyLibrary3DNow === "function") {
      window.syncCozyLibrary3DNow();
    }
    window.dispatchEvent(new CustomEvent("cozyLibrary3DReady"));
  }
}
window.mountCozy3DIfReady = mountCozy3DIfReady;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountCozy3DIfReady);
} else {
  mountCozy3DIfReady();
}
