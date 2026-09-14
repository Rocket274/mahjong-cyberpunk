"use strict";

/* ============================================================
   THEMES
   Tile faces are drawn as inline SVG (no emoji, no external font
   glyphs) so they render identically and crisply on every phone,
   instead of relying on device-dependent emoji/Unicode fonts.
   ============================================================ */
const THEMES = {
  classic: { label: "Classique" },
  cyberpunk: { label: "Neon City 2077" }
};
const TYPE_COUNT = 34; // 4 winds + 3 dragons + 9x3 suits, classic mahjong set

/* ---------- shared 3x3 dot/stick layout table (suits 1-9) ---------- */
const DOT_LAYOUTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
  7: [[1, 0], [0, 1], [1, 1], [2, 1], [0, 0], [0, 2], [2, 2]],
  8: [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  9: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]]
};
const gx = (g) => 4 + g * 8;
const gy = (g) => 4 + g * 8;

/* ---------- CLASSIC theme: hand-composed SVG per tile ---------- */
const WIND_DEF = [
  { letter: "E", angle: 90 },   // East
  { letter: "S", angle: 180 },  // South
  { letter: "O", angle: 270 },  // Ouest (West)
  { letter: "N", angle: 0 }     // North
];
const CLASSIC_COLORS = { wind: "#8a6a2f", char: "#2d4f8f", bamboo: "#2f7a3d", circle: "#b1472e" };

