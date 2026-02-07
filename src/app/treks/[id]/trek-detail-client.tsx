'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trek } from '../../../lib/treks-data';
import { generateTrekDescription } from '../../../lib/huggingface';
import { Reviews } from '../../../components/Reviews';

interface Props {
    trek: Trek;
    initialDescription?: string;
}

export default function TrekDetailClient({ trek, initialDescription }: Props) {
    const [aiDescription, setAiDescription] = useState(initialDescription || 'Loading expert description...');
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${trek.startLat},${trek.startLng}&travelmode=transit`;

    useEffect(() => {
        if (initialDescription) {
            setAiDescription(initialDescription);
        }
    }, [initialDescription]);

    return (
        <main className="container">
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 600 }}>
                ← Back to Explorations
            </Link>

            <div className="glass-card" style={{ padding: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
                            alt={trek.name}
                            style={{ width: '100%', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                        />

                        <div style={{ marginTop: '2rem' }} className="glass-card">
                            <h3 style={{ color: '#4ade80', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🛡️</span> Expert AI Guide Briefing
                            </h3>
                            <div style={{
                                color: '#f1f5f9',
                                lineHeight: '1.8',
                                fontSize: '0.98rem',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                paddingRight: '1rem'
                            }}>
                                {aiDescription}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="tag" style={{ marginBottom: '1rem' }}>{trek.difficultyBase}</div>
                        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', fontWeight: 800 }}>{trek.name}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            {trek.city}, {trek.country}
                        </p>

                        <div className="trek-meta" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                            <span>📏 {trek.distanceKm} km Distance</span>
                            <span>📈 {trek.elevationGainM} m Elevation</span>
                            <span>⏳ {trek.durationHours} h Duration</span>
                            <span>🔄 {trek.routeType || 'Trek'} Type</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#4ade80' }}>Key Highlights</h3>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-muted)', display: 'grid', gap: '0.5rem' }}>
                                    {trek.hasCastle && <li>🏰 <strong>Castle:</strong> Historic visit</li>}
                                    {trek.hasViewpoints && <li>📸 <strong>Viewpoints:</strong> Scenic spots</li>}
                                    <li>🍽️ <strong>Dining:</strong> Huts available</li>
                                    <li>🌲 <strong>Terrain:</strong> {trek.terrainType}</li>
                                    <li>📅 <strong>Best Months:</strong> {trek.bestMonths.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]).join(', ')}</li>
                                </ul>
                            </div>
                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>🆘 Emergency</h3>
                                <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0' }}>{trek.emergencyContact || '112'}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{trek.emergencyService || 'Mountain Rescue'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <Link href={`/map/${trek.id}`} className="view-details" style={{ flex: 2 }}>
                                Open Interactive & Offline Map
                            </Link>
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="view-details" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                                🚌 Directions
                            </a>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <a href={trek.gpxUrl} download style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                📥 Download GPX for Offline Apps (Organic Maps/Komoot)
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Reviews trekId={trek.id} />
        </main>
    );
}
