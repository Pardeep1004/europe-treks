
import { db } from '../src/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { discoverNewTreks } from '../src/lib/huggingface';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const regionsToScout = [
    "Hamburg, Germany",
    "Prague, Czech Republic", "Amsterdam, Netherlands", "Lisbon, Portugal",
    "Stockholm, Sweden", "Copenhagen, Denmark", "Athens, Greece",
    "Budapest, Hungary", "Warsaw, Poland", "Dublin, Ireland",
    "Reykjavik, Iceland", "Oslo, Norway", "Helsinki, Finland",
    "Tallinn, Estonia", "Riga, Latvia", "Vilnius, Lithuania",
    "Bratislava, Slovakia", "Ljubljana, Slovenia", "Innsbruck, Austria",
    "Geneva, Switzerland", "Milan, Italy", "Barcelona, Spain",
    "Munich, Germany", "Lyon, France", "Edinburgh, Scotland",
    "Krakow, Poland", "Salzburg, Austria", "Interlaken, Switzerland",
    "Bergen, Norway", "Chamonix, France", "Cortina d'Ampezzo, Italy",
    "Funchal, Madeira, Portugal", "Tenerife, Spain", "Zakopane, Poland",
    "Bled, Slovenia", "Garmisch-Partenkirchen, Germany", "Brașov, Romania",
    "Sofia, Bulgaria", "Dubrovnik, Croatia", "Split, Croatia",
    "Nice, France", "San Sebastian, Spain", "Bilbao, Spain",
    "Porto, Portugal", "Valletta, Malta", "Tbilisi, Georgia",
    "Yerevan, Armenia", "Lofoten Islands, Norway", "Isle of Skye, Scotland",
    "Snowdonia, Wales", "Lake District, England", "Peak District, England",
    "Connemara, Ireland", "Killarney, Ireland", "Vibrant Villages of Rhine, Germany",
    "Hamburg, Germany"
];

async function autoScout() {
    console.log('🚀 Starting GLOBAL MEGA-SCOUT for Europe...');
    console.log(`Targeting ${regionsToScout.length} regions for total coverage.`);

    const treksCol = collection(db, 'treks');

    for (const location of regionsToScout) {
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;

        while (attempts < maxAttempts && !success) {
            console.log(`\n🔎 Scouting [Attempt ${attempts + 1}]: ${location}...`);
            try {
                const newTrails = await discoverNewTreks(location);

                if (newTrails && newTrails.length > 0) {
                    let addedCount = 0;
                    for (const trail of newTrails) {
                        const q = query(treksCol, where("name", "==", trail.name));
                        const snapshot = await getDocs(q);

                        if (snapshot.empty) {
                            if (!trail.gpxUrl) trail.gpxUrl = "https://example.com/route.gpx";
                            await addDoc(treksCol, trail);
                            console.log(`   ✅ Added: ${trail.name} (${trail.durationHours}h, ${trail.difficultyBase})`);
                            addedCount++;
                        } else {
                            console.log(`   ⏩ Skipped (Duplicate): ${trail.name}`);
                        }
                    }
                    console.log(`✨ Region Complete: Added ${addedCount} diversified trails.`);
                    success = true;
                }
            } catch (error: any) {
                console.error(`   ❌ Attempt failed for ${location}:`, error.message);
                attempts++;
            }
        }

        if (!success) console.warn(`   ⚠️ Final Failure: Could not scout ${location} after ${maxAttempts} tries.`);

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🏁 Global AI Auto-Scout Complete! Europe has been populated.');
    process.exit(0);
}

autoScout().catch(err => {
    console.error(err);
    process.exit(1);
});
