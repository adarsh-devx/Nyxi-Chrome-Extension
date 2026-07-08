import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export const ClockWidget: React.FC = () => {
  const { settings } = useSettings();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // 12-Hour format
    if (settings.clockFormat === '12h') {
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
    }

    const pad = (num: number) => String(num).padStart(2, '0');
    const formattedHours = settings.clockFormat === '12h' ? String(hours) : pad(hours);
    const formattedMinutes = pad(minutes);
    const formattedSeconds = pad(seconds);

    return {
      hours: formattedHours,
      minutes: formattedMinutes,
      seconds: formattedSeconds,
      ampm: settings.clockFormat === '12h' ? ampm : '',
    };
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return time.toLocaleDateString(undefined, options);
  };

  const { hours, minutes, seconds, ampm } = formatTime();

  if (!settings.widgetVisibility.clock) return null;

  return (
    <div className="clock-card select-none">
      <div className="flex items-baseline font-light tracking-tight text-white select-none">
        {/* Hours */}
        <span className="clock-digits transition-all">
          {hours}
        </span>
        {/* Colon separator */}
        <span className="clock-colon animate-pulse mx-2">
          :
        </span>
        {/* Minutes */}
        <span className="clock-digits transition-all">
          {minutes}
        </span>

        {/* Seconds */}
        {settings.showSeconds && (
          <>
            <span className="clock-seconds-colon ml-2">
              :
            </span>
            <span className="clock-seconds-digits ml-2">
              {seconds}
            </span>
          </>
        )}

        {/* AM/PM */}
        {ampm && (
          <span className="clock-ampm ml-4">
            {ampm}
          </span>
        )}
      </div>

      {/* Date */}
      {settings.showDate && (
        <div className="clock-date mt-4">
          {formatDate()}
        </div>
      )}
    </div>
  );
};
