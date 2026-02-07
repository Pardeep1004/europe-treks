// src/components/TrekCard.tsx
'use client';

import Link from 'next/link';
import { Trek } from '../lib/treks-data';

interface Props {
    trek: Trek;
    suitabilityLabel: string;
}

export function TrekCard({ trek, suitabilityLabel }: Props) {
    // Generate a semi-random high-quality outdoor image based on name to keep it feeling unique
    const seed = trek.name.length % 5;
    const images = [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", // Mountains
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // Lake
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", // Forest
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // Valley
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e"  // Alps
    ];
    const displayImage = `${images[seed]}?auto=format&fit=crop&w=800&q=80`;

    const difficultyColor =
        trek.difficultyBase === 'easy' ? '#22c55e' :
            trek.difficultyBase === 'moderate' ? '#3b82f6' :
                '#ef4444';

    return (
        <div className="glass-card trek-card">
            <div className="trek-image-wrapper" style={{ position: 'relative' }}>
                <Link href={`/treks/${trek.id}`} style={{ display: 'block', cursor: 'pointer' }}>
                    <img
                        src={displayImage}
                        alt={trek.name}
                        className="trek-image"
                        style={{ transition: 'transform 0.3s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                </Link>
                <div style={{ position: 'absolute', top: '1rem', right: '0.5rem', display: 'flex', gap: '0.6rem', zIndex: 10 }}>
                    <div className="tag" style={{ background: difficultyColor }}>
                        {trek.difficultyBase}
                    </div>
                    {trek.routeType && (
                        <div className="tag" style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            {trek.routeType}
                        </div>
                    )}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(2,6,23,0.8), transparent)', pointerEvents: 'none' }} />
            </div>

            <div style={{ padding: '0.5rem 0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>4.8</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(1.2k)</span>
                </div>

                <h3 className="trek-name">{trek.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem', fontWeight: 500 }}>
                    📍 {trek.city}, {trek.country}
                </p>

                <div className="trek-meta">
                    <span title="Length">📐 {trek.distanceKm} km</span>
                    <span title="Elevation Gain">📈 {trek.elevationGainM} m</span>
                    <span title="Estimated Time">⏳ {trek.durationHours} h</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700, margin: 0 }}>
                        {suitabilityLabel}
                    </p>
                    <Link href={`/treks/${trek.id}`} className="view-details" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Explore →
                    </Link>
                </div>
            </div>
        </div>
    );
}
