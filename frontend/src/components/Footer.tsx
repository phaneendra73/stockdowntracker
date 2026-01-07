import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-muted/40 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left */}
                    <p className="text-sm text-muted-foreground">
                        © {year} StockDrop. All rights reserved.
                    </p>

                    {/* Right */}
                    <div className="flex gap-4">
                        {[
                            { Icon: Twitter, href: "https://twitter.com/phaneendra73", label: "Twitter" },
                            { Icon: Linkedin, href: "https://linkedin.com/phaneendra73", label: "LinkedIn" },
                            { Icon: Github, href: "https://github.com/phaneendra73", label: "GitHub" },
                        ].map(({ Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center
                           text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                            >
                                <Icon className="h-4.5 w-4.5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
