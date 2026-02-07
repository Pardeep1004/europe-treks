// src/app/home-client.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trek } from '../lib/treks-data';
import { getSuitabilityLabel } from '../lib/recommender';
import { TrekCard } from '../components/TrekCard';
import { FilterPanel } from '../components/FilterPanel';

interface Props {
    treks: Trek[];
}

// Utility for Haversine distance in KM
function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon1 - lon2) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function HomeClient({ treks }: Props) {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [durationMax, setDurationMax] = useState<number | undefined>();
    const [minElevation, setMinElevation] = useState<number | undefined>();
    const [routeType, setRouteType] = useState<string>('');
    const [minDistance, setMinDistance] = useState<number | undefined>();
    const [maxDistance, setMaxDistance] = useState<number | undefined>();
    const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);

    // New states for async search and fallback logic
    const [displayResults, setDisplayResults] = useState<Trek[]>([]);
    const [isFallback, setIsFallback] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isOutOfEurope, setIsOutOfEurope] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isDiscovering, setIsDiscovering] = useState(false);

    // Filter helpers
    const [showOnlyCastles, setShowOnlyCastles] = useState(false);
    const [showOnlyViews, setShowOnlyViews] = useState(false);

    const applyFilters = (t: Trek) => {
        if (difficulty && t.difficultyBase !== difficulty) return false;
        if (durationMax && t.durationHours > durationMax) return false;
        if (minElevation && t.elevationGainM < minElevation) return false;
        if (routeType && t.routeType !== routeType) return false;
        if (showOnlyCastles && !t.hasCastle) return false;
        if (showOnlyViews && !t.hasViewpoints) return false;

        if (minDistance !== undefined && t.distanceKm < minDistance) return false;
        if (maxDistance !== undefined && t.distanceKm > maxDistance) return false;

        return true;
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lon: longitude });

            // Reverse geocode to show city name
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await res.json();
                if (data && data.address) {
                    const place = data.address.city || data.address.town || data.address.village || data.address.state || "My Location";
                    setLocation(place);
                }
            } catch (e) {
                setLocation("My Location");
            }

            // Trigger search with coords
            handleSearch(latitude, longitude);
        }, (error) => {
            console.error(error);
            setIsSearching(false);
            alert("Could not get your location. Please enter it manually.");
        });
    };

    // Automatically trigger search when landmark filters change
    useEffect(() => {
        if (showOnlyCastles || showOnlyViews || difficulty === 'easy') {
            handleSearch();
        }
    }, [showOnlyCastles, showOnlyViews, difficulty]);

    const handleSearch = async (overrideLat?: number, overrideLon?: number) => {
        if (!location && !difficulty && !durationMax && !minElevation && !routeType && !showOnlyCastles && !showOnlyViews && minDistance === undefined && maxDistance === undefined && !overrideLat) {
            setHasSearched(false);
            setDisplayResults([]);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setIsFallback(false);
        setIsOutOfEurope(false);

        // 1. Try Match
        let results = treks.filter(t => {
            if (applyFilters(t)) {
                if (overrideLat && overrideLon) {
                    const dist = getDistanceKM(overrideLat, overrideLon, t.startLat, t.startLng);
                    return dist <= 50; // Strict 50km for live location
                }
                if (location) {
                    const search = location.toLowerCase();
                    const matchesCountry = t.country.toLowerCase().includes(search);
                    const matchesCity = t.city?.toLowerCase().includes(search);
                    const matchesRegion = t.region?.toLowerCase().includes(search);
                    return matchesCountry || matchesCity || matchesRegion;
                }
                return true;
            }
            return false;
        });

        // 2. If no results, try with wider distance tolerance (if trekDistance was set)
        // This block is removed as minDistance/maxDistance handle distance filtering
        // if (results.length === 0 && trekDistance !== undefined) {
        //     results = treks.filter(t => {
        //         if (applyFilters(t, 10)) { // Fuzzy: within 10km
        //             if (overrideLat && overrideLon) {
        //                 const dist = getDistanceKM(overrideLat, overrideLon, t.startLat, t.startLng);
        //                 return dist <= 50; // Strict 50km for live location
        //             }
        //             if (location) {
        //                 const search = location.toLowerCase();
        //                 return t.country.toLowerCase().includes(search) || t.city?.toLowerCase().includes(search);
        //             }
        //             return true;
        //         }
        //         return false;
        //     });
        // }

        if (results.length > 0) {
            if (overrideLat && overrideLon) {
                results.sort((a, b) => {
                    return getDistanceKM(overrideLat, overrideLon, a.startLat, a.startLng) -
                        getDistanceKM(overrideLat, overrideLon, b.startLat, b.startLng);
                });
            }
            setDisplayResults(results);
            setIsSearching(false);
            return;
        }

        // 3. Geocoding Fallback (only if location text exists and we don't have overrides)
        if (location && !overrideLat) {
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
                if (!geoRes.ok) throw new Error('Geocoding service unavailable');

                const contentType = geoRes.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Geocoding service did not return JSON');
                }

                const geoData = await geoRes.json();

                if (geoData && geoData[0]) {
                    // Europe Restriction Check
                    const displayName = geoData[0].display_name || '';
                    const europeanCountries = [
                        'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
                        'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia',
                        'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia',
                        'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands',
                        'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia',
                        'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Vatican City'
                    ];

                    const isEurope = europeanCountries.some(country => displayName.includes(country));

                    if (!isEurope) {
                        setIsOutOfEurope(true);
                        setIsSearching(false);
                        return;
                    }

                    const searchLat = parseFloat(geoData[0].lat);
                    const searchLon = parseFloat(geoData[0].lon);

                    const nearby = treks.filter(t => {
                        if (!applyFilters(t)) return false;
                        const dist = getDistanceKM(searchLat, searchLon, t.startLat, t.startLng);
                        return dist <= 50; // Limit to 50km
                    }).sort((a, b) => {
                        const distA = getDistanceKM(searchLat, searchLon, a.startLat, a.startLng);
                        const distB = getDistanceKM(searchLat, searchLon, b.startLat, b.startLng);
                        return distA - distB;
                    }).slice(0, 12);

                    if (nearby.length > 0) {
                        setDisplayResults(nearby);
                        setIsFallback(true);
                        setIsSearching(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Geocoding failed:", e);
            }
        }

        setDisplayResults([]);
        setIsSearching(false);
    };

    const handleAIDiscover = async () => {
        if (!location) return;
        setIsDiscovering(true);
        try {
            const res = await fetch('/api/ai-discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            });
            const data = await res.json();

            if (data.trails && data.trails.length > 0) {
                // Apply active filters to newly discovered trails
                const filteredNew = data.trails.filter(applyFilters);

                setDisplayResults(prev => {
                    const existingNames = new Set(prev.map(t => t.name.toLowerCase()));
                    const trulyNew = filteredNew.filter((t: Trek) => !existingNames.has(t.name.toLowerCase()));
                    return [...trulyNew, ...prev];
                });

                setIsFallback(false);
                setHasSearched(true);
            }

            alert(data.message || 'AI exploration complete!');

            // Sync with server data in background without resetting state
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('AI Agent is currently resting. Try again in a moment.');
        } finally {
            setIsDiscovering(false);
        }
    };

    return (
        <main className="container">
            <header className="hero" style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
                {/* Dark overlay for text readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.65) 0%, rgba(2, 6, 23, 0.85) 100%)',
                    zIndex: 0
                }} />

                {/* Atmospheric glow */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '80%',
                    background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                    zIndex: 1,
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite'
                }} />

                {/* Floating particles effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.4), transparent),
                        radial-gradient(2px 2px at 60% 70%, rgba(34, 197, 94, 0.4), transparent),
                        radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(1px 1px at 80% 10%, rgba(14, 165, 233, 0.4), transparent),
                        radial-gradient(2px 2px at 90% 60%, rgba(255, 255, 255, 0.3), transparent),
                        radial-gradient(1px 1px at 33% 80%, rgba(34, 197, 94, 0.3), transparent)
                    `,
                    backgroundSize: '200% 200%',
                    animation: 'floatParticles 20s ease-in-out infinite',
                    zIndex: 1,
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1>Adventure Awaits <br />Across Europe</h1>
                    <p style={{ color: 'rgba(248, 250, 252, 0.95)', fontSize: '1.25rem', lineHeight: '1.6', fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        Discover thousands of hand-curated trails. From the rugged peaks of the Alps to the serene coasts of Portugal.
                    </p>
                </div>
            </header>

            <section className="glass-card filters-wrapper">
                <FilterPanel
                    location={location}
                    onLocationChange={setLocation}
                    difficulty={difficulty}
                    onDifficultyChange={setDifficulty}
                    durationMax={durationMax}
                    onDurationMaxChange={setDurationMax}
                    minElevation={minElevation}
                    onMinElevationChange={setMinElevation}
                    routeType={routeType}
                    onRouteTypeChange={setRouteType}
                    minDistance={minDistance}
                    onMinDistanceChange={setMinDistance}
                    maxDistance={maxDistance}
                    onMaxDistanceChange={setMaxDistance}
                    onUseMyLocation={handleUseMyLocation}
                    onSearch={() => handleSearch()}
                />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1.5rem',
                    width: '100%'
                }}>
                    <button
                        className={`tag ${difficulty === 'easy' ? 'active' : ''}`}
                        onClick={() => setDifficulty(difficulty === 'easy' ? '' : 'easy')}
                        style={{ width: '100%' }}
                    >
                        🏠 Family Friendly
                    </button>
                    <button
                        className={`tag ${showOnlyCastles ? 'active' : ''}`}
                        onClick={() => setShowOnlyCastles(!showOnlyCastles)}
                        style={{ width: '100%' }}
                    >
                        🏰 Historic Castles
                    </button>
                    <button
                        className={`tag ${showOnlyViews ? 'active' : ''}`}
                        onClick={() => setShowOnlyViews(!showOnlyViews)}
                        style={{ width: '100%' }}
                    >
                        📸 Scenic Views
                    </button>
                </div>
            </section>

            <section className="trek-list">
                {!hasSearched && (
                    <div className="search-placeholder" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥾</div>
                        <h2>Ready to start your adventure?</h2>
                        <p>Adjust the filters above and click Search to discover hidden gems.</p>
                    </div>
                )}

                {isSearching && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                        <div className="tag" style={{ background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}>
                            🔍 Calculating nearest trails...
                        </div>
                    </div>
                )}

                {hasSearched && !isSearching && isOutOfEurope && (
                    <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌍</div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Destination Not Yet Supported</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            We noticed you're looking for treks in <strong>{location}</strong>.
                            Currently, our expert scouts and AI agents are focused EXCLUSIVELY on <strong>European</strong> destinations to ensure the highest data quality and reliability.
                        </p>
                        <div className="glass-card" style={{ display: 'inline-block', padding: '1.5rem 2.5rem', border: '1px solid var(--primary)' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>
                                Suggestions: Try "Swiss Alps", "Scottish Highlands", or "Dolomites, Italy"
                            </p>
                        </div>
                    </div>
                )}

                {hasSearched && !isSearching && !isOutOfEurope && isFallback && displayResults.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', marginBottom: '2rem' }}>
                        <div className="glass-card" style={{
                            borderLeft: '4px solid #3b82f6',
                            background: 'rgba(59, 130, 246, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#3b82f6' }}>📍 Nearest Trails Found</h3>
                                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)' }}>
                                    No exact treks in "{location}", but here are the closest results within 50km:
                                </p>
                            </div>
                            <button
                                onClick={handleAIDiscover}
                                disabled={isDiscovering}
                                className="search-button"
                                style={{
                                    background: 'linear-gradient(to right, #22d3ee, #4ade80)',
                                    opacity: isDiscovering ? 0.7 : 1
                                }}
                            >
                                {isDiscovering ? '⚙️ AI Exploring...' : '🤖 Agent: Find More'}
                            </button>
                        </div>
                    </div>
                )}

                {hasSearched && !isSearching && displayResults.length === 0 && (
                    <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <h2>No treks found within 50km</h2>
                        <p style={{ marginBottom: '2rem' }}>We couldn't find any treks near this location. Trigger our AI Agent to search for you?</p>
                        <button
                            onClick={handleAIDiscover}
                            disabled={isDiscovering}
                            className="search-button"
                            style={{
                                background: 'linear-gradient(to right, #22d3ee, #4ade80)',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isDiscovering ? '🔍 Agent is scouting routes...' : '🧠 Ask AI Agent to Discover Trails'}
                        </button>
                    </div>
                )}

                {hasSearched && !isSearching && displayResults.map((trek, index) => (
                    <div key={trek.id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <TrekCard
                            trek={trek}
                            suitabilityLabel={getSuitabilityLabel(trek)}
                        />
                    </div>
                ))}
            </section>
        </main>
    );
}