function svgWrap(inner) {
  return `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

function classicGlyph(idx) {
  if (idx < 4) {
    const { letter, angle } = WIND_DEF[idx];
    const c = CLASSIC_COLORS.wind;
    return svgWrap(
      `<circle cx="12" cy="12" r="9.2" fill="none" stroke="${c}" stroke-width="1.4"/>
       <g transform="rotate(${angle} 12 12)"><path d="M12 4.2 L15 11 L12 9.1 L9 11 Z" fill="${c}"/></g>
       <text x="12" y="21.6" font-size="6.4" text-anchor="middle" fill="${c}" font-weight="700" font-family="Arial,sans-serif">${letter}</text>`
    );
  }
  if (idx < 7) {
    if (idx === 4) return svgWrap(`<rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="#c1503e"/><rect x="9.5" y="6.5" width="5" height="11" fill="#f6efdd"/><rect x="6.5" y="10.2" width="11" height="2.6" fill="#f6efdd"/>`);
    if (idx === 5) return svgWrap(`<path d="M7 9 Q12 3 17 9 Q22 15 16.5 16.5 Q12 18 7.5 16.5 Q2 15 7 9 Z" fill="none" stroke="#2f7a3d" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`);
    return svgWrap(`<rect x="4.5" y="4.5" width="15" height="15" rx="3" fill="none" stroke="#3f6fae" stroke-width="1.8"/><rect x="7.5" y="7.5" width="9" height="9" rx="1.4" fill="none" stroke="#3f6fae" stroke-width="1.1"/>`);
  }
  if (idx < 16) {
    const n = idx - 6;
    const c = CLASSIC_COLORS.char;
    return svgWrap(
      `<text x="12" y="15.5" font-size="12.5" text-anchor="middle" font-weight="800" fill="${c}" font-family="Arial,sans-serif">${n}</text>
       <ellipse cx="12" cy="19.6" rx="4.6" ry="1.5" fill="none" stroke="${c}" stroke-width="1"/>`
    );
  }
  if (idx < 25) {
    const n = idx - 15;
    const c = CLASSIC_COLORS.bamboo;
    const pts = DOT_LAYOUTS[n].map(([px, py]) =>
      `<g transform="translate(${gx(px) - 1.3},${gy(py) - 4})"><rect width="2.6" height="8" rx="1.3" fill="${c}"/><line x1="0" y1="2.7" x2="2.6" y2="2.7" stroke="#f6efdd" stroke-width="0.6"/><line x1="0" y1="5.3" x2="2.6" y2="5.3" stroke="#f6efdd" stroke-width="0.6"/></g>`
    ).join("");
    return svgWrap(pts);
  }
  {
    const n = idx - 24;
    const c = CLASSIC_COLORS.circle;
    const pts = DOT_LAYOUTS[n].map(([px, py]) =>
      `<circle cx="${gx(px)}" cy="${gy(py)}" r="2.5" fill="${c}"/><circle cx="${gx(px)}" cy="${gy(py)}" r="1" fill="#f6efdd"/>`
    ).join("");
    return svgWrap(pts);
  }
}
function classicAccent(idx) {
  if (idx < 4) return CLASSIC_COLORS.wind;
  if (idx < 7) return ["#c1503e", "#2f7a3d", "#3f6fae"][idx - 4];
  if (idx < 16) return CLASSIC_COLORS.char;
  if (idx < 25) return CLASSIC_COLORS.bamboo;
  return CLASSIC_COLORS.circle;
}

/* ---------- CYBERPUNK theme: original neon "netrunner" glyph set ---------- */
const CP_GLYPHS = [
  (c) => `<circle cx="12" cy="12" r="4.2" fill="none" stroke="${c}" stroke-width="1.7"/><circle cx="12" cy="12" r="1.3" fill="${c}"/><line x1="12" y1="3" x2="12" y2="6.4" stroke="${c}" stroke-width="1.4"/><line x1="12" y1="17.6" x2="12" y2="21" stroke="${c}" stroke-width="1.4"/>`,
  (c) => `<rect x="6" y="6" width="12" height="12" rx="1.5" fill="none" stroke="${c}" stroke-width="1.6"/><rect x="9.5" y="9.5" width="5" height="5" fill="${c}"/><line x1="9" y1="3" x2="9" y2="6" stroke="${c}" stroke-width="1.3"/><line x1="15" y1="3" x2="15" y2="6" stroke="${c}" stroke-width="1.3"/><line x1="9" y1="18" x2="9" y2="21" stroke="${c}" stroke-width="1.3"/><line x1="15" y1="18" x2="15" y2="21" stroke="${c}" stroke-width="1.3"/>`,
  (c) => `<path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6z" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="12" r="2" fill="${c}"/>`,
  (c) => `<path d="M13 2L5 14h5l-2 8 9-13h-5z" fill="${c}"/>`,
  (c) => `<path d="M3 13c2.2-5 4.4-5 6.6 0s4.4 5 6.6 0 4.4-5 6.6 0" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`,
  (c) => `<path d="M12 4a5 5 0 015 5c0 3-2.2 4-2.2 7H9.2C9.2 13 7 12 7 9a5 5 0 015-5z" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M9 19.5h6M9.8 21.3h4.4" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`,
  (c) => `<path d="M6 21c0-4.4 2.9-7 6-7s6 2.6 6 7" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="8.5" r="4.3" fill="none" stroke="${c}" stroke-width="1.6"/>`,
  (c) => `<circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="1.6"/><line x1="12" y1="2.7" x2="12" y2="7.2" stroke="${c}" stroke-width="1.6"/><line x1="12" y1="16.8" x2="12" y2="21.3" stroke="${c}" stroke-width="1.6"/><line x1="2.7" y1="12" x2="7.2" y2="12" stroke="${c}" stroke-width="1.6"/><line x1="16.8" y1="12" x2="21.3" y2="12" stroke="${c}" stroke-width="1.6"/>`,
  (c) => `<path d="M4.5 4.5l6.2 6.2M19.5 4.5l-6.2 6.2M4.5 19.5l6.2-6.2M19.5 19.5l-6.2-6.2" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="1.6" fill="${c}"/>`,
  (c) => `<rect x="5" y="10" width="14" height="7.5" rx="2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M8 10V6.6a4 4 0 018 0V10" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="13.7" r="1.3" fill="${c}"/>`
];
const CP_COLORS = ["#ff2fd4", "#00f0ff", "#ffe600"];

