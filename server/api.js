// server/api.js
import express from 'express';
import { game } from './engine.js';

const router = express.Router();

router.get('/state', (req, res) => {
  res.json({
    buses: game.buses.map(b => ({
      id: b.id,
      from: b.from,
      to: b.to,
      progress: b.progress,
      stops: b.line.stops
    })),
    money: game.money
  });
});

export default router;