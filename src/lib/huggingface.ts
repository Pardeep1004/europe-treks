// src/lib/huggingface.ts

export async function generateTrekDescription(input: {
    name: string;
    country: string;
    region: string;
    city?: string;
    distanceKm: number;
    elevationGainM: number;
    durationHours: number;
    difficultyBase: string;
    terrainType: string;
    hasCastle: boolean;
    hasViewpoints: boolean;
    bestMonths: number[];
    age?: number;
}) {
    const token = process.env.HF_API_TOKEN;
    if (!token) return 'Expert description currently unavailable.';

    const prompt = `You are a professional hiking guide and historian focusing EXCLUSIVELY on Europe. 
Write a comprehensive briefing for the following trek:
Trek: ${input.name} (${input.city || input.region}, ${input.country})
Stats: ${input.distanceKm}km, ${input.elevationGainM}m total elevation, ${input.terrainType} terrain.
Features: ${input.hasCastle ? 'Includes a visit to a historic castle/fort, ' : ''}${input.hasViewpoints ? 'Spectacular panoramic viewpoints.' : ''}

Include the following sections in your response (structure clearly):
1. **The Vibe**: A short, atmospheric description of the trail.
2. **Historical Context**: Why this trail matters and the history of ${input.hasCastle ? 'the castle/fort' : 'the region'}.
3. **Technical Challenge**: How steep the climbs are and the terrain difficulty.
4. **Pro Tip**: Best time of day/season and a key checkpoint or landmark to watch for.`;

    try {
        console.log(`AI Expert: Generating description for ${input.name}...`);
        const response = await fetch(
            'https://router.huggingface.co/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.1-8B-Instruct',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 800
                }),
            }
        );

        if (!response.ok) {
            console.error(`AI Model Error: HTTP ${response.status}`);
            return 'Guide is currently busy scouting routes.';
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('AI Model Error: Did not return JSON');
            return 'Guide is currently busy scouting routes.';
        }

        const data = await response.json();
        if (data.error) {
            console.error('AI Model Error:', data.error);
            return 'Guide is currently busy scouting routes.';
        }

        const text = data.choices?.[0]?.message?.content || '';
        console.log(`AI Expert Response: ${text.substring(0, 50)}...`);
        return text.trim() || 'A stunning route waiting to be explored.';
    } catch (e) {
        console.error('AI Expert Exception:', e);
        return 'The trail guide is resting. Try again soon!';
    }
}

export async function discoverNewTreks(location: string): Promise<any[]> {
    const token = process.env.HF_API_TOKEN;
    if (!token) return [];

    const prompt = `Act as a Professional European Trail Scout. Research and generate 5 REAL-WORLD hiking trails or nature walks in or near ${location}.
IMPORTANT: 
- Results MUST be located within Europe. If ${location} is outside Europe, return an empty array [].
- Provide a diverse mix: At least 2 "Short & Easy" trails, a mix of Moderate and Hard long-distance treks.
- Include urban park walks as well as mountain trails.

Return a JSON array ONLY. Do not include intro or outro text.
Schema: { "name": string, "country": string, "region": string, "city": string, "distanceKm": number, "elevationGainM": number, "durationHours": number, "difficultyBase": "easy"|"moderate"|"hard", "routeType": "Loop"|"Out & Back"|"Point-to-Point", "bestMonths": [number], "terrainType": string, "hasCastle": boolean, "hasViewpoints": boolean, "startLat": number, "startLng": number, "summary": string }`;

    try {
        console.log(`AI Agent: Scouting hikes in ${location}...`);
        const response = await fetch(
            'https://router.huggingface.co/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.1-8B-Instruct',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1500
                }),
            }
        );

        if (!response.ok) {
            console.error(`AI Discovery Error: HTTP ${response.status}`);
            return [];
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('AI Discovery Error: Did not return JSON');
            return [];
        }

        const data = await response.json();
        if (data.error) {
            console.error('AI Discovery Error:', data.error);
            return [];
        }

        const text = data.choices?.[0]?.message?.content || '';

        // Robust JSON extraction
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1) {
            let jsonStr = text.substring(start, (end !== -1 ? end + 1 : text.length));

            // Auto-closing brackets if truncated
            if (!jsonStr.endsWith(']')) {
                const lastBrace = jsonStr.lastIndexOf('}');
                if (lastBrace !== -1) {
                    jsonStr = jsonStr.substring(0, lastBrace + 1) + ']';
                }
            }

            // Basic cleaning for common LLM JSON errors
            jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

            try {
                const parsed = JSON.parse(jsonStr);
                console.log(`AI Agent: Found ${parsed.length} new trails!`);
                return parsed;
            } catch (err) {
                console.warn('AI Discovery: JSON repair failed, text was:', text);
                throw err;
            }
        }
        console.warn('AI Discovery: Could not find JSON array in response.');
    } catch (e) {
        console.error("AI Discovery Exception:", e);
    }
    return [];
}

export async function getTrekHistory(trekName: string, location: string): Promise<string> {
    const token = process.env.HF_API_TOKEN;
    if (!token) return "History currently being researched by our archivists.";

    const prompt = `Provide a very brief (2-3 sentences) historical background or local lore for a landmark or castle along the '${trekName}' trail in ${location}. If no specific history exists, invent a plausible piece of 'Local Legend'. Do not use markdown headers.`;

    try {
        const response = await fetch(
            'https://router.huggingface.co/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3.1-8B-Instruct',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 300
                }),
            }
        );

        if (!response.ok) return "Historical archives are currently closed.";

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "A place steeped in untold stories.";
    } catch (e) {
        console.error("History Fetch Error:", e);
        return "Lost to the sands of time.";
    }
}
