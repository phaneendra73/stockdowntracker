import { ApiTester } from '../components/ApiTester';

interface DiagnosticsPageProps {
    token: string;
    apiBase: string;
}

export function DiagnosticsPage({ token, apiBase }: DiagnosticsPageProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                        Diagnostics <span className="text-primary italic">Lab</span>
                    </h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Manual API Integrity Verification
                    </p>
                </div>
            </div>
            <ApiTester apiBase={apiBase} token={token} />
        </div>
    );
}
