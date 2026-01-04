import express from 'express';
import { game, startGame, tick } from './engine.js';

const app = express();
app.use(express.json());
app.use(express.static('../web'));

app.post('/api/start', async (req, res) => {
  if (!game.started) {
    await startGame(req.body.lat, req.body.lng);
  }
  res.sendStatus(200);
});

app.get('/api/state', (req, res) => {
  res.json({
    money: game.money,
    lines: game.lines,
    stops: game.ownedStops
  });
});

setInterval(tick, 1000);

app.listen(3000, () => console.log('BUSGAME běží'));