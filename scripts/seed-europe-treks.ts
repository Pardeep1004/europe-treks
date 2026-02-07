
import { db } from '../src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const europeTreks = [
    {
        name: "Cinque Terre Sentiero Azzurro",
        country: "Italy",
        region: "Liguria",
        city: "Vernazza",
        distanceKm: 12.0,
        elevationGainM: 500,
        durationHours: 5.0,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 9, 10],
        terrainType: "Coastal / Stone Path",
        hasCastle: true,
        hasViewpoints: true,
        startLat: 44.1348,
        startLng: 9.6828,
        summary: "The famous Blue Path connecting five colorful villages along the Italian Riviera.",
        gpxUrl: "https://example.com/cinqueterre.gpx"
    },
    {
        name: "Arthur's Seat Peak",
        country: "United Kingdom",
        region: "Scotland",
        city: "Edinburgh",
        distanceKm: 4.5,
        elevationGainM: 251,
        durationHours: 2.0,
        difficultyBase: "easy",
        bestMonths: [4, 5, 6, 7, 8, 9, 10],
        terrainType: "Grassy / Rocky",
        hasCastle: true,
        hasViewpoints: true,
        startLat: 55.9441,
        startLng: -3.1618,
        summary: "A short, sharp climb to an ancient volcano offering 360-degree views of Edinburgh and the sea.",
        gpxUrl: "https://example.com/edinburgh.gpx"
    },
    {
        name: "Montserrat Monastery Path",
        country: "Spain",
        region: "Catalonia",
        city: "Monistrol de Montserrat",
        distanceKm: 7.5,
        elevationGainM: 350,
        durationHours: 3.0,
        difficultyBase: "moderate",
        bestMonths: [3, 4, 5, 6, 9, 10, 11],
        terrainType: "Rocky / Paved",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 41.5933,
        startLng: 1.8361,
        summary: "Hike through the Sawtooth mountains to the legendary Black Madonna monastery.",
        gpxUrl: "https://example.com/montserrat.gpx"
    },
    {
        name: "Zermatt Riffelalp Stroll",
        country: "Switzerland",
        region: "Valais",
        city: "Zermatt",
        distanceKm: 5.0,
        elevationGainM: 80,
        durationHours: 1.5,
        difficultyBase: "easy",
        bestMonths: [6, 7, 8, 9, 10],
        terrainType: "Alpine Meadows",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 45.9982,
        startLng: 7.7491,
        summary: "An easy alpine walk with constant, jaw-dropping views of the Matterhorn.",
        gpxUrl: "https://example.com/zermatt.gpx"
    },
    {
        name: "Plitvice Lakes Upper Trail",
        country: "Croatia",
        region: "Lika",
        city: "Plitvička Jezera",
        distanceKm: 9.0,
        elevationGainM: 100,
        durationHours: 4.0,
        difficultyBase: "easy",
        bestMonths: [4, 5, 6, 7, 8, 9, 10],
        terrainType: "Wooden Boardwalks",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 44.8805,
        startLng: 15.6195,
        summary: "Walk across waterfalls and turquoise lakes on perfectly maintained wooden paths.",
        gpxUrl: "https://example.com/plitvice.gpx"
    },
    {
        name: "Pinnacles of Glencoe",
        country: "United Kingdom",
        region: "Scotland",
        city: "Glencoe",
        distanceKm: 15.0,
        elevationGainM: 1200,
        durationHours: 8.0,
        difficultyBase: "hard",
        bestMonths: [5, 6, 7, 8, 9],
        terrainType: "Steep / Scrambling",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 56.6815,
        startLng: -5.0248,
        summary: "A challenging world-class trek through the dramatic Aonach Eagach ridge.",
        gpxUrl: "https://example.com/glencoe.gpx"
    },
    {
        name: "Mont Saint-Michel Bay Walk",
        country: "France",
        region: "Normandy",
        city: "Mont Saint-Michel",
        distanceKm: 7.0,
        elevationGainM: 10,
        durationHours: 2.0,
        difficultyBase: "easy",
        bestMonths: [5, 6, 7, 8, 9, 10],
        terrainType: "Sand / Mud",
        hasCastle: true,
        hasViewpoints: true,
        startLat: 48.6361,
        startLng: -1.5115,
        summary: "A unique crossing of the tidal flats towards the medieval island fortress.",
        gpxUrl: "https://example.com/normandy.gpx"
    },
    {
        name: "Dolomites Seceda Ridgeline",
        country: "Italy",
        region: "South Tyrol",
        city: "Ortisei",
        distanceKm: 10.5,
        elevationGainM: 450,
        durationHours: 4.5,
        difficultyBase: "moderate",
        bestMonths: [6, 7, 8, 9, 10],
        terrainType: "Mountain Trails",
        hasCastle: false,
        hasViewpoints: true,
        startLat: 46.5982,
        startLng: 11.7241,
        summary: "Experience the iconic jagged peaks of the Odle mountains on this moderate loop.",
        gpxUrl: "https://example.com/dolomites.gpx"
    }
];

async function seed() {
    console.log('Seeding diverse European treks...');
    const treksCol = collection(db, 'treks');
    for (const trek of europeTreks) {
        await addDoc(treksCol, trek);
        console.log(`Added: ${trek.name} (${trek.country})`);
    }
    console.log('European expansion complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
