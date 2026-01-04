import { fetchBusStops } from './map.js';
import { log } from './telegram.js';

export const game = {
  started: false,
  money: 10000,
  stops: [],
  ownedStops: [],
  lines: []
};

export async function startGame(lat, lon) {
  game.started = true;
  game.stops = await fetchBusStops(lat, lon);
  game.ownedStops.push(game.stops[0]);

  log(`🏁 Start hry: ${game.stops[0].name}`);
}

export function tick() {
  if (!game.started) return;

  // výdělek
  game.lines.forEach(line => {
    game.money += line.stops.length * 50;
  });

  // AI rozhodování
  if (game.money > 1000) {
    expand();
  }
}

function expand() {
  const lastStop = game.ownedStops.at(-1);
  const next = game.stops.find(s => !game.ownedStops.includes(s));

  if (!next) return;

  game.ownedStops.push(next);
  game.money -= 300;

  let line = game.lines[0];
  if (!line) {
    line = { id: 1, stops: [] };
    game.lines.push(line);
    log(`🚌 Založena linka 1`);
  }

  line.stops.push([next.lat, next.lon]);
  log(`➕ Koupena zastávka ${next.name}, přidána do linky 1`);
}