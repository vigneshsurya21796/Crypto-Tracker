import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // prices
      prices: {},
      setPrice: (symbol, data) =>
        set((state) => ({ prices: { ...state.prices, [symbol]: data } })),

      // active symbol
      activeSymbol: 'BTCUSDT',
      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

      // watchlist
      watchlist: ['BTCUSDT'],
      addToWatchlist: (symbol) =>
        set((state) =>
          state.watchlist.includes(symbol)
            ? {}
            : { watchlist: [...state.watchlist, symbol] }
        ),
      removeFromWatchlist: (symbol) =>
        set((state) => ({ watchlist: state.watchlist.filter((s) => s !== symbol) })),

      // connection
      connectionStatus: 'connecting',
      setConnectionStatus: (status) => set({ connectionStatus: status }),

      // alerts
      alerts: [],
      addAlert: (alert) =>
        set((state) => ({ alerts: [...state.alerts, { ...alert, id: Date.now() }] })),
      removeAlert: (id) =>
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

      // theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // portfolio holdings  { BTCUSDT: 0.5, ETHUSDT: 2.0, ... }
      holdings: {},
      setHolding: (symbol, amount) =>
        set((state) => ({
          holdings: { ...state.holdings, [symbol]: parseFloat(amount) || 0 },
        })),
    }),
    {
      name: 'cryptotracker-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        alerts:    state.alerts,
        theme:     state.theme,
        holdings:  state.holdings,
      }),
    }
  )
);

export default useStore;
