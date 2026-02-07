
import { db } from '../src/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const hamburgTreks = [
    // Easy Hikes (from Komoot)
    {
        name: "Wulmstorfer Heath – Fischbeker Heath loop",
        country: "Germany",
        region: "Hamburg",
        city: "Fischbek",
        distanceKm: 6.39,
        elevationGainM: 60,
        durationHours: 1.7,
        difficultyBase: "easy",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10],
        terrainType: "Heathland",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.4682,
        startLng: 9.8512,
        summary: "A gentle loop through the beautiful Fischbeker Heide, great for any fitness level.",
        gpxUrl: "https://example.com/fischbek-easy.gpx"
    },
    {
        name: "Rose Garden – Planten un Blomen loop",
        country: "Germany",
        region: "Hamburg",
        city: "Hamburg",
        distanceKm: 7.52,
        elevationGainM: 40,
        durationHours: 2.0,
        difficultyBase: "easy",
        bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        terrainType: "Urban Park",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.5571,
        startLng: 9.9831,
        summary: "A relaxing stroll through Hamburg's green heart, passing through beautiful botanical gardens.",
        gpxUrl: "https://example.com/planten.gpx"
    },
    {
        name: "Öjendorfer Lake loop",
        country: "Germany",
        region: "Hamburg",
        city: "Billstedt",
        distanceKm: 4.16,
        elevationGainM: 20,
        durationHours: 1.1,
        difficultyBase: "easy",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10],
        terrainType: "Lakeside",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.5391,
        startLng: 10.1412,
        summary: "An easy walk around the Öjendorfer See, perfect for a quick escape into nature.",
        gpxUrl: "https://example.com/oejendorf.gpx"
    },
    // Moderate Hikes (from Search Results)
    {
        name: "Fischbeker Heide Moderate Loop",
        country: "Germany",
        region: "Hamburg",
        city: "Fischbek",
        distanceKm: 14.7,
        elevationGainM: 180,
        durationHours: 4.0,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10],
        terrainType: "Heathland / Forest",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.4721,
        startLng: 9.8542,
        summary: "A more extensive tour of the heathland, including a visit to Hamburg's highest point, the Hasselbrück.",
        gpxUrl: "https://example.com/fischbek-mod.gpx"
    },
    {
        name: "Blankenese to Schulau Ship Welcome",
        country: "Germany",
        region: "Hamburg",
        city: "Blankenese",
        distanceKm: 12.6,
        elevationGainM: 149,
        durationHours: 4.0,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        terrainType: "Stairways / Riverside",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.5591,
        startLng: 9.8142,
        summary: "Experience the famous Treppenviertel (stair district) and walk along the Elbe to the ship welcome point.",
        gpxUrl: "https://example.com/blankenese.gpx"
    },
    {
        name: "Harburg Hills Three Peak Tour",
        country: "Germany",
        region: "Hamburg",
        city: "Harburg",
        distanceKm: 9.6,
        elevationGainM: 128,
        durationHours: 2.5,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        terrainType: "Hilly Forest",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.4471,
        startLng: 9.9442,
        summary: "A hilly forest hike in the south of Hamburg, visiting three local summits.",
        gpxUrl: "https://example.com/harburg-hills.gpx"
    },
    // Hard Hike (from Search Results)
    {
        name: "Heidschnuckenweg Stage 1",
        country: "Germany",
        region: "Hamburg",
        city: "Fischbek",
        distanceKm: 26.4,
        elevationGainM: 350,
        durationHours: 6.6,
        difficultyBase: "hard",
        bestMonths: [5, 6, 7, 8, 9],
        terrainType: "Hilly Heath / Long Distance",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 53.4682,
        startLng: 9.8512,
        summary: "The challenging first stage of the famous Heidschnuckenweg, traversing the hilly heath landscape of Hamburg's south.",
        gpxUrl: "https://example.com/heidschnucken-1.gpx"
    }
];

async function seedHamburg() {
    console.log('🌱 Seeding specific Hamburg trails based on Komoot and AllTrails...');
    const treksCol = collection(db, 'treks');

    for (const trek of hamburgTreks) {
        // Double check by name
        const q = query(treksCol, where("name", "==", trek.name));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await addDoc(treksCol, trek);
            console.log(`   ✅ Added: ${trek.name} (${trek.difficultyBase})`);
        } else {
            console.log(`   ⏩ Skipped (Duplicate): ${trek.name}`);
        }
    }
    console.log('✨ Hamburg seeding complete!');
    process.exit(0);
}

seedHamburg().catch(err => {
    console.error(err);
    process.exit(1);
});
