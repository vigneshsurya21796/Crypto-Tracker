const Redis = require('ioredis');
const { REDIS_URL } = require('../config/env');

const redis = new Redis(REDIS_URL);

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

const PRICE_TTL = 60;

const setPrice = async (symbol, data) => {
  await redis.set(`price:${symbol}`, JSON.stringify(data), 'EX', PRICE_TTL);
};

const getPrice = async (symbol) => {
  const data = await redis.get(`price:${symbol}`);
  return data ? JSON.parse(data) : null;
};

const getAllPrices = async (symbols) => {
  const keys = symbols.map((s) => `price:${s}`);
  const values = await redis.mget(...keys);
  return symbols.reduce((acc, symbol, i) => {
    acc[symbol.toUpperCase()] = values[i] ? JSON.parse(values[i]) : null;
    return acc;
  }, {});
};

module.exports = { redis, setPrice, getPrice, getAllPrices };
