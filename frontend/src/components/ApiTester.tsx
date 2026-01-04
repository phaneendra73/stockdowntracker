import { useState } from 'react'
import { Send, Activity, Terminal, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiTesterProps {
    apiBase: string
    token: string | null
}

export function ApiTester({ apiBase, token }: ApiTesterProps) {
    const [symbol, setSymbol] = useState('AAPL')
    const [url, setUrl] = useState('')
    const [chatId, setChatId] = useState('')
    const [loading, setLoading] = useState<{ market?: boolean; telegram?: boolean }>({})
    const [results, setResults] = useState<{ market?: any; telegram?: any }>({})

    const testMarket = async () => {
        setLoading(prev => ({ ...prev, market: true }))
        try {
            const res = await fetch(`${apiBase}/api/test/market`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ symbol, url: url || undefined })
            })
            const data = await res.json()
            setResults(prev => ({ ...prev, market: data }))
        } catch (err) {
            setResults(prev => ({ ...prev, market: { error: 'Connection failed' } }))
        } finally {
            setLoading(prev => ({ ...prev, market: false }))
        }
    }

    const testTelegram = async () => {
        setLoading(prev => ({ ...prev, telegram: true }))
        try {
            const res = await fetch(`${apiBase}/api/test/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId })
            })
            const data = await res.json()
            setResults(prev => ({ ...prev, telegram: data }))
        } catch (err) {
            setResults(prev => ({ ...prev, telegram: { error: 'Connection failed' } }))
        } finally {
            setLoading(prev => ({ ...prev, telegram: false }))
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Market API Test */}
                <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Activity size={20} />
                            NSE India Test
                        </CardTitle>
                        <CardDescription>Verify Indian stock price fetching (e.g. RELIANCE, TCS)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>NSE Symbol</Label>
                            <Input
                                value={symbol}
                                onChange={e => setSymbol(e.target.value.toUpperCase())}
                                placeholder="e.g. RELIANCE"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Scraping URL (Optional - e.g. Google Finance)</Label>
                            <Input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://www.google.com/finance/quote/..."
                                className="text-xs"
                            />
                        </div>
                        <Button
                            onClick={testMarket}
                            disabled={loading.market}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {loading.market ? 'Fetching...' : 'Fetch Live Price'}
                        </Button>

                        {results.market && (
                            <div className="mt-4 p-3 rounded bg-muted/50 font-mono text-[10px] border border-border overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    {results.market.error ? <AlertCircle size={12} className="text-destructive" /> : <CheckCircle2 size={12} className="text-primary" />}
                                    <span className="font-bold uppercase tracking-widest">{results.market.error ? 'Failed' : 'Success'}</span>
                                </div>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(results.market, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Telegram API Test */}
                <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Send size={20} />
                            Telegram Bot Test
                        </CardTitle>
                        <CardDescription>Send a test notification to your chat</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Chat ID</Label>
                            <Input
                                value={chatId}
                                onChange={e => setChatId(e.target.value)}
                                placeholder="e.g. 12345678"
                            />
                        </div>
                        <Button
                            onClick={testTelegram}
                            disabled={loading.telegram}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {loading.telegram ? 'Sending...' : 'Send Test Notification'}
                        </Button>

                        {results.telegram && (
                            <div className="mt-4 p-3 rounded bg-muted/50 font-mono text-[10px] border border-border overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    {!results.telegram.success ? <AlertCircle size={12} className="text-destructive" /> : <CheckCircle2 size={12} className="text-primary" />}
                                    <span className="font-bold uppercase tracking-widest">{!results.telegram.success ? 'Failed' : 'Success'}</span>
                                </div>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(results.telegram, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border shadow-lg border-dashed">
                <CardContent className="py-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2 text-xs">
                        <Terminal size={14} />
                        <span className="font-mono">API_BASE: {apiBase}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-tighter">
                        System Diagnostics Mode
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
