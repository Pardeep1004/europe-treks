
import { db } from '../src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const shortHiddenGems = [
    {
        name: "Remstecken Wildpark Loop",
        country: "Germany",
        region: "Rhineland-Palatinate",
        city: "Koblenz",
        distanceKm: 3.5,
        elevationGainM: 60,
        durationHours: 1.0,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Forest Path",
        hasCastle: false,
        hasViewpoints: false,
        startLat: 50.3061,
        startLng: 7.5582,
        summary: "A beloved local favorite in Koblenz, winding through a wildlife park with deer and wild boar.",
        gpxUrl: "https://example.com/remstecken.gpx"
    },
    {
        name: "Hampstead Heath Parliament Hill",
        country: "United Kingdom",
        region: "Greater London",
        city: "London",
        distanceKm: 3.0,
        elevationGainM: 40,
        durationHours: 1.0,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Grassy Park",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 51.5601,
        startLng: -0.1501,
        summary: "Short climb to one of the best free panoramas of the London skyline.",
        gpxUrl: "https://example.com/hampstead.gpx"
    },
    {
        name: "Villa Borghese Heart Walk",
        country: "Italy",
        region: "Lazio",
        city: "Rome",
        distanceKm: 4.0,
        elevationGainM: 20,
        durationHours: 1.2,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Paved / Garden",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 41.9131,
        startLng: 12.4862,
        summary: "A stroll through Rome's most elegant park, ending at the Pincio terrace overlooking Piazza del Popolo.",
        gpxUrl: "https://example.com/borghese.gpx"
    },
    {
        name: "Parc des Buttes-Chaumont Trail",
        country: "France",
        region: "Île-de-France",
        city: "Paris",
        distanceKm: 2.5,
        elevationGainM: 50,
        durationHours: 0.8,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Hilly Park Path",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 48.8801,
        startLng: 2.3831,
        summary: "A short, steep, and scenic loop in an old quarry featuring a lake, waterfalls, and a suspension bridge.",
        gpxUrl: "https://example.com/paris-park.gpx"
    },
    {
        name: "Kahlenberg Forest Escape",
        country: "Austria",
        region: "Vienna",
        city: "Vienna",
        distanceKm: 5.5,
        elevationGainM: 150,
        durationHours: 1.5,
        difficultyBase: "easy",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        terrainType: "Forest Path",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 48.2761,
        startLng: 16.3351,
        summary: "A brisk walk through the Vienna Woods to a summit overlooking the Danube and city vineyards.",
        gpxUrl: "https://example.com/vienna-wood.gpx"
    }
];

async function seed() {
    console.log('Seeding Hidden Gems & Local Favorites...');
    const treksCol = collection(db, 'treks');
    for (const trek of shortHiddenGems) {
        await addDoc(treksCol, trek);
        console.log(`Added: ${trek.name} (${trek.city})`);
    }
    console.log('Short Trail expansion complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
