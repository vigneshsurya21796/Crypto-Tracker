const { getPrice, getAllPrices } = require('../cache/redis');
const { SYMBOLS } = require('../services/binanceWS');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe', async (symbol) => {
      const room = symbol.toUpperCase();
      socket.join(room);
      console.log(`${socket.id} subscribed to ${room}`);

      const cached = await getPrice(symbol.toLowerCase());
      if (cached) {
        socket.emit('price', cached);
      }
    });

    socket.on('getSnapshot', async () => {
      const snapshot = await getAllPrices(SYMBOLS);
      socket.emit('snapshot', snapshot);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