function cyberpunkGlyph(idx) {
  const glyphFn = CP_GLYPHS[idx % CP_GLYPHS.length];
  const color = CP_COLORS[Math.floor(idx / CP_GLYPHS.length) % CP_COLORS.length];
  let mark = "";
  if (idx >= 30) {
    const n = idx - 29;
    for (let i = 0; i < n; i++) mark += `<circle cx="${19 - i * 3.4}" cy="4.2" r="1.15" fill="${color}"/>`;
  }
  return svgWrap(glyphFn(color) + mark);
}
function cyberpunkAccent(idx) {
  return CP_COLORS[Math.floor(idx / CP_GLYPHS.length) % CP_COLORS.length];
}

function tileGraphic(theme, idx) {
  return theme === "cyberpunk" ? cyberpunkGlyph(idx) : classicGlyph(idx);
}
function tileAccent(theme, idx) {
  return theme === "cyberpunk" ? cyberpunkAccent(idx) : classicAccent(idx);
}

/* ============================================================
   SEEDED RNG (mulberry32) — same seed always → same board,
   which is what lets "Recommencer" reset the exact same layout.
   ============================================================ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArr(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor((rand ? rand() : Math.random()) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================================
   PROCEDURAL LAYOUT GENERATOR
   Produces a virtually unlimited number of distinct 3D boards.
   Every layer is mirrored left/right, which guarantees an even
   tile count with no extra bookkeeping.
   ============================================================ */
function key(r, c) { return r + "_" + c; }
function parseKey(k) { const [r, c] = k.split("_").map(Number); return { row: r, col: c }; }

function buildShape(seed) {
  const rand = mulberry32(seed);
  // Portrait phones get a taller/narrower board so it fills the screen
  // instead of shrinking down to fit a wide landscape shape.
  const portrait = typeof window !== "undefined" && window.innerWidth > 0 && window.innerWidth <= window.innerHeight;
  const cols = portrait ? 8 + 2 * Math.floor(rand() * 4) : 12 + 2 * Math.floor(rand() * 5);   // 8..14 portrait / 12..20 landscape (even)
  const rows = portrait ? 10 + 2 * Math.floor(rand() * 4) : 6 + 2 * Math.floor(rand() * 3);   // 10..16 portrait / 6..10 landscape (even)
  const half = cols / 2;
  const cy = (rows - 1) / 2;
  const rx = half * (0.55 + rand() * 0.42);
  const ry = (rows / 2) * (0.55 + rand() * 0.42);
  const noise = 0.12 + rand() * 0.28;

  function makeLayer0() {
    const set = new Set();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < half; col++) {
        const nx = (col - (half - 0.5)) / rx;
        const ny = (row - cy) / ry;
        const dist = nx * nx + ny * ny;
        if (dist > 1) continue;
        if (rand() < noise * dist) continue;
        set.add(key(row, col));
        set.add(key(row, cols - 1 - col));
      }
    }
    return set;
  }

  let layer0 = makeLayer0();
  if (layer0.size < 16) {
    // fallback: fuller ellipse, no jagged noise, guarantees a playable board
    layer0 = new Set();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < half; col++) {
        const nx = (col - (half - 0.5)) / rx;
        const ny = (row - cy) / ry;
        if (nx * nx + ny * ny <= 1) {
          layer0.add(key(row, col));
          layer0.add(key(row, cols - 1 - col));
        }
      }
    }
  }

  const layers = [layer0];
  let prev = layer0;
  const maxLayers = 3 + Math.floor(rand() * 4); // 3..6
  for (let L = 1; L < maxLayers; L++) {
    const keepProb = 0.58 - L * 0.09;
    if (keepProb < 0.16) break;
    const cur = new Set();
    prev.forEach((cellKey) => {
      const { row, col } = parseKey(cellKey);
      if (col > cols - 1 - col) return; // only process left half, mirror the rest
      if (rand() < keepProb) {
        cur.add(key(row, col));
        cur.add(key(row, cols - 1 - col));
      }
    });
    if (cur.size < 4) break;
    layers.push(cur);
    prev = cur;
  }

  return { cols, rows, layers };
}

