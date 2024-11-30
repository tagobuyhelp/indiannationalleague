import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondDegrees = (time.getSeconds() / 60) * 360;
  const minuteDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hourDegrees = ((time.getHours() + time.getMinutes() / 60) / 12) * 360;

  return (
    <div className="w-16 h-16 relative rounded-full border-2 border-indigo-400/30 bg-gradient-to-br from-indigo-800 to-indigo-900 shadow-lg">
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-1.5 bg-indigo-300/50"
          style={{
            transform: `rotate(${i * 30}deg)`,
            transformOrigin: '50% 100%',
            left: 'calc(50% - 1px)',
            top: '2px'
          }}
        />
      ))}

      {/* Hour hand */}
      <div
        className="absolute w-1 h-4 bg-indigo-200 rounded-full shadow-sm"
        style={{
          transform: `rotate(${hourDegrees}deg)`,
          transformOrigin: 'bottom center',
          left: 'calc(50% - 2px)',
          bottom: '50%'
        }}
      />

      {/* Minute hand */}
      <div
        className="absolute w-0.5 h-5 bg-indigo-100 rounded-full shadow-sm"
        style={{
          transform: `rotate(${minuteDegrees}deg)`,
          transformOrigin: 'bottom center',
          left: 'calc(50% - 1px)',
          bottom: '50%'
        }}
      />

      {/* Second hand */}
      <div
        className="absolute w-0.5 h-6 bg-rose-400 rounded-full shadow-sm"
        style={{
          transform: `rotate(${secondDegrees}deg)`,
          transformOrigin: 'bottom center',
          left: 'calc(50% - 1px)',
          bottom: '50%'
        }}
      />

      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-rose-400 rounded-full shadow-md" 
           style={{ left: 'calc(50% - 4px)', top: 'calc(50% - 4px)' }} />
    </div>
  );
};

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="text-sm">
      <div className="text-indigo-200">{days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}, {time.getFullYear()}</div>
      <div className="text-indigo-100 font-medium">{formatTime(time)} IST</div>
    </div>
  );
};

const Clock = () => {
  return (
    <div className="flex items-center space-x-4 text-indigo-300">
      <ClockIcon className="w-4 h-4" />
      <AnalogClock />
      <DigitalClock />
    </div>
  );
};

export default Clock;