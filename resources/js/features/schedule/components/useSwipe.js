
import { useRef } from 'react';

export function useSwipe(onSwipeLeft, onSwipeRight) {
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);
    const mouseStartX = useRef(null);
    const mouseEndX = useRef(null);

    const minSwipeDistance = 50;

    // Touch events
    const onTouchStart = (e) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const distance = touchStartX.current - touchEndX.current;
        if (distance > minSwipeDistance) {
            onSwipeLeft && onSwipeLeft();
        } else if (distance < -minSwipeDistance) {
            onSwipeRight && onSwipeRight();
        }
    };

    // Mouse events
    const onMouseDown = (e) => {
        mouseEndX.current = null;
        mouseStartX.current = e.clientX;
    };

    const onMouseMove = (e) => {
        if (mouseStartX.current !== null) {
            mouseEndX.current = e.clientX;
        }
    };

    const onMouseUp = () => {
        if (mouseStartX.current === null || mouseEndX.current === null) return;
        const distance = mouseStartX.current - mouseEndX.current;
        if (distance > minSwipeDistance) {
            onSwipeLeft && onSwipeLeft();
        } else if (distance < -minSwipeDistance) {
            onSwipeRight && onSwipeRight();
        }
        mouseStartX.current = null;
        mouseEndX.current = null;
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp,
    };
}
