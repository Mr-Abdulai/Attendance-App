import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';

interface SessionTimerProps {
    startTime: string | Date;
    duration: number; // in seconds
    onExpire?: () => void;
}

export default function SessionTimer({ startTime, duration, onExpire }: SessionTimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const end = start + duration * 1000;

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft('Session Ended');
                if (onExpire) onExpire();
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${minutes}m ${seconds}s remaining`);
        };

        updateTimer(); // Initial call
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [startTime, duration, onExpire]);

    if (isExpired) return null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'primary.main' }}>
            <TimeIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="bold">
                {timeLeft}
            </Typography>
        </Box>
    );
}
