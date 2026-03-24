"use client";
import { useState, useEffect, useRef } from "react";

export function useIdleTimeout(timeoutContainer = 10000) {
	// Default 10 seconds
	const [isIdle, setIsIdle] = useState(false);
	const timerRef = useRef(null);

	const resetTimer = () => {
		setIsIdle(false);
		if (timerRef.current) clearTimeout(timerRef.current);

		timerRef.current = setTimeout(() => {
			setIsIdle(true);
		}, timeoutContainer);
	};

	useEffect(() => {
		// Events to monitor
		const events = [
			"mousemove",
			"mousedown",
			"keydown",
			"touchstart",
			"scroll",
		];

        

		// Initialize timer
		resetTimer();

		// Add listeners
		events.forEach((event) => window.addEventListener(event, resetTimer));

		return () => {
			// Cleanup
			events.forEach((event) => window.removeEventListener(event, resetTimer));
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return isIdle;
}
