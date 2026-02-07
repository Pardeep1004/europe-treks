'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Fix Leaflet marker icon issue in Next.js
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
};

// Custom Polyline component using Leaflet directly
function TrailPolyline({ positions, color }: { positions: [number, number][], color: string }) {
    const map = useMap();

    useEffect(() => {
        if (!positions || positions.length === 0) return;

        const polyline = L.polyline(positions, {
            color: color,
            weight: 6,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(map);

        return () => {
            map.removeLayer(polyline);
        };
    }, [map, positions, color]);

    return null;
}

interface Amenity {
    type: 'toilet' | 'restaurant';
    lat: number;
    lon: number;
    name: string;
}

interface Props {
    center: [number, number];
    trailPath: [number, number][];
    userPos: [number, number] | null;
    realAmenities: Amenity[];
    trekName: string;
    trekDistance: number;
}

export default function TrekMap({ center, trailPath, userPos, realAmenities, trekName, trekDistance }: Props) {
    useEffect(() => {
        fixLeafletIcons();
    }, []);

    return (
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* The Whole Trek Path */}
            <TrailPolyline positions={trailPath} color="#16a34a" />

            {/* Trailhead */}
            <Marker position={center}>
                <Popup>
                    <div style={{ padding: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>Trailhead: {trekName}</strong><br />
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Start your {trekDistance}km journey here.</p>
                    </div>
                </Popup>
            </Marker>

            {/* Real-time User Position */}
            {userPos && (
                <Marker position={userPos}>
                    <Popup><strong>You are here</strong><br />Tracking your progress live.</Popup>
                </Marker>
            )}

            {/* Real Toilets & Restaurants (from OSM) */}
            {realAmenities.map((a, i) => (
                <Marker key={i} position={[a.lat, a.lon]}>
                    <Popup>
                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
                                {a.type === 'toilet' ? '🚻' : '🍽️'}
                            </span>
                            <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem' }}>{a.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Waypoint Service</p>
                            <button
                                style={{
                                    marginTop: '0.8rem',
                                    fontSize: '0.75rem',
                                    padding: '0.4rem 0.8rem',
                                    width: '100%',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer'
                                }}
                                onClick={() => alert(`Navigating to ${a.name}...`)}
                            >
                                Navigate
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
