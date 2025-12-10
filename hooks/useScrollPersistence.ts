import React, { useEffect, useRef } from "react";

/**
 * A hook to persist and restore scroll position for a specific element.
 * 
 * @param key The unique key to store the scroll position in sessionStorage.
 * @param elementRef The ref to the scrollable element.
 * @param enabled Whether persistence is enabled.
 */
const useScrollPersistence = (
  key: string, 
  elementRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
) => {
  // Restore scroll position on mount
  useEffect(() => {
    if (!enabled || !key || !elementRef.current) return;

    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    const position = savedPosition ? parseInt(savedPosition, 10) : 0;

    if (position > 0) {
        // We use a small timeout to ensure content is fully rendered/layout is stable
        // especially if other state restorations (like item count) happen simultaneously.
        requestAnimationFrame(() => {
            if (elementRef.current) {
                elementRef.current.scrollTop = position;
            }
        });
    }
  }, [key, enabled, elementRef]);

  // Save scroll position on scroll
  useEffect(() => {
    if (!enabled || !key || !elementRef.current) return;

    const element = elementRef.current;
    
    const handleScroll = () => {
        if (element) {
            sessionStorage.setItem(`scroll-${key}`, element.scrollTop.toString());
        }
    };

    // simple debounce wrapper to avoid thrashing storage.
    let timeoutId: NodeJS.Timeout;
    const debouncedScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
    };

    element.addEventListener("scroll", debouncedScroll);

    return () => {
        element.removeEventListener("scroll", debouncedScroll);
        clearTimeout(timeoutId);
    };
  }, [key, enabled, elementRef]);

  return {};
};

export default useScrollPersistence;