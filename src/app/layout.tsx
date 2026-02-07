// src/app/layout.tsx
import '../styles/globals.css';
import { Header } from '../components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Europe Treks - Discover European Hiking Trails',
    description: 'Explore thousands of hand-curated hiking trails across Europe. From the Alps to Scottish Highlands, find your perfect adventure with AI-powered recommendations.',
    keywords: ['hiking', 'trekking', 'Europe', 'trails', 'Alps', 'mountains', 'outdoor', 'adventure', 'European hikes'],
    authors: [{ name: 'Europe Treks' }],
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
    themeColor: '#22c55e',
    openGraph: {
        title: 'Europe Treks - Discover European Hiking Trails',
        description: 'Explore thousands of curated hiking trails across Europe',
        type: 'website',
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Europe Treks - Discover European Hiking Trails',
        description: 'Explore thousands of curated hiking trails across Europe',
    },
    appleWebApp: {
        capable: true,
        title: 'EuroTreks',
        statusBarStyle: 'black-translucent',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Header />
                {children}
            </body>
        </html>
    );
}