function generateLayout(seed) {
  const { cols, rows, layers } = buildShape(seed);
  const rand = mulberry32(seed ^ 0x9e3779b9);

  const slots = [];
  layers.forEach((set, layer) => {
    set.forEach((cellKey) => {
      const { row, col } = parseKey(cellKey);
      slots.push({ row, col, layer });
    });
  });

  if (slots.length % 2 !== 0) slots.pop();
  if (slots.length < 8) return generateLayout(seed + 101); // vanishingly rare; retry with new seed

  const pairs = slots.length / 2;
  const typeSeq = [];
  for (let i = 0; i < pairs; i++) {
    const t = i % TYPE_COUNT;
    typeSeq.push(t, t);
  }
  shuffleArr(typeSeq, rand);
  shuffleArr(slots, rand);

  const tiles = slots.map((s, i) => ({
    id: "t" + i,
    row: s.row,
    col: s.col,
    layer: s.layer,
    type: typeSeq[i],
    removed: false
  }));

  const layerCount = layers.length;
  return { seed, cols, rows, layerCount, tiles };
}

/* ============================================================
   GAME STATE
   ============================================================ */
const state = {
  seed: 0,
  cols: 0, rows: 0, layerCount: 0,
  tiles: [],
  selected: null,
  jokerMode: false,
  jokerPicks: [],
  history: [],
  powers: { hint: 3, shuffle: 2, joker: 1, undo: 3 },
  moves: 0,
  startTime: 0,
  elapsedFrozen: 0,
  theme: "classic"
};

const STEP_X = 36, STEP_Y = 46, TILE_W = 46, TILE_H = 60;
const LAYER_OFF_X = 7, LAYER_OFF_Y = 9;
const PAD = 20;

/* subtle haptic feedback on supported phones (no-op elsewhere) */
function vibrate(pattern) { if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} } }

const el = (id) => document.getElementById(id);
const boardEl = el("board");
const boardWrapper = el("board-wrapper");
const boardViewport = el("board-viewport");
const toastEl = el("toast");

/* ---------- board rules ---------- */
function isFree(tile) {
  if (tile.removed) return false;
  const covered = state.tiles.some(
    (t) => !t.removed && t.layer === tile.layer + 1 && t.row === tile.row && t.col === tile.col
  );
  if (covered) return false;
  const leftBlocked = state.tiles.some(
    (t) => !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1
  );
  const rightBlocked = state.tiles.some(
    (t) => !t.removed && t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1
  );
  return !leftBlocked || !rightBlocked;
}

function remainingTiles() { return state.tiles.filter((t) => !t.removed); }
function freeTiles() { return remainingTiles().filter(isFree); }

function findMatchPair() {
  const free = freeTiles();
  const byType = new Map();
  shuffleArr(free);
  for (const t of free) {
    if (!byType.has(t.type)) byType.set(t.type, []);
    byType.get(t.type).push(t);
    if (byType.get(t.type).length >= 2) return byType.get(t.type).slice(0, 2);
  }
  return null;
}

/* ============================================================
   RENDERING
   ============================================================ */
function render() {
  boardEl.innerHTML = "";
  const width = state.cols * STEP_X + TILE_W + state.layerCount * LAYER_OFF_X + PAD * 2;
  const height = state.rows * STEP_Y + TILE_H + state.layerCount * LAYER_OFF_Y + PAD * 2;
  boardEl.style.width = width + "px";
  boardEl.style.height = height + "px";

  const tiles = remainingTiles().sort((a, b) => {
    if (a.layer !== b.layer) return a.layer - b.layer;
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  for (const tile of tiles) {
    const div = document.createElement("div");
    div.className = "tile";
    div.dataset.id = tile.id;
    div.setAttribute("tabindex", "0");
    div.setAttribute("role", "gridcell");
    const x = PAD + tile.col * STEP_X + tile.layer * LAYER_OFF_X;
    const y = PAD + tile.row * STEP_Y - tile.layer * LAYER_OFF_Y;
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = TILE_W + "px";
    div.style.height = TILE_H + "px";
    div.style.zIndex = String(tile.layer * 100000 + tile.row * 100 + tile.col);

    const sym = document.createElement("span");
    sym.className = "tile-symbol";
    sym.innerHTML = tileGraphic(state.theme, tile.type);
    div.appendChild(sym);
    div.style.setProperty("--tile-accent", tileAccent(state.theme, tile.type));

    if (!isFree(tile)) div.classList.add("locked");
    if (state.selected && state.selected.id === tile.id) div.classList.add("selected");
    if (state.jokerMode && state.jokerPicks.some((p) => p.id === tile.id)) div.classList.add("joker-target");

    div.addEventListener("click", () => onTileClick(tile));
    div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTileClick(tile); }
    });

    boardEl.appendChild(div);
  }

  fitBoard();
  updateStats();
}

