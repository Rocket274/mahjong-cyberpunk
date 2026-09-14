"use strict";

/* ============================================================
   THEMES — tile symbol sets (index-matched, 34 entries each)
   Classic = official Unicode Mahjong Tiles block.
   Cyberpunk = original "Neon City 2077" icon set (emoji-based,
   no reproduction of any copyrighted logos or artwork).
   ============================================================ */
const THEMES = {
  classic: {
    label: "Classique",
    symbols: [
      "🀀","🀁","🀂","🀃","🀄","🀅","🀆",
      "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
      "🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘",
      "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡"
    ]
  },
  cyberpunk: {
    label: "Neon City 2077",
    symbols: [
      "🤖","🧠","👁️","💾","📡","🛰️","🚗","🏍️","🔫",
      "💊","💉","🩸","⚡","🔋","🖥️","📱","🎮","🦾",
      "🦿","🐉","🌆","🏙️","🌃","🚁","🛸","🔦","🧬",
      "☠️","👾","🕶️","🔑","💰","🃏","🔌"
    ]
  }
};
const TYPE_COUNT = THEMES.classic.symbols.length;

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
  const cols = 12 + 2 * Math.floor(rand() * 5);   // 12..20 (even)
  const rows = 6 + 2 * Math.floor(rand() * 3);    // 6..10 (even)
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

const STEP_X = 34, STEP_Y = 44, TILE_W = 42, TILE_H = 56;
const LAYER_OFF_X = 7, LAYER_OFF_Y = 9;
const PAD = 24;

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
function tileSymbol(tile) {
  const syms = THEMES[state.theme].symbols;
  return syms[tile.type % syms.length];
}

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
    sym.textContent = tileSymbol(tile);
    div.appendChild(sym);

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

  if (!isFree(tile)) { toast("Cette tuile est bloquée."); if (tileEl) flashLocked(tileEl); return; }

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
    render();
    checkGameStatus();
  } else {
    const prevSel = boardEl.querySelector(`[data-id="${state.selected.id}"]`);
    if (prevSel) flashLocked(prevSel);
    if (tileEl) flashLocked(tileEl);
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
