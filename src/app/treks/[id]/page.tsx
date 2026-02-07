// src/app/treks/[id]/page.tsx
import { fetchTrekById } from '../../../lib/firebase';
import { Trek } from '../../../lib/treks-data';
import { generateTrekDescription } from '../../../lib/huggingface';
import TrekDetailClient from './trek-detail-client';

interface Params {
    params: { id: string };
}

export default async function TrekDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const trek = await fetchTrekById(id);

    if (!trek) {
        return <div>Trek not found.</div>;
    }

    const initialDescription = await generateTrekDescription({
        ...(trek as Trek)
    });

    return <TrekDetailClient trek={trek as Trek} initialDescription={initialDescription} />;
}