function fitBoard() {
  const vw = boardViewport.clientWidth;
  const vh = boardViewport.clientHeight;
  const bw = parseFloat(boardEl.style.width) || 1;
  const bh = parseFloat(boardEl.style.height) || 1;
  const scale = Math.min((vw * 0.96) / bw, (vh * 0.94) / bh, 1.5);
  boardWrapper.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", fitBoard);
window.addEventListener("orientationchange", fitBoard);

/* ============================================================
   INTERACTIONS
   ============================================================ */
function flashLocked(tileEl) {
  tileEl.classList.add("mismatch");
  setTimeout(() => tileEl.classList.remove("mismatch"), 350);
}

function onTileClick(tile) {
  if (tile.removed) return;
  const tileEl = boardEl.querySelector(`[data-id="${tile.id}"]`);

  if (state.jokerMode) {
    if (!isFree(tile)) { toast("Cette tuile est bloquée."); if (tileEl) flashLocked(tileEl); return; }
    const idx = state.jokerPicks.findIndex((p) => p.id === tile.id);
    if (idx >= 0) { state.jokerPicks.splice(idx, 1); render(); return; }
    state.jokerPicks.push(tile);
    if (state.jokerPicks.length === 2) {
      const [a, b] = state.jokerPicks;
      a.removed = true; b.removed = true;
      state.history.push({ type: "joker", a: a.id, b: b.id });
      vibrate([15, 25, 15]);
      state.powers.joker--;
      state.moves++;
      state.jokerMode = false;
      state.jokerPicks = [];
      el("joker-hint").classList.add("hidden");
      updatePowerButtons();
      render();
      checkGameStatus();
      return;
    }
    render();
    return;
  }

  if (!isFree(tile)) { toast("Cette tuile est bloquée."); vibrate(8); if (tileEl) flashLocked(tileEl); return; }

  if (!state.selected) {
    state.selected = tile;
    render();
    return;
  }
  if (state.selected.id === tile.id) {
    state.selected = null;
    render();
    return;
  }
  if (state.selected.type === tile.type) {
    const a = state.selected, b = tile;
    a.removed = true; b.removed = true;
    state.history.push({ type: "match", a: a.id, b: b.id });
    state.selected = null;
    state.moves++;
    vibrate(15);
    render();
    checkGameStatus();
  } else {
    const prevSel = boardEl.querySelector(`[data-id="${state.selected.id}"]`);
    if (prevSel) flashLocked(prevSel);
    if (tileEl) flashLocked(tileEl);
    vibrate([10, 30, 10]);
    state.selected = tile;
    render();
  }
}

/* ============================================================
   POWERS
   ============================================================ */
function usePower(name) {
  if (state.powers[name] <= 0) { toast("Plus de charges pour ce pouvoir."); return; }

  if (name === "hint") {
    const pair = findMatchPair();
    if (!pair) { toast("Aucune paire visible — essayez Mélanger."); return; }
    state.powers.hint--;
    updatePowerButtons();
    render();
    pair.forEach((t) => {
      const tileEl = boardEl.querySelector(`[data-id="${t.id}"]`);
      if (tileEl) tileEl.classList.add("hint-pulse");
    });
    return;
  }

  if (name === "shuffle") {
    const remaining = remainingTiles();
    if (remaining.length < 2) { toast("Rien à mélanger."); return; }
    const types = remaining.map((t) => t.type);
    shuffleArr(types);
    remaining.forEach((t, i) => (t.type = types[i]));
    state.powers.shuffle--;
    state.history = []; // shuffle invalidates prior undo history
    updatePowerButtons();
    render();
    toast("Tuiles restantes mélangées.");
    checkGameStatus();
    return;
  }

  if (name === "joker") {
    state.jokerMode = true;
    state.jokerPicks = [];
    el("joker-hint").classList.remove("hidden");
    state.selected = null;
    render();
    return;
  }

  if (name === "undo") {
    if (state.history.length === 0) { toast("Rien à annuler."); return; }
    const last = state.history.pop();
    const a = state.tiles.find((t) => t.id === last.a);
    const b = state.tiles.find((t) => t.id === last.b);
    if (a) a.removed = false;
    if (b) b.removed = false;
    state.moves = Math.max(0, state.moves - 1);
    state.powers.undo--;
    updatePowerButtons();
    render();
    return;
  }
}

function updatePowerButtons() {
  ["hint", "shuffle", "joker", "undo"].forEach((name) => {
    el("count-" + name).textContent = state.powers[name];
    el("power-" + name).disabled = state.powers[name] <= 0;
  });
  el("power-joker").classList.toggle("active", state.jokerMode);
}

/* ============================================================
   GAME STATUS
   ============================================================ */
function checkGameStatus() {
  const remaining = remainingTiles();
  if (remaining.length === 0) { showWin(); return; }
  if (freeTiles().length < 2 || !findMatchPair()) { showStuck(); }
}

function showWin() {
  stopTimer();
  vibrate([20, 60, 20, 60, 40]);
  openModal("tpl-win", (frag) => {
    frag.querySelector("#win-stats").textContent =
      `${state.moves} coups, ${formatTime(elapsedSeconds())}.`;
    frag.querySelector("#win-restart").addEventListener("click", () => { closeModal(); restartBoard(); });
    frag.querySelector("#win-newboard").addEventListener("click", () => { closeModal(); newBoard(); });
  });
}

function showStuck() {
  openModal("tpl-stuck", (frag) => {
    frag.querySelector("#stuck-shuffle").disabled = state.powers.shuffle <= 0;
    frag.querySelector("#stuck-shuffle").addEventListener("click", () => {
      closeModal();
      usePower("shuffle");
    });
    frag.querySelector("#stuck-restart").addEventListener("click", () => { closeModal(); restartBoard(); });
    frag.querySelector("#stuck-newboard").addEventListener("click", () => { closeModal(); newBoard(); });
  });
}

/* ============================================================
   BOARD LIFECYCLE
   ============================================================ */
function loadLayout(seed) {
  const layout = generateLayout(seed >>> 0);
  state.seed = layout.seed;
  state.cols = layout.cols;
  state.rows = layout.rows;
  state.layerCount = layout.layerCount;
  state.tiles = layout.tiles;
  state.selected = null;
  state.jokerMode = false;
  state.jokerPicks = [];
  state.history = [];
  state.powers = { hint: 3, shuffle: 2, joker: 1, undo: 3 };
  state.moves = 0;
  el("joker-hint").classList.add("hidden");
  startTimer();
  updatePowerButtons();
  updateSeedLabel();
  render();
  saveState();
}

function newBoard() {
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  loadLayout(seed);
  toast("Nouveau plateau généré.");
}

function restartBoard() {
  loadLayout(state.seed);
  toast("Plateau relancé.");
}

function updateSeedLabel() {
  el("seed-label").textContent = "plateau #" + state.seed.toString(16).toUpperCase().padStart(6, "0").slice(-6);
}

/* ---------- stats / timer ---------- */
let timerHandle = null;
function elapsedSeconds() {
  return Math.floor((Date.now() - state.startTime) / 1000) + state.elapsedFrozen;
}
function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
function startTimer() {
  state.startTime = Date.now();
  state.elapsedFrozen = 0;
  stopTimer();
  timerHandle = setInterval(() => { el("stat-time").textContent = formatTime(elapsedSeconds()); }, 1000);
}
function stopTimer() { if (timerHandle) clearInterval(timerHandle); }

function updateStats() {
  el("stat-tiles").textContent = remainingTiles().length;
  el("stat-moves").textContent = state.moves;
  el("stat-time").textContent = formatTime(elapsedSeconds());
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimeout = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(templateId, setup) {
  const tpl = el(templateId);
  const content = el("modal-content");
  content.innerHTML = "";
  content.appendChild(tpl.content.cloneNode(true));
  if (setup) setup(content);
  el("modal-overlay").classList.remove("hidden");
}
function closeModal() { el("modal-overlay").classList.add("hidden"); }
el("modal-close").addEventListener("click", closeModal);
el("modal-overlay").addEventListener("click", (e) => { if (e.target.id === "modal-overlay") closeModal(); });

el("btn-help").addEventListener("click", () => {
  openModal("tpl-help", (frag) => {
    frag.querySelector("#help-close").addEventListener("click", closeModal);
  });
});

el("btn-theme").addEventListener("click", () => {
  openModal("tpl-theme", (frag) => {
    frag.querySelectorAll(".theme-card").forEach((btn) => {
      if (btn.dataset.theme === state.theme) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        setTheme(btn.dataset.theme);
        closeModal();
      });
    });
  });
});

