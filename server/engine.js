// server/engine.js
import { fetchBusStops } from './map.js';
import { log } from './telegram.js';

export const game = {
  started: false,
  money: 10000,
  stops: [],
  ownedStops: [],
  lines: [],
  nextLineId: 1,
  buses: []
};

/* =========================
   START – VIMPERK
========================= */
export async function startGame() {
  const lat = 49.0560;
  const lon = 13.7550;

  game.started = true;
  game.stops = await fetchBusStops(lat, lon);

  const start = game.stops[0];
  game.ownedStops.push(start);

  const line = createLine(start, null);
  log(`🏁 Start hry: ${start.name}`);
  log(`🚌 Založena linka ${line.id} (${line.directionName})`);
}

/* =========================
   TICK
========================= */
export function tick() {
  if (!game.started) return;

  // výdělek
  game.buses.forEach(bus => {
    game.money += bus.line.stops.length * 40;
    moveBus(bus);
  });

  if (game.money >= 300) {
    expandSmart();
  }
}

/* =========================
   CHYTRÁ EXPANZE
========================= */
function expandSmart() {
  const freeStops = game.stops.filter(s => !game.ownedStops.includes(s));
  if (!freeStops.length) return;

  // zkusíme rozšířit existující linky
  for (const line of game.lines) {
    const next = findStopInDirection(line, freeStops);
    if (!next) continue;

    buyStop(line, next);
    return;
  }

  // žádná linka nemá kam → větvení
  const baseLine = game.lines[Math.floor(Math.random() * game.lines.length)];
  const baseStop = lastStop(baseLine);

  const branchStop = nearestStop(baseStop, freeStops);
  if (!branchStop) return;

  const newLine = createLine(branchStop, baseLine);
  game.money -= 300;
  game.ownedStops.push(branchStop);

  log(`🌿 Větvení: linka ${newLine.id} z ${branchStop.name}`);
}

/* =========================
   LINE / BUS
========================= */
function createLine(startStop, parentLine) {
  const direction = parentLine
    ? randomPerpendicular(parentLine.direction)
    : randomDirection();

  const line = {
    id: game.nextLineId++,
    stops: [[startStop.lat, startStop.lon]],
    direction,
    directionName: directionName(direction)
  };

  game.lines.push(line);
  spawnBus(line);
  return line;
}

function spawnBus(line) {
  game.buses.push({
    line,
    index: 0,
    dir: 1
  });
}

function moveBus(bus) {
  const len = bus.line.stops.length;
  if (len < 2) return;

  bus.index += bus.dir;
  if (bus.index >= len - 1 || bus.index <= 0) {
    bus.dir *= -1;
  }
}

/* =========================
   NÁKUP ZASTÁVKY
========================= */
function buyStop(line, stop) {
  game.money -= 300;
  game.ownedStops.push(stop);
  line.stops.push([stop.lat, stop.lon]);

  log(`➕ Koupena zastávka ${stop.name}, linka ${line.id}`);
}

/* =========================
   SMĚROVÁ LOGIKA
========================= */
function findStopInDirection(line, stops) {
  const last = lastStop(line);
  let best = null;
  let bestScore = -Infinity;

  for (const s of stops) {
    const v = vector(last, s);
    const dot = dotProduct(v, line.direction);
    if (dot > bestScore && dot > 0) {
      bestScore = dot;
      best = s;
    }
  }
  return best;
}

function lastStop(line) {
  const s = line.stops.at(-1);
  return { lat: s[0], lon: s[1] };
}

function nearestStop(base, stops) {
  return stops.sort((a, b) =>
    dist(base, a) - dist(base, b)
  )[0];
}

/* =========================
   VEKTORY
========================= */
function randomDirection() {
  const a = Math.random() * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)];
}

function randomPerpendicular([x, y]) {
  return Math.random() > 0.5 ? [-y, x] : [y, -x];
}

function dotProduct(a, b) {
  return a[0]*b[0] + a[1]*b[1];
}

function vector(a, b) {
  return [b.lat - a.lat, b.lon - a.lon];
}

function directionName([x, y]) {
  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? 'sever' : 'jih';
  }
  return y > 0 ? 'východ' : 'západ';
}

function dist(a, b) {
  return Math.hypot(a.lat - b.lat, a.lon - b.lon);
}