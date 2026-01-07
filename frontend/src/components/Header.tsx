import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingDown, LayoutDashboard, HeartPulse, Sun, Moon, Plus, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface HeaderProps {
    niftyPrice: number | null;
    marketStatus: any;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onLogout: () => void;
    onAddStock: (symbol: string, url: string, targetPrice: string) => Promise<void>;
    allSymbols: string[];
    isAddingStock: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function Header({
    niftyPrice,
    marketStatus,
    theme,
    toggleTheme,
    onLogout,
    onAddStock,
    allSymbols,
    open,
    setOpen
}: HeaderProps) {
    const location = useLocation();

    // Proper way is to just keep form state here
    return (
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <TrendingDown size={20} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">
                            Stock<span className="text-primary">Drop</span>
                        </h1>
                    </Link>
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
                        <Link to="/">
                            <Button
                                variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="gap-2 text-xs font-bold uppercase tracking-wider"
                            >
                                <LayoutDashboard size={14} />
                                <span className="hidden sm:inline">Live Feed</span>
                            </Button>
                        </Link>
                        <Link to="/diagnostics">
                            <Button
                                variant={location.pathname === '/diagnostics' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="gap-2 text-xs font-bold uppercase tracking-wider"
                            >
                                <HeartPulse size={14} />
                                <span className="hidden sm:inline">Health Check</span>
                            </Button>
                        </Link>
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
                                <span className="hidden sm:inline">Add Stock</span>
                            </Button>
                        </DialogTrigger>
                        <AddStockDialogContent
                            allSymbols={allSymbols}
                            onAdd={onAddStock}
                            onClose={() => setOpen(false)}
                        />
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>
        </header>
    );
}

function AddStockDialogContent({ allSymbols, onAdd, onClose }: { allSymbols: string[], onAdd: any, onClose: any }) {
    const [symbol, setSymbol] = useState('');
    const [url, setUrl] = useState('');
    const [targetPrice, setTargetPrice] = useState('');

    const handleSubmit = async () => {
        await onAdd(symbol, url, targetPrice);
        setSymbol('');
        setUrl('');
        setTargetPrice('');
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
                <DialogTitle className="text-primary font-black uppercase italic tracking-widest">Configure Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="symbol">Stock Symbol / Display Name</Label>
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
                <div className="space-y-2">
                    <Label htmlFor="url">Scraping URL (Optional)</Label>
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
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">Initialize Watch</Button>
            </div>
        </DialogContent>
    );
}
