const asyncHandler = require('../middleware/asyncHandler');
const { getPrice, getAllPrices, redis } = require('../cache/redis');
const { SYMBOLS } = require('../services/binanceWS');

const VALID_INTERVALS = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];
const KLINE_TTL = { '1m': 20, '3m': 40, '5m': 60, '15m': 90, '30m': 120, '1h': 180, '2h': 240, '4h': 300, '1d': 600, '1w': 1800 };

const getSnapshot = asyncHandler(async (_req, res) => {
  const snapshot = await getAllPrices(SYMBOLS);
  res.json(snapshot);
});

const getSymbolsList = (_req, res) => {
  res.json(SYMBOLS.map((s) => s.toUpperCase()));
};

const getKlines = asyncHandler(async (req, res) => {
  const symbol   = (req.query.symbol || 'BTCUSDT').toUpperCase();
  const interval = req.query.interval || '1m';
  const limit    = Math.min(parseInt(req.query.limit) || 500, 1000);

  if (!VALID_INTERVALS.includes(interval)) {
    return res.status(400).json({ error: `Invalid interval. Valid: ${VALID_INTERVALS.join(', ')}` });
  }

  const cacheKey = `klines:${symbol}:${interval}:${limit}`;
  const cached   = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    return res.status(502).json({ error: 'Binance API error', status: response.status });
  }

  const raw = await response.json();
  const candles = raw.map(([openTime, open, high, low, close, volume]) => ({
    time:   Math.floor(openTime / 1000),
    open:   parseFloat(open),
    high:   parseFloat(high),
    low:    parseFloat(low),
    close:  parseFloat(close),
    volume: parseFloat(volume),
  }));

  const ttl = KLINE_TTL[interval] ?? 60;
  await redis.set(cacheKey, JSON.stringify({ symbol, interval, candles }), 'EX', ttl);

  res.json({ symbol, interval, candles });
});

const getPriceBySymbol = asyncHandler(async (req, res) => {
  const symbol = req.params.symbol.toLowerCase();
  const data   = await getPrice(symbol);
  if (!data) return res.status(404).json({ error: 'Symbol not found or no data yet' });
  res.json(data);
});

module.exports = { getSnapshot, getSymbolsList, getKlines, getPriceBySymbol };
