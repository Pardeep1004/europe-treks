// src/app/map/[id]/page.tsx
import { fetchTrekById } from '../../../lib/firebase';
import { Trek } from '../../../lib/treks-data';
import MapClient from './map-client';

interface Params {
    params: { id: string };
}

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const trek = await fetchTrekById(id);
    if (!trek) {
        return <div>Trek not found.</div>;
    }

    return <MapClient trek={trek as Trek} />;
}
