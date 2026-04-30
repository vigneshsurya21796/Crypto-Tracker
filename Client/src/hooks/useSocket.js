import { useEffect } from 'react';
import socket from '../socket/socket';
import useStore from '../store/useStore';

const useSocket = () => {
  const { activeSymbol, setPrice, setConnectionStatus } = useStore();

  useEffect(() => {
    socket.connect();
    setConnectionStatus('connecting');

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('getSnapshot');
    });

    socket.on('disconnect', () => setConnectionStatus('disconnected'));

    socket.on('connect_error', () => setConnectionStatus('reconnecting'));

    socket.on('snapshot', (data) => {
      Object.entries(data).forEach(([symbol, priceData]) => {
        if (priceData) setPrice(symbol, priceData);
      });
    });

    socket.on('price', (data) => {
      setPrice(data.symbol, data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('snapshot');
      socket.off('price');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!activeSymbol) return;
    socket.emit('subscribe', activeSymbol);
  }, [activeSymbol]);
};

export default useSocket;
