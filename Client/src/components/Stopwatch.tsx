import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const Stopwatch = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const loginTime = localStorage.getItem('loginTime');

  useEffect(() => {
    if (!loginTime) {
      localStorage.setItem('loginTime', Date.now().toString());
    }

    const timer = setInterval(() => {
      const start = parseInt(localStorage.getItem('loginTime') || Date.now().toString());
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [loginTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 text-indigo-300">
      <Timer className="w-4 h-4" />
      <span className="text-sm font-medium bg-gradient-to-r from-indigo-200 to-blue-200 bg-clip-text text-transparent">
        Session: {formatTime(elapsedTime)}
      </span>
    </div>
  );
};

export default Stopwatch;