// server/engine.js (upravený tick a expand)
import { fetchBusStops } from './map.js';
import { log } from './telegram.js';

export const game = {
  started: false,
  money: 10000,
  stops: [],
  ownedStops: [],
  lines: [],
  nextLineId: 1
};

export async function startGame(lat, lon) {
  game.started = true;
  game.stops = await fetchBusStops(lat, lon);
  game.ownedStops.push(game.stops[0]);
  log(`🏁 Start hry: ${game.stops[0].name}`);
}

// Hlavní tick funkce, spouštěná každou sekundu
export function tick() {
  if (!game.started) return;

  // výdělek z linek
  game.lines.forEach(line => {
    const earnings = line.stops.length * 50; // jednoduchý výpočet
    game.money += earnings;
  });

  // AI rozhodování
  if (game.money >= 300) {
    expand();
  } else {
    // čeká na vydělání peněz
  }
}

// Funkce pro expanzi
function expand() {
  // najdeme první volnou zastávku
  const nextStop = game.stops.find(s => !game.ownedStops.includes(s));
  if (!nextStop) return;

  // koupíme zastávku
  game.ownedStops.push(nextStop);
  game.money -= 300;

  // Vybereme linku, nebo založíme novou
  let line = game.lines.find(l => l.stops.length < 5); // max 5 zastávek na linku
  if (!line) {
    line = { id: game.nextLineId++, stops: [] };
    game.lines.push(line);
    log(`🚌 Založena linka ${line.id}`);
  }

  line.stops.push([nextStop.lat, nextStop.lon]);
  log(`➕ Koupena zastávka ${nextStop.name}, přidána do linky ${line.id}`);
}