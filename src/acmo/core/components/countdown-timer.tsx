import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

interface CountdownTimerProps {
  duration: number;
  style?: any;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  style,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (days > 0) {
      return `${pad(days)} d ${pad(hours)} h`;
    } else {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
  };

  return (
      <Text style={style}>
        {formatTime(timeLeft)}
      </Text>
  );
};
