'use client';

import { useAppState } from '@/state/AppState';
import { useEffect } from 'react';

export default function ThemeClient() {
    const { isDarkroomMode, accentColor } = useAppState();

    useEffect(() => {
        if (isDarkroomMode) {
            document.body.setAttribute('data-darkroom-mode', 'true');
        } else {
            document.body.removeAttribute('data-darkroom-mode');
        }
    }, [isDarkroomMode]);

    useEffect(() => {
        if (accentColor) {
            document.documentElement.style.setProperty('--theme-color', accentColor);
        } else {
            document.documentElement.style.removeProperty('--theme-color');
        }
    }, [accentColor]);

    return null;
}
