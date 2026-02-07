// src/lib/recommender.ts
import { Trek } from './treks-data';

export function getSuitabilityLabel(trek: Trek): string {
    const ascentPerKm = trek.elevationGainM / Math.max(trek.distanceKm, 1);

    let advice = 'Excellent choice for most hikers.';
    if (trek.difficultyBase === 'hard') advice = 'Requires good physical condition.';
    if (ascentPerKm > 100) advice = 'Be prepared for steep ascents.';
    if (trek.durationHours > 6) advice = 'Prepare for a full day out.';

    return `${trek.difficultyBase.toUpperCase()} · ${advice}`;
}
