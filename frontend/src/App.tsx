import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { Alert } from './lib/types';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [niftyPrice, setNiftyPrice] = useState<number | null>(null);
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchAlerts();
      fetchMarketData();
      fetchAllSymbols();
    } else {
      navigate('/login');
    }
  }, [token]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchMarketData = async () => {
    try {
      const statusRes = await fetch(`${API_BASE}/api/market/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statusRes.ok) setMarketStatus(await statusRes.json());

      const niftyRes = await fetch(`${API_BASE}/api/market/nifty`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (niftyRes.ok) {
        const data = await niftyRes.json();
        setNiftyPrice(data.price);
      }
    } catch (error) {
      console.error('Market data fetch failed');
    }
  };

  const fetchAllSymbols = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/market/symbols`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAllSymbols(await res.json());
    } catch (err) {
      console.error('Symbols fetch failed');
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/stocks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAlerts([]);
    navigate('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAlerts(), fetchMarketData()]);
    setIsRefreshing(false);
  };

  const addAlert = async (symbol: string, url: string, targetPrice: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/stocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          url: url || undefined,
          targetPrice: parseFloat(targetPrice)
        })
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to add alert:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/stocks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="*" element={<LoginPage onLogin={handleLogin} apiBase={API_BASE} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Header
        niftyPrice={niftyPrice}
        marketStatus={marketStatus}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        onAddStock={addAlert}
        allSymbols={allSymbols}
        isAddingStock={false}
        open={open}
        setOpen={setOpen}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <Routes>
          <Route path="/" element={
            <DashboardPage
              alerts={alerts}
              loading={loading}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              onDeleteAlert={deleteAlert}
            />
          } />
          <Route path="/diagnostics" element={
            <DiagnosticsPage token={token} apiBase={API_BASE} />
          } />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;