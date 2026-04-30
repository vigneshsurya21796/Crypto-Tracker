const Section = ({ title, children }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-4">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
  </div>
);

const Internals = () => (
  <div className="min-h-screen bg-gray-950 p-6 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-6">Architecture Decisions</h1>

    <Section title="Why Socket.IO over raw WebSocket?">
      Socket.IO provides automatic reconnection, room-based broadcasting, and a
      fallback to HTTP long-polling. Raw WebSocket requires all of this to be
      implemented manually.
    </Section>

    <Section title="Why Node proxy instead of direct Binance connection?">
      Browsers block direct WebSocket connections to Binance due to CORS restrictions.
      The Node server connects to Binance, then relays price data to clients via
      Socket.IO — acting as a trusted middleman.
    </Section>

    <Section title="Why Zustand over Redux?">
      Zustand has minimal boilerplate, built-in persist middleware for localStorage,
      and works seamlessly with React hooks. Redux adds unnecessary complexity for
      this scale of application.
    </Section>

    <Section title="Exponential Backoff (Binance WS)">
      On disconnect, the server waits Math.min(1000 × 2^attempt, 30000) ms before
      reconnecting. This prevents hammering the Binance API — delay grows: 1s → 2s
      → 4s → … → max 30s, then resets on success.
    </Section>

    <Section title="Redis Caching Strategy">
      Prices are cached with a 60s TTL. When a new client subscribes, they
      immediately receive the last known price from Redis instead of waiting for
      the next Binance tick. This prevents a blank screen on first load.
    </Section>

    <Section title="Socket.IO Rooms per Symbol">
      Each client joins only the room for their selected symbol (e.g. "BTCUSDT").
      The server uses io.to('BTCUSDT').emit(...) — only subscribers receive that
      update. This avoids broadcasting all prices to all clients.
    </Section>
  </div>
);

export default Internals;
