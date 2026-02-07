// src/app/api/trek-history/route.ts
import { NextResponse } from 'next/server';
import { getTrekHistory } from '@/lib/huggingface';

export async function POST(req: Request) {
    try {
        const { trekName, location } = await req.json();
        if (!trekName) return NextResponse.json({ error: 'Missing trek name' }, { status: 400 });

        const history = await getTrekHistory(trekName, location || 'Europe');
        return NextResponse.json({ history });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
