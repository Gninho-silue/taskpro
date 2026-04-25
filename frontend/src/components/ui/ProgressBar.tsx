import { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  value: number;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, height = 4, showLabel = false }: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const t = setTimeout(() => setWidth(Math.min(100, Math.max(0, value))), 50);
      return () => clearTimeout(t);
    } else {
      setWidth(Math.min(100, Math.max(0, value)));
    }
  }, [value]);

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between mb-1 text-[10px] text-[#6b6b8a]">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: '#1e1e3a' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #7c3aed, #10b981)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
