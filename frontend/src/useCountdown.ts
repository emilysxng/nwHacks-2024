import { useState, useEffect } from "react"

export default function useCountdown() {
    const[secondsLeft, setSecondsLeft] = useState(0);
    const [initialSeconds, setInitialSeconds] = useState(0);
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if(secondsLeft <= 0) return;

        const timeout = setTimeout(() => {
            setSecondsLeft(secondsLeft-1);
            updateRatio();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [secondsLeft]);

    function start(seconds: number) {
        setSecondsLeft(seconds);
        setInitialSeconds(seconds);
        updateRatio();
    }

    function updateRatio() {
        const newPercentage = initialSeconds > 0 ? (100*((secondsLeft-1) / initialSeconds)) : 0;
        setPercentage(newPercentage);
    }

    return {secondsLeft, percentage, start};
}