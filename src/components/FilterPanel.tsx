// src/components/FilterPanel.tsx
'use client';

interface Props {
    location: string;
    onLocationChange: (location: string) => void;
    difficulty: string;
    onDifficultyChange: (difficulty: string) => void;
    durationMax: number | undefined;
    onDurationMaxChange: (duration?: number) => void;
    minElevation: number | undefined;
    onMinElevationChange: (elev?: number) => void;
    routeType: string;
    onRouteTypeChange: (type: string) => void;
    minDistance: number | undefined;
    onMinDistanceChange: (km?: number) => void;
    maxDistance: number | undefined;
    onMaxDistanceChange: (km?: number) => void;
    onUseMyLocation: () => void;
    onSearch: () => void;
}

export function FilterPanel(props: Props) {
    return (
        <section className="filters">
            <label style={{ flex: '1.5', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span>Where to?</span>
                    <button
                        onClick={props.onUseMyLocation}
                        className="location-mini-button"
                        style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                        }}
                    >
                        <span>📍</span> Use My Location
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="e.g. Swiss Alps"
                    value={props.location}
                    onChange={e => props.onLocationChange(e.target.value)}
                />
            </label>

            <label>
                <span>Level</span>
                <select
                    value={props.difficulty}
                    onChange={e => props.onDifficultyChange(e.target.value)}
                >
                    <option value="">Any Difficulty</option>
                    <option value="easy">Easy (Casual)</option>
                    <option value="moderate">Moderate (Hiker)</option>
                    <option value="hard">Hard (Pro)</option>
                </select>
            </label>

            <label>
                <span>Max Time</span>
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        min={1}
                        placeholder="Hours"
                        style={{ width: '100%' }}
                        value={props.durationMax ?? ''}
                        onChange={e => {
                            const v = e.target.value;
                            props.onDurationMaxChange(v === '' ? undefined : Number(v));
                        }}
                    />
                </div>
            </label>

            <label style={{ minWidth: '220px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📏 Distance Range
                </span>
                <div className="range-input-group">
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.55rem',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            pointerEvents: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Min</span>
                        <input
                            type="number"
                            min={0}
                            placeholder="0"
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                padding: '0.7rem 0.5rem 0.7rem 2.8rem',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none',
                                fontWeight: 600
                            }}
                            value={props.minDistance ?? ''}
                            onChange={e => {
                                const v = e.target.value;
                                props.onMinDistanceChange(v === '' ? undefined : Number(v));
                            }}
                        />
                    </div>

                    <div style={{
                        width: '1px',
                        height: '18px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        margin: '0 2px'
                    }} />

                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.55rem',
                            color: 'var(--primary)',
                            fontWeight: 800,
                            pointerEvents: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>Max</span>
                        <input
                            type="number"
                            min={0}
                            placeholder="Any"
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                padding: '0.7rem 0.5rem 0.7rem 2.8rem',
                                color: '#fff',
                                fontSize: '0.9rem',
                                outline: 'none',
                                fontWeight: 600
                            }}
                            value={props.maxDistance ?? ''}
                            onChange={e => {
                                const v = e.target.value;
                                props.onMaxDistanceChange(v === '' ? undefined : Number(v));
                            }}
                        />
                    </div>
                    <span style={{
                        paddingRight: '12px',
                        fontSize: '0.65rem',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        letterSpacing: '0.05em'
                    }}>KM</span>
                </div>
            </label>

            <label>
                <span>Min Gain</span>
                <input
                    type="number"
                    min={0}
                    placeholder="Meters"
                    value={props.minElevation ?? ''}
                    onChange={e => {
                        const v = e.target.value;
                        props.onMinElevationChange(v === '' ? undefined : Number(v));
                    }}
                />
            </label>

            <label>
                <span>Route</span>
                <select
                    value={props.routeType}
                    onChange={e => props.onRouteTypeChange(e.target.value)}
                >
                    <option value="">Any Type</option>
                    <option value="Loop">Loop</option>
                    <option value="Out & Back">Out & Back</option>
                    <option value="Point-to-Point">Point</option>
                </select>
            </label>

            <button
                className="search-button"
                onClick={props.onSearch}
                style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1rem',
                    alignSelf: 'flex-end',
                    marginBottom: '2px'
                }}
            >
                Find Trails
            </button>
        </section>
    );
}
