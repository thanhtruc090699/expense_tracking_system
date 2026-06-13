import { getCategoryColor } from '../../utils/categoryColors';

interface PieChartProps {
  data: Record<string, number>;
  size?: number;
}

export function PieChart({ data, size = 120 }: PieChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  if (total === 0) return null;
  
  const entries = Object.entries(data);

  if (entries.length === 1) {
    const [category, value] = entries[0];
    const color = getCategoryColor(category);
    const radius = size / 2 - 8;
    
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={color}
          stroke="white"
          strokeWidth="2"
        />
        <circle cx={size / 2} cy={size / 2} r={size / 3} fill="white" />
      </svg>
    );
  }

  let currentAngle = -Math.PI / 2;

  const slices = entries.map(([category, value]) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = size / 2 + (size / 2 - 8) * Math.cos(startAngle);
    const y1 = size / 2 + (size / 2 - 8) * Math.sin(startAngle);
    const x2 = size / 2 + (size / 2 - 8) * Math.cos(endAngle);
    const y2 = size / 2 + (size / 2 - 8) * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${size / 2} ${size / 2}`,
      `L ${x1} ${y1}`,
      `A ${size / 2 - 8} ${size / 2 - 8} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return (
      <path
        key={category}
        d={pathData}
        fill={getCategoryColor(category)}
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <circle cx={size / 2} cy={size / 2} r={size / 3} fill="white" />
    </svg>
  );
}
