import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const usePriceAlert = () => {
  const { prices, alerts, removeAlert } = useStore();
  const triggeredRef = useRef(new Set());

  useEffect(() => {
    alerts.forEach((alert) => {
      if (triggeredRef.current.has(alert.id)) return;
      const current = prices[alert.symbol];
      if (!current) return;

      const hit =
        alert.direction === 'above'
          ? current.price >= alert.targetPrice
          : current.price <= alert.targetPrice;

      if (hit) {
        triggeredRef.current.add(alert.id);
        toast.success(
          `${alert.symbol} ${alert.direction === 'above' ? '▲' : '▼'} $${alert.targetPrice.toLocaleString()}`,
          { duration: 5000 }
        );
        removeAlert(alert.id);
      }
    });
  }, [prices, alerts]);
};

export default usePriceAlert;
