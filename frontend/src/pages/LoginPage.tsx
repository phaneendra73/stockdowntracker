import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginPageProps {
    onLogin: (token: string) => void;
    apiBase: string;
}

export function LoginPage({ onLogin, apiBase }: LoginPageProps) {
    const [pin, setPin] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const res = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                onLogin(data.token);
            } else {
                setLoginError(data.error || 'Invalid PIN');
            }
        } catch (error) {
            setLoginError('Server connection failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
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
                    <Button
                        type="submit"
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Unlock Dashboard'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
