const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT } = require('./config/env');
const corsOptions = require('./config/cors');
const { initSocket } = require('./socket/socketHandler');
const { initBinanceWS } = require('./services/binanceWS');

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

initSocket(io);
initBinanceWS(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
