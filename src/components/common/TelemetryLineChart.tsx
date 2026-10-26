import React, { useState, useMemo } from 'react';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface TelemetryPoint {
  time: string;
  csLab: number;
  progLab: number;
  netLab: number;
  engLab: number;
  average: number;
}

export const TelemetryLineChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [metric, setMetric] = useState<'cpu' | 'ram' | 'disk' | 'network'>('cpu');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate realistic telemetry points based on timeRange and metric
  const points: TelemetryPoint[] = useMemo(() => {
    const count = timeRange === '1h' ? 12 : timeRange === '6h' ? 18 : timeRange === '24h' ? 24 : 14;
    const baseMult = metric === 'cpu' ? 1 : metric === 'ram' ? 1.2 : metric === 'disk' ? 0.8 : 1.5;

    return Array.from({ length: count }, (_, i) => {
      let timeLabel = '';
      if (timeRange === '1h') timeLabel = `${5 * (i + 1)}m ago`;
      else if (timeRange === '6h') timeLabel = `${(count - i) * 20}m ago`;
      else if (timeRange === '24h') timeLabel = `${(i + 1).toString().padStart(2, '0')}:00`;
      else timeLabel = `Day ${i + 1}`;

      // Realistic sine waves with variations
      const factor = Math.sin((i / count) * Math.PI * 2) * 15;
      const csLab = Math.min(95, Math.max(10, Math.round((35 + factor + ((i * 3) % 11)) * (baseMult === 1.2 ? 1.4 : 1))));
      const progLab = Math.min(92, Math.max(12, Math.round((42 + factor * 0.8 + ((i * 5) % 13)) * (baseMult === 1.2 ? 1.2 : 1))));
      const netLab = Math.min(88, Math.max(8, Math.round((28 + factor * 1.2 + ((i * 2) % 9)) * (baseMult === 1.5 ? 1.6 : 1))));
      const engLab = Math.min(96, Math.max(15, Math.round((50 + factor * 0.9 + ((i * 7) % 14)) * (baseMult === 1.2 ? 1.5 : 1))));
      const avg = Math.round((csLab + progLab + netLab + engLab) / 4);

      return {
        time: timeLabel,
        csLab,
        progLab,
        netLab,
        engLab,
        average: avg
      };
    });
  }, [timeRange, metric]);

  // Chart dimensions
  const width = 640;
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 24;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = metric === 'network' ? 150 : 100;

  const getCoordinates = (index: number, val: number) => {
    const x = paddingLeft + (index / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  };

  // Build SVG polyline/path strings
  const buildPath = (key: keyof TelemetryPoint) => {
    return points
      .map((p, idx) => {
        const { x, y } = getCoordinates(idx, p[key] as number);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const avgPath = buildPath('average');
  const engPath = buildPath('engLab');
  const csPath = buildPath('csLab');

  const metricUnits = {
    cpu: '% Utilization',
    ram: '% RAM Allocated',
    disk: '% Storage Bandwidth',
    network: 'Mbps Transfer'
  };

  return (
    <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Aggregated Lab Resource Telemetry</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous real-time telemetry polled from agent nodes across 4 campus subnets
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMetric('cpu')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metric === 'cpu' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPU
            </button>
            <button
              onClick={() => setMetric('ram')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metric === 'ram' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RAM
            </button>
            <button
              onClick={() => setMetric('disk')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metric === 'disk' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Disk
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {(['1h', '6h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  timeRange === range ? 'bg-slate-800 text-slate-200 font-semibold' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive SVG Area */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="avgAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = paddingTop + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area under average */}
          <path
            d={`${avgPath} L ${width - paddingRight} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`}
            fill="url(#avgAreaGradient)"
          />

          {/* Eng Lab line (purple-blue) */}
          <path
            d={engPath}
            fill="none"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* CS Lab line (emerald) */}
          <path
            d={csPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Average Line (cyan, primary) */}
          <path
            d={avgPath}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
          />

          {/* Data Points / Hover detection */}
          {points.map((p, idx) => {
            const coords = getCoordinates(idx, p.average);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Invisible hover trigger column */}
                <rect
                  x={coords.x - chartWidth / (points.length * 2)}
                  y={paddingTop}
                  width={chartWidth / points.length}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className="cursor-pointer"
                />

                {/* Marker circle on hover */}
                {isHovered && (
                  <>
                    <line
                      x1={coords.x}
                      y1={paddingTop}
                      x2={coords.x}
                      y2={paddingTop + chartHeight}
                      stroke="#06B6D4"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="4.5"
                      fill="#06B6D4"
                      stroke="#0B111E"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* X Axis labels */}
          {points.map((p, idx) => {
            if (idx % (timeRange === '24h' ? 4 : 2) !== 0 && idx !== points.length - 1) return null;
            const { x } = getCoordinates(idx, 0);
            return (
              <text
                key={idx}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="monospace"
              >
                {p.time}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md"
            style={{
              left: `${Math.min(width - 150, Math.max(50, getCoordinates(hoveredIndex, points[hoveredIndex].average).x - 60))}px`,
              top: '10px'
            }}
          >
            <div className="font-mono text-cyan-400 font-semibold mb-1">
              Time: {points[hoveredIndex].time}
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between gap-4 text-white font-semibold">
                <span>Fleet Average:</span>
                <span className="text-cyan-300">{points[hoveredIndex].average}%</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> CS Lab:
                </span>
                <span>{points[hoveredIndex].csLab}%</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Eng Lab:
                </span>
                <span>{points[hoveredIndex].engLab}%</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Prog Lab:
                </span>
                <span>{points[hoveredIndex].progLab}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-2 flex-wrap gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded"></span> Campus Fleet Average
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400 rounded"></span> Engineering Systems
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 rounded"></span> Computer Science
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Sampling cadence: 15s · Unit: {metricUnits[metric]}
        </span>
      </div>
    </div>
  );
};
