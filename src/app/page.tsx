// src/app/page.tsx
export const dynamic = 'force-dynamic';
import { fetchAllTreks } from '../lib/firebase';
import { Trek } from '../lib/treks-data';
import HomeClient from './home-client';

export default async function HomePage() {
    const treksRaw = await fetchAllTreks();
    const treks = treksRaw as Trek[]; // simple cast, you can validate later

    return <HomeClient treks={treks} />;
}
