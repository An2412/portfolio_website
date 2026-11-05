import { useState, useEffect, useRef } from 'react';
import { scrollState } from '@/utils/scrollLock';
import { useLocation } from 'react-router-dom';

export function useActiveSection(sectionIds: readonly string[]) {
    const [activeSection, setActiveSection] = useState<string>('');
    const observers = useRef<Map<string, number>>(new Map());
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { pathname } = useLocation();

    // Sync active state immediately when URL changes (clicked from nav)
    useEffect(() => {
        const section = pathname === '/' ? 'home' : pathname.replace('/', '');
        if (sectionIds.includes(section)) {
            // Keep the nav highlight in sync with a direct/deep link.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveSection(section);
        }
    }, [pathname, sectionIds]);

    useEffect(() => {
        const currentObservers = observers.current;
        // Clean up old observers when dependency changes
        currentObservers.clear();

        const callback = (entries: IntersectionObserverEntry[]) => {
            // If we are scrolling programmatically (click nav), ignore observer updates
            if (scrollState.isProgrammaticScroll) return;

            entries.forEach((entry) => {
                if (entry.target.id) {
                    if (entry.isIntersecting) {
                        // Use visible height (intersectionRect.height) to determine the "most visible" section
                        // This fixes the issue where small sections (high ratio) override large sections (low ratio)
                        const visibleHeight = entry.intersectionRect.height;
                        currentObservers.set(entry.target.id, visibleHeight);
                    } else {
                        currentObservers.delete(entry.target.id);
                    }
                }
            });

            // Find the section with the highest visible height
            let maxHeight = 0;
            let bestCandidate = '';

            currentObservers.forEach((height, id) => {
                if (height > maxHeight) {
                    maxHeight = height;
                    bestCandidate = id;
                }
            });

            if (bestCandidate) {
                setActiveSection(bestCandidate);
            }
        };

        const observer = new IntersectionObserver(callback, {
            rootMargin: '-80px 0px -70% 0px', // check roughly the whole viewport with some buffer
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] // Multiple thresholds for granular updates
        });

        // Below-the-fold sections are lazy-loaded, so they may not exist yet
        // when this effect runs. Watch the DOM and observe them as they mount.
        const observed = new Set<string>();
        let mutationObserver: MutationObserver | undefined;
        let stopTimer = 0;

        const stopScanning = () => {
            mutationObserver?.disconnect();
            mutationObserver = undefined;
            if (stopTimer) window.clearTimeout(stopTimer);
            stopTimer = 0;
        };

        const scanForSections = () => {
            sectionIds.forEach((id) => {
                if (observed.has(id)) return;
                const element = document.getElementById(id);
                if (element) {
                    observer.observe(element);
                    observed.add(id);
                }
            });

            if (observed.size === sectionIds.length) {
                stopScanning();
            }
        };

        scanForSections();

        if (observed.size < sectionIds.length) {
            mutationObserver = new MutationObserver(scanForSections);
            mutationObserver.observe(document.getElementById('root') ?? document.body, {
                childList: true,
                subtree: true,
            });
            // Safety net: stop watching even if a section never mounts.
            stopTimer = window.setTimeout(stopScanning, 15000);
        }

        return () => {
            stopScanning();
            observer.disconnect();
            currentObservers.clear();
        };
    }, [sectionIds, pathname]);


    useEffect(() => {
        if (activeSection) {
            // Debounce URL updates to avoid performance issues
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                const path = activeSection === 'home' ? '/' : `/${activeSection}`;
                window.history.replaceState(null, '', path);
            }, 300);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [activeSection]);

    return activeSection;
}
