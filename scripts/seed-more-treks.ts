
import { db } from '../src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const additionalTreks = [
    {
        name: "Berlin Tiergarten Loop",
        country: "Germany",
        region: "Berlin",
        city: "Berlin",
        distanceKm: 5.2,
        elevationGainM: 20,
        durationHours: 1.5,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Park / Paved",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 52.5145,
        startLng: 13.3501,
        summary: "A gentle urban stroll through Berlin's largest park, passing the Victory Column.",
        gpxUrl: "https://example.com/tiergarten.gpx"
    },
    {
        name: "Grunewald Tower Climb",
        country: "Germany",
        region: "Berlin",
        city: "Berlin",
        distanceKm: 8.5,
        elevationGainM: 120,
        durationHours: 2.5,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        terrainType: "Forest Trails",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 52.4801,
        startLng: 13.2201,
        summary: "A moderate forest hike leading to the Grunewald Tower with views over the Havel river.",
        gpxUrl: "https://example.com/grunewald.gpx"
    },
    {
        name: "Saxon Switzerland Quick Clip",
        country: "Germany",
        region: "Saxony",
        city: "Rathen",
        distanceKm: 4.0,
        elevationGainM: 250,
        durationHours: 2.0,
        difficultyBase: "moderate",
        bestMonths: [4, 5, 6, 7, 8, 9, 10],
        terrainType: "Rocky / Steps",
        hasCastle: true,
        hasViewpoints: true,
        startLat: 50.9578,
        startLng: 14.0712,
        summary: "A short but steep climb to the Bastei Bridge, offering world-class sandstone views.",
        gpxUrl: "https://example.com/bastei.gpx"
    },
    {
        name: "Koblenz Rhine Promenade",
        country: "Germany",
        region: "Rhineland-Palatinate",
        city: "Koblenz",
        distanceKm: 6.0,
        elevationGainM: 10,
        durationHours: 1.5,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Riverside Path",
        hasCastle: true,
        hasViewpoints: true,
        startLat: 50.3644,
        startLng: 7.6061,
        summary: "An easy walk along the Rhine, ending at the Deutsches Eck where two rivers meet.",
        gpxUrl: "https://example.com/koblenz.gpx"
    },
    {
        name: "Kaiserslautern Humberg Tower",
        country: "Germany",
        region: "Rhineland-Palatinate",
        city: "Kaiserslautern",
        distanceKm: 4.5,
        elevationGainM: 180,
        durationHours: 1.5,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10],
        terrainType: "Forest Path",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 49.4262,
        startLng: 7.7663,
        summary: "A short hike through the Palatinate Forest to a historic observation tower.",
        gpxUrl: "https://example.com/humberg.gpx"
    }
];

async function seed() {
    console.log('Seeding additional short/easy treks...');
    const treksCol = collection(db, 'treks');
    for (const trek of additionalTreks) {
        await addDoc(treksCol, trek);
        console.log(`Added: ${trek.name}`);
    }
    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