/* ============================================================
   THEME SWITCH (visual only — never touches layout/pairing)
   ============================================================ */
function setTheme(name) {
  if (!THEMES[name]) return;
  state.theme = name;
  document.body.className = "theme-" + name;
  localStorage.setItem("mahjong-theme", name);
  render();
}

/* ============================================================
   POWER / ACTION BUTTONS
   ============================================================ */
["hint", "shuffle", "joker", "undo"].forEach((name) => {
  el("power-" + name).addEventListener("click", () => usePower(name));
});
el("btn-restart").addEventListener("click", restartBoard);
el("btn-newboard").addEventListener("click", newBoard);

/* ============================================================
   PERSISTENCE (resume where you left off)
   ============================================================ */
function saveState() {
  try {
    localStorage.setItem("mahjong-save", JSON.stringify({
      seed: state.seed,
      tiles: state.tiles.map((t) => ({ id: t.id, row: t.row, col: t.col, layer: t.layer, type: t.type, removed: t.removed })),
      cols: state.cols, rows: state.rows, layerCount: state.layerCount,
      powers: state.powers, moves: state.moves,
      elapsed: elapsedSeconds()
    }));
  } catch (e) { /* storage unavailable — ignore */ }
}

// Persist continuously on tile changes by wrapping render (cheap + simple)
const _render = render;
render = function () { _render(); saveState(); };

