// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogoClick = (e: React.MouseEvent) => {
        // If we're already on the homepage, force a full page reload to reset state
        if (pathname === '/') {
            e.preventDefault();
            window.location.href = '/';
        }
        // Otherwise, let Next.js handle the navigation normally
    };

    return (
        <header style={{
            padding: '1.5rem 0',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 2000
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🏔️</span>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        EUROTREKS
                    </span>
                </Link>
            </div>
        </header>
    );
}
