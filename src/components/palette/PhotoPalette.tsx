'use client';

import { toast } from 'sonner';
import { extractPaletteFromImageAction } from '@/photo/paletteActions';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx/lite';
import { useAppState } from '@/state/AppState';

export default function PhotoPalette({
    photoUrl,
}: {
    photoUrl: string;
}) {
    const [palette, setPalette] = useState<string[]>([]);
    const [mood, setMood] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleGenerateValues = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const { palette, mood } = await extractPaletteFromImageAction(photoUrl);
            if (palette && palette.length > 0) {
                setPalette(palette);
                setMood(mood);
            } else {
                setHasError(true);
                toast.error('Failed to extract palette');
            }
        } catch (e) {
            setHasError(true);
            toast.error('Error generating palette');
        } finally {
            setIsLoading(false);
        }
    };



    const copyToClipboard = (color: string) => {
        navigator.clipboard.writeText(color);
        toast.success(`Copied ${color} to clipboard`);
    };

    // Update global theme when palette changes
    const { setAccentColor } = useAppState();
    if (palette.length > 0 && setAccentColor) {
        // Set the most dominant color (first one) as accent
        // Use a timeout to avoid strict mode double-invoke issues during render
        setTimeout(() => setAccentColor(palette[0]), 0);
    }

    // Clear accent color on unmount
    useEffect(() => {
        return () => setAccentColor?.(undefined);
    }, [setAccentColor]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mood & Palette
                </h3>
                {!palette.length && !isLoading && (
                    <button
                        onClick={handleGenerateValues}
                        className="text-xs font-medium text-accent hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        GENERATE
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && palette.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                    {mood && (
                        <p className="text-sm italic text-accent opacity-80">
                            "{mood}"
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {palette.map((color, index) => (
                            <button
                                key={index}
                                onClick={() => copyToClipboard(color)}
                                className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:scale-110 transition-transform relative group"
                                style={{ backgroundColor: color }}
                                title={color}
                            >
                                <span className="sr-only">{color}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hasError && (
                <div className="text-xs text-red-500">
                    Could not generate palette. <button onClick={handleGenerateValues} className="underline">Try again</button>
                </div>
            )}
        </div>
    );
}
