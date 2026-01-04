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

// START HRY VE VIMPERKU
export async function startGame() {
  const lat = 49.0560; // Vimperk
  const lon = 13.7550;

  game.started = true;
  game.stops = await fetchBusStops(lat, lon);

  const startStop = game.stops[0];
  game.ownedStops.push(startStop);

  log(`🏁 Start hry: ${startStop.name}`);

  // první linka a autobus
  const line = { id: game.nextLineId++, stops: [[startStop.lat, startStop.lon]] };
  game.lines.push(line);
  spawnBus(line);

  log(`🚌 Založena linka ${line.id}`);
}

// TICK – každý 1s
export function tick() {
  if (!game.started) return;

  // autobusy vydělávají
  game.buses.forEach(bus => {
    const line = bus.line;
    const earnings = 50 * line.stops.length;
    game.money += earnings;

    moveBus(bus);
  });

  // AI rozhodování
  if (game.money >= 300) {
    expandAI();
  }
}

// AI EXPANZE S VĚTVENÍM
function expandAI() {
  // Najdeme nejbližší volnou zastávku ke kterékoli line
  const candidates = game.stops.filter(s => !game.ownedStops.includes(s));
  if (candidates.length === 0) return;

  // vybereme náhodnou nejbližší zastávku k existující lince
  const line = game.lines[Math.floor(Math.random() * game.lines.length)];
  const lastStop = line.stops[line.stops.length - 1];
  let closest = candidates[0];
  let minDist = distance(lastStop, [closest.lat, closest.lon]);

  for (let stop of candidates) {
    const dist = distance(lastStop, [stop.lat, stop.lon]);
    if (dist < minDist) {
      minDist = dist;
      closest = stop;
    }
  }

  // koupíme zastávku
  game.ownedStops.push(closest);
  game.money -= 300;
  line.stops.push([closest.lat, closest.lon]);

  log(`➕ Koupena zastávka ${closest.name}, přidána do linky ${line.id}`);

  // větvení – pokud linka má 5 zastávek, založíme novou linku s touto zastávkou jako start
  if (line.stops.length >= 5) {
    const newLine = { id: game.nextLineId++, stops: [[closest.lat, closest.lon]] };
    game.lines.push(newLine);
    spawnBus(newLine);
    log(`🌿 Větvení: založena nová linka ${newLine.id} z ${closest.name}`);
  }
}

// SPAWN AUTOBUS
function spawnBus(line) {
  const bus = {
    line,
    index: 0,
    direction: 1
  };
  game.buses.push(bus);
}

// POHYB AUTOBUSU
function moveBus(bus) {
  const line = bus.line;
  if (line.stops.length < 2) return;

  bus.index += bus.direction;

  if (bus.index >= line.stops.length) {
    bus.index = line.stops.length - 1;
    bus.direction = -1;
  }
  if (bus.index < 0) {
    bus.index = 0;
    bus.direction = 1;
  }
}

// FUNKCE PRO VÝPOČET VZDÁLENOSTI (m)
function distance(a, b) {
  const R = 6371e3;
  const φ1 = a[0] * Math.PI / 180;
  const φ2 = b[0] * Math.PI / 180;
  const Δφ = (b[0]-a[0])*Math.PI/180;
  const Δλ = (b[1]-a[1])*Math.PI/180;

  const aa = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
  return R * c;
}