import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ConnectionBanner from './components/ConnectionBanner';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import useSocket from './hooks/useSocket';
import usePriceAlert from './hooks/usePriceAlert';
import useStore from './store/useStore';

function App() {
  useSocket();
  usePriceAlert();
  const theme = useStore((s) => s.theme);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const t = setTimeout(() => document.body.classList.add('theme-ready'), 100);
    return () => clearTimeout(t);
  }, [theme]);

  const toastBg    = theme === 'dark' ? '#111420' : '#ffffff';
  const toastColor = theme === 'dark' ? '#e2e6f4' : '#0d1020';

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:   toastBg,
            color:        toastColor,
            border:       '1px solid var(--border-2)',
            borderRadius: 'var(--radius)',
            fontSize:     '13px',
            boxShadow:    'var(--shadow-sm)',
          },
        }}
      />
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <ConnectionBanner />
      {activePage === 'dashboard' ? <Dashboard /> : <Portfolio />}
    </>
  );
}

export default App;
