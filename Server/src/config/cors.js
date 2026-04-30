const { CLIENT_URL, NODE_ENV } = require('./env');

const corsOptions = {
  origin: NODE_ENV === 'development' ? true : CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true,
};

module.exports = corsOptions;
