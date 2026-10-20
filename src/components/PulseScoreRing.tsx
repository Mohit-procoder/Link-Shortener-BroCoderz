'use client';

interface PulseScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PulseScoreRing({ score, size = 'md', showLabel = true }: PulseScoreRingProps) {
  const radius = size === 'sm' ? 18 : size === 'lg' ? 44 : 28;
  const stroke = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;
  const dimension = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let colorClass = 'text-emerald-400 stroke-emerald-400';
  let bgGlow = 'shadow-emerald-500/20';
  let labelText = 'Healthy';

  if (score === 0) {
    colorClass = 'text-rose-500 stroke-rose-500';
    bgGlow = 'shadow-rose-500/30';
    labelText = 'Terminated';
  } else if (score < 50) {
    colorClass = 'text-rose-400 stroke-rose-400';
    bgGlow = 'shadow-rose-500/20';
    labelText = 'Critical';
  } else if (score < 80) {
    colorClass = 'text-amber-400 stroke-amber-400';
    bgGlow = 'shadow-amber-500/20';
    labelText = 'Warning';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex items-center justify-center ${bgGlow}`}>
        <svg width={dimension} height={dimension} className="transform -rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-700 ease-out`}
          />
        </svg>
        <span
          className={`absolute font-mono font-bold ${
            size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-lg' : 'text-xs'
          } text-white`}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <div className="text-left leading-none">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">Pulse</span>
          <span className={`text-xs font-semibold ${colorClass.split(' ')[0]}`}>{labelText}</span>
        </div>
      )}
    </div>
  );
}
