'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function extractPaletteFromImageAction(photoUrl: string) {
    try {
        const { object } = await generateObject({
            model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),

            schema: z.object({
                palette: z.array(z.string()).describe('Array of 5 hex color codes extracted from the image'),
                mood: z.string().describe('A formatted string describing the mood of the image'),
            }),
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this image and extract a color palette of 5 distinct hex color codes that represent its mood. Also describe the mood in a few words.' },
                        { type: 'image', image: photoUrl },
                    ],
                },
            ],
        });

        return { palette: object.palette, mood: object.mood };
    } catch (error) {
        console.error('Failed to extract palette:', error);
        return { palette: [], mood: 'Error extracting palette' };
    }
}