function tryResume() {
  try {
    const raw = localStorage.getItem("mahjong-save");
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.tiles) || data.tiles.length === 0) return false;
    state.seed = data.seed;
    state.cols = data.cols; state.rows = data.rows; state.layerCount = data.layerCount;
    state.tiles = data.tiles;
    state.powers = data.powers || { hint: 3, shuffle: 2, joker: 1, undo: 3 };
    state.moves = data.moves || 0;
    state.selected = null; state.jokerMode = false; state.jokerPicks = []; state.history = [];
    state.startTime = Date.now();
    state.elapsedFrozen = data.elapsed || 0;
    updatePowerButtons();
    updateSeedLabel();
    stopTimer();
    timerHandle = setInterval(() => { el("stat-time").textContent = formatTime(elapsedSeconds()); }, 1000);
    _render();
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   PWA: install prompt + service worker
   ============================================================ */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  el("install-btn").classList.remove("hidden");
});
el("install-btn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  el("install-btn").classList.add("hidden");
});
window.addEventListener("appinstalled", () => el("install-btn").classList.add("hidden"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

/* ============================================================
   INIT
   ============================================================ */
(function init() {
  const savedTheme = localStorage.getItem("mahjong-theme");
  if (savedTheme && THEMES[savedTheme]) {
    state.theme = savedTheme;
    document.body.className = "theme-" + savedTheme;
  }
  if (!tryResume()) {
    newBoard();
  }
})();
