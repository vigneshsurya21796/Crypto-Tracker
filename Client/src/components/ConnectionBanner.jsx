import useStore from '../store/useStore';

const config = {
  connecting:   { label: 'Connecting to server…', color: 'var(--amber)', bg: 'var(--amber-dim)' },
  reconnecting: { label: 'Connection lost — reconnecting…', color: 'var(--red)', bg: 'var(--red-dim)' },
  disconnected: { label: 'Disconnected', color: 'var(--red)', bg: 'var(--red-dim)' },
};

const ConnectionBanner = () => {
  const status = useStore((s) => s.connectionStatus);
  const cfg = config[status];
  if (!cfg) return null;

  return (
    <div style={{
      background: cfg.bg,
      borderBottom: `1px solid ${cfg.color}33`,
      color: cfg.color,
      fontSize: '12px',
      fontWeight: 500,
      textAlign: 'center',
      padding: '5px 16px',
      letterSpacing: '0.01em',
    }}>
      {cfg.label}
    </div>
  );
};

export default ConnectionBanner;
