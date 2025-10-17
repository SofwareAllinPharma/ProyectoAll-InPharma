import React from 'react';

type Segment = {
  id: string | number;
  label: string;
  percentage: number; // 0..100
};

type Props = {
  segments: Segment[];
  className?: string;
  height?: number; // en px
};

const PALETTE = [
  'bg-[#9B9477]',
  'bg-[#B9B19A]',
  'bg-[#7B6B57]',
  'bg-[#C9C1AE]',
  'bg-[#5E5344]',
  'bg-[#ADA48A]',
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const DistributionBar: React.FC<Props> = ({ segments, className = '', height = 14 }) => {
  const totalPct = segments.reduce((acc, s) => acc + (isFinite(s.percentage) ? s.percentage : 0), 0);
  const safeSegments = segments.map(s => ({
    ...s,
    percentage: totalPct === 0 ? 0 : clamp(s.percentage),
  }));

  return (
    <div className={`w-full flex justify-center`}>
      <div
        className={`flex w-full max-w-[160px] overflow-hidden rounded-md bg-neutral-200/80 dark:bg-neutral-700/50 ${className}`}
        style={{ height }}
        aria-label="Distribución por depósito"
      >
        {safeSegments.map((s, i) => {
          const pct = clamp(s.percentage);
          if (pct <= 0) return null;

          const isFirst = i === 0;
          const isLast = i === safeSegments.length - 1;
          const minPx = 6;
          const widthStyle: React.CSSProperties =
            pct < 3
              ? { width: minPx }
              : { width: `${pct}%` };

          return (
            <div
              key={s.id}
              className={[
                'h-full',
                PALETTE[i % PALETTE.length],
                !isFirst ? 'border-l border-white/70 dark:border-black/30' : '',
                isFirst ? 'rounded-l-md' : '',
                isLast ? 'rounded-r-md' : '',
                'transition-[width] duration-200 ease-out',
              ].join(' ')}
              style={widthStyle}
              title={`${s.label}: ${pct}%`}
              aria-label={`${s.label} ${pct}%`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DistributionBar;
