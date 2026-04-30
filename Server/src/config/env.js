require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
