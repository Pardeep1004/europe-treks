// src/lib/treks-data.ts
export type Difficulty = 'easy' | 'moderate' | 'hard';
export type RouteType = 'Loop' | 'Out & Back' | 'Point-to-Point';

export interface Trek {
    id: string;
    name: string;
    country: string;
    region: string;
    city: string;
    distanceKm: number;
    elevationGainM: number;
    durationHours: number;
    difficultyBase: Difficulty;
    routeType: RouteType;
    bestMonths: number[];
    terrainType: string;
    hasCastle: boolean;
    hasViewpoints: boolean;
    gpxUrl: string;
    startLat: number;
    startLng: number;
    summary: string;
    emergencyContact?: string;
    emergencyService?: string;
}
