import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingDown, Loader2, RefreshCw, Lock, LogOut, Sun, Moon, LayoutDashboard, HeartPulse } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ApiTester } from './components/ApiTester'

interface Alert {
  id: string
  stock: {
    id: string
    symbol: string
    name: string | null
    url: string | null
  }
  targetPrice: number
  lastCheckedPrice?: number
  notified: boolean
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeView, setActiveView] = useState<'dashboard' | 'diagnostics'>('dashboard')

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  // Form state
  const [symbol, setSymbol] = useState('')
  const [url, setUrl] = useState('')
  const [targetPrice, setTargetPrice] = useState('')

  const [marketStatus, setMarketStatus] = useState<any>(null)
  const [niftyPrice, setNiftyPrice] = useState<number | null>(null)
  const [allSymbols, setAllSymbols] = useState<string[]>([])

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

  useEffect(() => {
    if (token) {
      fetchAlerts()
      fetchMarketData()
      fetchAllSymbols()
    }
  }, [token])

  const fetchMarketData = async () => {
    try {
      const statusRes = await fetch(`${API_BASE}/api/market/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statusRes.ok) setMarketStatus(await statusRes.json())

      const niftyRes = await fetch(`${API_BASE}/api/market/nifty`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (niftyRes.ok) {
        const data = await niftyRes.json()
        setNiftyPrice(data.price)
      }
    } catch (error) {
      console.error('Market data fetch failed')
    }
  }

  const fetchAllSymbols = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/market/symbols`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setAllSymbols(await res.json())
    } catch (err) {
      console.error('Symbols fetch failed')
    }
  }

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/stocks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token)
        setToken(data.token)
      } else {
        setLoginError(data.error || 'Invalid PIN')
      }
    } catch (error) {
      setLoginError('Server connection failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setAlerts([])
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAlerts()
    await fetchMarketData()
    setIsRefreshing(false)
  }

  const addAlert = async () => {
    if (!symbol || !url || !targetPrice) return;

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
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      if (res.ok) {
        setSymbol('')
        setUrl('')
        setTargetPrice('')
        setOpen(false)
        fetchAlerts()
      }
    } catch (error) {
      console.error('Failed to add alert:', error)
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/stocks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.15)] border border-border p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Lock size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Admin Terminal</h1>
              <p className="text-muted-foreground text-sm">Initialize session with your Secure PIN</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin">Secure PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-2xl tracking-[1em] h-14 bg-muted/30 border-primary/20 focus:border-primary transition-all"
              />
            </div>
            {loginError && <p className="text-sm text-destructive text-center font-medium">{loginError}</p>}
            <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Unlock Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <TrendingDown size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              Stock<span className="text-primary">Drop</span>
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-6 border-l border-r border-border h-10 mx-4">
            {niftyPrice && (
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Nifty 50</span>
                <span className="text-sm font-black text-primary font-mono tracking-tighter">
                  ₹{niftyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {marketStatus && (
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Market Status</span>
                <span className={`text-xs font-black uppercase tracking-tighter ${marketStatus.status === 'Open' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {marketStatus.status || 'Closed'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-muted/50 p-1 rounded-lg mr-2 border border-border">
              <Button
                variant={activeView === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('dashboard')}
                className="gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <LayoutDashboard size={14} />
                Live Feed
              </Button>
              <Button
                variant={activeView === 'diagnostics' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('diagnostics')}
                className="gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <HeartPulse size={14} />
                Health Check
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <Plus size={16} />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-primary font-black uppercase italic tracking-widest">Configure Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="symbol">Stock Symbol / Display Name</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="symbol"
                        placeholder="e.g. RELIANCE, NIFTY 50"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="bg-muted/30"
                        list="stock-symbols"
                      />
                      <datalist id="stock-symbols">
                        {allSymbols.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Scraping URL (Optional - e.g. Google Finance)</Label>
                    <Input
                      id="url"
                      placeholder="https://www.google.com/finance/quote/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-muted/30 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Target Price (₹)</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      placeholder="e.g. 25000"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={addAlert} className="bg-primary text-primary-foreground hover:bg-primary/90">Initialize Watch</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeView === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-1 transition-all hover:border-primary/50 group">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Monitors</span>
                <span className="text-4xl font-black group-hover:text-primary transition-colors">{alerts.length}</span>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-1 transition-all hover:border-amber-500/50 group">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Watch</span>
                <span className="text-4xl font-black text-amber-500 group-hover:animate-pulse">
                  {alerts.filter(a => !a.notified).length}
                </span>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-1 transition-all hover:border-primary/50 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Hits</span>
                <span className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  {alerts.filter(a => a.notified).length}
                </span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden relative">
              <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tighter">Terminal Feed</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Status: System Online</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                >
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? 'Syncing...' : 'Force Sync'}
                </Button>
              </div>

              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Asset</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Base Value</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Trigger</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Spot Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Condition</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && !isRefreshing ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center bg-background/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-primary w-8 h-8" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Interrogating APIs...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-muted-foreground opacity-40">
                        <div className="flex flex-col items-center gap-2">
                          <LayoutDashboard size={32} />
                          <span className="text-xs font-bold uppercase tracking-widest">No Active Records</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow key={alert.id} className="group transition-all hover:bg-primary/[0.03] border-border">
                        <TableCell>
                          <div className="flex flex-col leading-tight">
                            <span className="font-black text-primary tracking-tighter text-lg uppercase">{alert.stock.symbol}</span>
                            {alert.stock.name && (
                              <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[120px] uppercase opacity-60">
                                {alert.stock.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">₹{alert.targetPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter">
                            WATCHING
                          </span>
                        </TableCell>
                        <TableCell>
                          {alert.lastCheckedPrice ? (
                            <span className="font-mono font-bold text-foreground">${alert.lastCheckedPrice.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted-foreground/30 italic text-[10px] font-black uppercase tracking-widest">No Signal</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {alert.notified ? (
                            <div className="flex items-center gap-2 text-primary">
                              <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Target Resolved</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-500/50">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/30" />
                              <span className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Intercepting...</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAlert(alert.id)}
                            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">Diagnostics <span className="text-primary italic">Lab</span></h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Manual API Integrity Verification</p>
              </div>
            </div>
            <ApiTester apiBase={API_BASE} token={token} />
          </div>
        )}
      </main>

      <footer className="mt-12 py-12 border-t border-border/50 text-center text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.4em]">
        <p>© 2024 STOCKDROP CORE v2.0 • INFRA: CLOUDFLARE EDGE</p>
      </footer>
    </div>
  )
}

export default App