const WebSocket = require('ws');
const { setPrice } = require('../cache/redis');

const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt'];

const streams = SYMBOLS.map((s) => `${s}@ticker`).join('/');
const BINANCE_WS_URL = `wss://stream.binance.us:9443/stream?streams=${streams}`;

let reconnectAttempt = 0;
let ioInstance = null;

const connect = () => {
  const ws = new WebSocket(BINANCE_WS_URL);

  ws.on('open', () => {
    console.log('Binance WS connected');
    reconnectAttempt = 0;
  });

  ws.on('message', async (raw) => {
    try {
      const { data } = JSON.parse(raw);
      if (!data || !data.s) return;

      const symbol = data.s.toLowerCase();
      const payload = {
        symbol: data.s,
        price: parseFloat(data.c),
        change: parseFloat(data.P),
        high: parseFloat(data.h),
        low: parseFloat(data.l),
        volume: parseFloat(data.v),
        timestamp: Date.now(),
      };

      await setPrice(symbol, payload);

      if (ioInstance) {
        ioInstance.to(data.s).emit('price', payload);
      }
    } catch (err) {
      console.error('Binance message parse error:', err.message);
    }
  });

  ws.on('close', () => {
    const delay = Math.min(1000 * 2 ** reconnectAttempt, 30000);
    console.log(`Binance WS closed. Reconnecting in ${delay}ms...`);
    reconnectAttempt++;
    setTimeout(connect, delay);
  });

  ws.on('error', (err) => {
    console.error('Binance WS error:', err.message);
    ws.terminate();
  });
};

const initBinanceWS = (io) => {
  ioInstance = io;
  connect();
};

module.exports = { initBinanceWS, SYMBOLS };
