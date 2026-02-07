// src/app/api/ai-discover/route.ts
import { NextResponse } from 'next/server';
import { discoverNewTreks } from '@/lib/huggingface';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const { location } = await req.json();
        if (!location) {
            return NextResponse.json({ error: 'Location required' }, { status: 400 });
        }

        console.log(`AI Agent searching for treks in: ${location}`);
        const newTreks = await discoverNewTreks(location);

        if (!newTreks || newTreks.length === 0) {
            return NextResponse.json({ message: 'AI could not find new treks at this moment.' });
        }

        const treksCol = collection(db, 'treks');
        const addedCount = [];

        for (const trekData of newTreks) {
            // Very basic check to avoid duplicates by name
            const q = query(treksCol, where("name", "==", trekData.name));
            const existing = await getDocs(q);

            if (existing.empty) {
                const docRef = await addDoc(treksCol, {
                    ...trekData,
                    gpxUrl: "https://example.com/ai-generated.gpx"
                });

                const finalTrek = {
                    ...trekData,
                    id: docRef.id,
                    gpxUrl: "https://example.com/ai-generated.gpx"
                };
                addedCount.push(finalTrek);
            }
        }

        return NextResponse.json({
            message: `AI Agent successfully discovered ${addedCount.length} new trails!`,
            trails: addedCount
        });

    } catch (error) {
        console.error('Discovery Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
