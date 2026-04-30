import { useEffect } from 'react';
import useStore from '../store/useStore';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const statusDot = {
  connected:    { color: 'var(--green)', label: 'Live' },
  connecting:   { color: 'var(--amber)', label: 'Connecting' },
  reconnecting: { color: 'var(--red)',   label: 'Reconnecting' },
  disconnected: { color: 'var(--red)',   label: 'Offline' },
};

const NAV_TABS = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Portfolio',  page: 'portfolio'  },
];

const Navbar = ({ activePage, setActivePage }) => {
  const { theme, setTheme, connectionStatus } = useStore();
  const isDark = theme === 'dark';
  const dot    = statusDot[connectionStatus] ?? statusDot.connecting;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: '52px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '4px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginRight: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.3px', color: 'var(--text)' }}>
          Crypto<span style={{ color: 'var(--blue)' }}>Tracker</span>
        </span>
      </div>

      {/* Page tabs */}
      {NAV_TABS.map(({ label, page }) => {
        const active = activePage === page;
        return (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            style={{
              fontSize: '13px', fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none', cursor: 'pointer',
              background: active ? 'var(--blue-dim)' : 'transparent',
              color:      active ? 'var(--blue)'     : 'var(--text-2)',
              position: 'relative',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {label}
            {active && (
              <span style={{
                position: 'absolute', bottom: '-1px', left: '12px', right: '12px',
                height: '2px', background: 'var(--blue)', borderRadius: '1px',
              }} />
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Connection indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
          background: dot.color, boxShadow: `0 0 8px ${dot.color}`,
        }} />
        <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 500 }}>
          {dot.label}
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 10px',
          cursor: 'pointer',
          color: 'var(--text-2)',
          fontSize: '12px', fontWeight: 500,
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        {isDark ? 'Light' : 'Dark'}
      </button>
    </nav>
  );
};

export default Navbar;
