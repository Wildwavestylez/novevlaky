import fetch from 'node-fetch';
import 'dotenv/config';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function log(text) {
  if (!TOKEN || !CHAT_ID) {
    console.warn('⚠️ Telegram není nastaven');
    return;
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.error('Telegram error', e);
  }
}