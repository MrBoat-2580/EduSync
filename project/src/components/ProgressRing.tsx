type ProgressRingProps = {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string; // stroke color class
};

// Circular progress indicator using SVG stroke-dasharray.
export default function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color = 'stroke-brand-500',
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-ink-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`fill-none ${color} transition-all duration-1000 ease-out`}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="display text-2xl font-bold text-ink-900">{label}</span>}
        {sublabel && <span className="text-xs font-medium text-ink-500">{sublabel}</span>}
      </div>
    </div>
  );
}
