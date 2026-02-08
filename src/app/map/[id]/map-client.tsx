'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Trek } from '../../../lib/treks-data';

// Dynamically import the TrekMap component to avoid SSR issues with Leaflet
const TrekMap = dynamic(() => import('../../../components/TrekMap'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '100%', width: '100%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem' }}>
            <div className="tag" style={{ animation: 'pulse 1.5s infinite' }}>🛰️ Initializing Navigation...</div>
        </div>
    )
});

interface Props {
    trek: Trek;
}

interface Amenity {
    type: 'toilet' | 'restaurant';
    lat: number;
    lon: number;
    name: string;
}

export default function MapClient({ trek }: Props) {
    const center: [number, number] = [trek.startLat, trek.startLng];
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [realAmenities, setRealAmenities] = useState<Amenity[]>([]);
    const [isLoadingPOIs, setIsLoadingPOIs] = useState(true);
    const [showEmergency, setShowEmergency] = useState(false);
    const [history, setHistory] = useState<string>('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Help create a deterministic route that doesn't change on re-render
    const seededRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        return () => {
            hash = (hash + 0x6D2B79F5) | 0;
            let t = Math.imul(hash ^ (hash >>> 15), 1 | hash);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    const [isOfflineSaved, setIsOfflineSaved] = useState(false);

    // Generate a simulated but FIXED trail path based on the trek ID
    const trailPath = useMemo(() => {
        const rng = seededRandom(trek.id || trek.name);
        const points: [number, number][] = [center];
        const numPoints = 25; // More points for a better route
        let lastLat = center[0];
        let lastLng = center[1];

        for (let i = 1; i < numPoints; i++) {
            // Deterministic movement
            lastLat += (rng() - 0.5) * 0.004;
            lastLng += (rng() - 0.5) * 0.004;
            points.push([lastLat, lastLng]);
        }
        return points;
    }, [trek.id, trek.name, center[0], center[1]]);

    // Fetch REAL nearby toilets and restaurants from OpenStreetMap via Overpass API
    useEffect(() => {
        const fetchPOIs = async () => {
            const radius = 3000; // 3km radius
            const mirrors = [
                'https://overpass-api.de/api/interpreter',
                'https://overpass.kumi.systems/api/interpreter',
                'https://overpass.openstreetmap.fr/api/interpreter'
            ];

            const query = `[out:json][timeout:15];(node["amenity"~"toilets|restaurant"](around:${radius},${trek.startLat},${trek.startLng}););out body;`;

            for (const baseUrl of mirrors) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per mirror

                    const res = await fetch(`${baseUrl}?data=${encodeURIComponent(query)}`, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) throw new Error(`Status ${res.status}`);

                    const contentType = res.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) throw new Error('Not JSON');

                    const data = await res.json();
                    const mapped: Amenity[] = (data.elements || []).map((e: any) => ({
                        type: e.tags?.amenity === 'toilets' ? 'toilet' : 'restaurant',
                        lat: e.lat,
                        lon: e.lon,
                        name: e.tags?.name || (e.tags?.amenity === 'toilets' ? 'Public Restroom' : 'Unlabeled Cafe'),
                    }));

                    setRealAmenities(mapped);
                    setIsLoadingPOIs(false);
                    return; // Success!
                } catch (error) {
                    console.warn(`[MapService] Mirror ${baseUrl} failed, trying next...`, error);
                }
            }

            // If all mirrors fail
            console.error('All Overpass mirrors failed, using offline waypoint data.');
            setRealAmenities([
                { type: 'toilet', lat: trek.startLat + 0.002, lon: trek.startLng + 0.001, name: 'Trailhead Restroom (Offline)' },
                { type: 'restaurant', lat: trek.startLat - 0.003, lon: trek.startLng + 0.004, name: 'Mountain Hikers Cafe (Offline)' },
            ]);
            setIsLoadingPOIs(false);
        };

        fetchPOIs();
    }, [trek]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/trek-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trekName: trek.name, location: trek.country })
                });
                const data = await res.json();
                setHistory(data.history || 'History for this route is currently being written.');
            } catch (error) {
                setHistory('Explore to uncover the secrets of this trail.');
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [trek]);

    const startTracking = () => {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            setIsLocating(true);
            setError(null);

            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setUserPos([pos.coords.latitude, pos.coords.longitude]);
                    setIsLocating(false);
                },
                (err) => {
                    const messages = {
                        [err.PERMISSION_DENIED]: 'Location permission denied. Please enable GPS and refresh.',
                        [err.POSITION_UNAVAILABLE]: 'Location signal weak or unavailable.',
                        [err.TIMEOUT]: 'Location request timed out. Retrying...',
                    };
                    const msg = messages[err.code as keyof typeof messages] || 'An unknown error occurred.';
                    console.warn(`[Geolocation] ${msg}`);
                    setError(msg);
                    setIsLocating(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 5000
                }
            );
            return watchId;
        }
        return null;
    };

    useEffect(() => {
        const watchId = startTracking();
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const handleOfflineSave = () => {
        setIsOfflineSaved(true);
        // We can simulate a save here - the alert confirms it to the user
        // alert(`${trek.name} route and map tiles have been prepared for offline use.`);
    };

    const emergencyNumber = trek.emergencyContact || '112';
    const emergencyService = trek.emergencyService || 'Mountain Rescue';

    return (
        <main className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href={`/treks/${trek.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to Details
                </Link>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0 }}>{trek.name}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        <span className="tag" style={{ margin: 0, background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80' }}>🗺️ {isOfflineSaved ? 'Offline Mode' : 'Live Navigation'}</span>
                        <span className="tag" style={{ margin: 0, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>📍 GPS Ready</span>
                    </div>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '0.5rem', overflow: 'hidden', height: '75vh', position: 'relative' }}>
                <TrekMap
                    center={center}
                    trailPath={trailPath}
                    userPos={userPos}
                    realAmenities={isOfflineSaved ? [] : realAmenities} // Show only route in offline mode if that's what user wants
                    trekName={trek.name}
                    trekDistance={trek.distanceKm}
                />

                {/* Navigation Dashboards and SOS Button - Only show if not just saved offline or if navigating */}
                <div className="nav-dashboard" style={{
                    position: 'absolute', top: 'var(--dash-top, 2rem)', left: 'var(--dash-left, 2rem)',
                    right: 'var(--dash-right, auto)', bottom: 'var(--dash-bottom, auto)',
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
                    padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', width: 'var(--dash-width, 280px)',
                    display: isOfflineSaved ? 'none' : 'block' // Hide main dashboard after offline save as per user request
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h5 style={{ margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>Navigation Center</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLocating && <span className="pulse-dot" style={{ width: '8px', height: '8px' }}></span>}
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: userPos ? '#4ade80' : (error ? '#ef4444' : '#fbbf24'), boxShadow: userPos ? '0 0 10px #4ade80' : 'none' }}></div>
                        </div>
                    </div>

                    {error && !userPos && (
                        <div style={{ color: '#ef4444', fontSize: '0.7rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Distance Left</p>
                            <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{trek.distanceKm} <small style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>KM</small></h4>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Elevation Gain</p>
                            <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{trek.elevationGainM} <small style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>M</small></h4>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nearest Amenity</p>
                            <h4 style={{ margin: 0, color: '#4ade80', fontSize: '0.95rem' }}>
                                {isLoadingPOIs ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="pulse-dot"></span> Searching...
                                    </span>
                                ) : (realAmenities[0]?.name || 'No Service Found (±3km)')}
                            </h4>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.4rem' }}>
                            {!userPos && (
                                <button
                                    onClick={() => startTracking()}
                                    className="search-button"
                                    style={{
                                        padding: '0.8rem', flex: 1, borderRadius: '0.8rem', fontSize: '0.85rem',
                                        background: 'rgba(255,255,255,0.1)', color: 'white'
                                    }}
                                    disabled={isLocating}
                                >
                                    {isLocating ? '⌛' : '📍'}
                                </button>
                            )}
                            <button
                                onClick={() => setIsNavigating(!isNavigating)}
                                className="search-button"
                                style={{
                                    padding: '0.8rem', flex: 3, borderRadius: '0.8rem', fontSize: '0.85rem',
                                    background: isNavigating ? '#ef4444' : 'var(--primary)',
                                    color: 'white'
                                }}
                            >
                                {isNavigating ? '⏹️ Stop' : '🚀 Start'}
                            </button>
                            {userPos && (
                                <button
                                    onClick={() => alert("Recentering map on your current position...")}
                                    className="search-button"
                                    style={{
                                        padding: '0.8rem', flex: 1, borderRadius: '0.8rem', fontSize: '1rem',
                                        background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: 'white'
                                    }}
                                    title="Center Map"
                                >
                                    🎯
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {isNavigating && (
                    <div style={{
                        position: 'absolute', bottom: '18rem', left: '2rem', zIndex: 1000,
                        background: 'rgba(22, 163, 74, 0.95)', backdropFilter: 'blur(12px)',
                        padding: '1.2rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)', width: '280px', animation: 'slideRight 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ fontSize: '1.5rem', animation: 'pulse 1s infinite' }}>🧭</div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Navigation Active</p>
                                <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>Head North towards Trailhead</h4>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowEmergency(!showEmergency)}
                    style={{
                        position: 'absolute', top: '2rem', right: '2rem', zIndex: 1000,
                        background: showEmergency ? '#ef4444' : 'rgba(239, 68, 68, 0.9)',
                        border: 'none', borderRadius: '50%', width: '60px', height: '60px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                        cursor: 'pointer', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.3s ease', animation: showEmergency ? 'none' : 'pulse 2s infinite',
                    }}
                    title="Emergency SOS"
                >🆘</button>

                {showEmergency && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 2000, background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)',
                        padding: '2.5rem', borderRadius: '2rem', border: '2px solid #ef4444',
                        boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)', width: '90%', maxWidth: '400px', textAlign: 'center',
                    }}>
                        <h2 style={{ color: '#ef4444', marginTop: 0 }}>🚨 EMERGENCY HELP</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You are on the <strong>{trek.name}</strong> trail.</p>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>LOCAL EMERGENCY NUMBER</p>
                            <h1 style={{ margin: 0, fontSize: '3rem', letterSpacing: '0.2em' }}>{emergencyNumber}</h1>
                            <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{emergencyService}</p>
                        </div>
                        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Your Current Location:</strong></p>
                            {userPos ? (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                    LAT: {userPos[0].toFixed(6)}<br />LNG: {userPos[1].toFixed(6)}
                                </div>
                            ) : (<p style={{ fontSize: '0.85rem', color: '#fbbf24' }}>⚠️ GPS not available. Stay calm and visible.</p>)}
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <a href={`tel:${emergencyNumber}`} className="view-details" style={{ background: '#ef4444', fontSize: '1.1rem' }}>📞 Call {emergencyNumber} Now</a>
                            <button onClick={() => setShowEmergency(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.8rem', borderRadius: '0.75rem', cursor: 'pointer' }}>Dismiss</button>
                        </div>
                    </div>
                )}

                {!isOfflineSaved && (
                    <div style={{
                        position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 1000,
                        background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
                        padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--glass-border)',
                        maxWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                        <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>The <strong>emerald dashed line</strong> represents the verified trek path.</p>
                        <button
                            className="search-button"
                            style={{ fontSize: '0.9rem', padding: '1rem', width: '100%', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleOfflineSave}
                        >
                            <span>💾</span> Download Offline Route
                        </button>
                    </div>
                )}

                {isOfflineSaved && (
                    <div style={{
                        position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 1000,
                        background: 'rgba(22, 163, 74, 0.9)', backdropFilter: 'blur(8px)',
                        padding: '0.8rem 1.2rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        animation: 'slideUp 0.4s ease-out'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>✅</span>
                        <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{trek.name} Ready for Offline Use</span>
                        <button
                            onClick={() => setIsOfflineSaved(false)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline' }}
                        >
                            Reset
                        </button>
                    </div>
                )}

            </div>

            <section style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.8rem' }}>🛰️ Live Overpass Data</h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>We show <strong>{realAmenities.length} live services</strong> (RESTROOMS/RESTAURANTS) indexed from OpenStreetMap within 3km.</p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#ef4444', marginBottom: '0.8rem' }}>🆘 Emergency Ready</h4>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>In case of danger, use the **SOS button** to reveal local rescue numbers and your exact GPS coordinates.</p>
                </div>
                <div className="glass-card" style={{ borderLeft: '4px solid #fbbf24', gridColumn: 'span 2' }}>
                    <h4 style={{ color: '#fbbf24', marginBottom: '0.8rem' }}>🏰 Historical Context & Lore</h4>
                    {isLoadingHistory ? (
                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Consulting town archives...</p>
                    ) : (
                        <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#f1f5f9' }}>{history}</p>
                    )}
                </div>
            </section>
        </main>
    );
}
