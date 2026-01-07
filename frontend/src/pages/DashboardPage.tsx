import { RefreshCw, LayoutDashboard, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert } from '@/lib/types';

interface DashboardPageProps {
    alerts: Alert[];
    loading: boolean;
    isRefreshing: boolean;
    onRefresh: () => Promise<void>;
    onDeleteAlert: (id: string) => Promise<void>;
}

export function DashboardPage({
    alerts,
    loading,
    isRefreshing,
    onRefresh,
    onDeleteAlert
}: DashboardPageProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        onClick={onRefresh}
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
                                            <span className="font-mono font-bold text-foreground">₹{alert.lastCheckedPrice.toFixed(2)}</span>
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
                                            onClick={() => onDeleteAlert(alert.id)}
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
        </div>
    );
}
