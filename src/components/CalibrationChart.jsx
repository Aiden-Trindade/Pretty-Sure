const SIZE = 300;
const LEFT = 44; // room for the y tick labels and "You won"
const BOTTOM = 40; // room for the x tick labels and "You said"
const TOP = 22; // room for "Underconfident" above the frame
const RIGHT = 22; // room for "Overconfident" beside the frame
const INSET = 12; // keeps dots at 0% and 100% fully inside the frame

const TICKS = [0, 25, 50, 75, 100];
const LABELLED = [0, 50, 100];

// The frame's edges
const frameLeft = LEFT;
const frameRight = SIZE - RIGHT;
const frameTop = TOP;
const frameBottom = SIZE - BOTTOM;

// The data area sits INSET inside the frame
const plot = frameRight - frameLeft - 2 * INSET;

// Scales a value from 0-100 to the chart's SVG coordinates
function toX(val) {
  return frameLeft + INSET + (plot * val) / 100;
}

// In SVG, y=0 is at the top, so 100% maps to the top and 0% to the bottom
function toY(val) {
  return frameBottom - INSET - (plot * val) / 100;
}

export default function CalibrationChart({ calibration = [] }) {
  // One point per range: the middle of what you said, against how often you won
  const points = calibration.map((range) => ({
    ...range,
    x: toX((range.min + range.max) / 2),
    y: toY(range.winRate),
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg className="chart" viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {/* Below the diagonal you won less than you said: overconfident */}
      <polygon
        className="chart-zone"
        points={`${frameLeft},${frameBottom} ${frameRight},${frameBottom} ${frameRight},${frameTop}`}
      />

      {/* Gridlines every 25% */}
      {TICKS.map((t) => (
        <g key={t}>
          <line className="chart-grid" x1={toX(t)} y1={frameTop} x2={toX(t)} y2={frameBottom} />
          <line className="chart-grid" x1={frameLeft} y1={toY(t)} x2={frameRight} y2={toY(t)} />
        </g>
      ))}

      {/* Tick labels on both axes */}
      {LABELLED.map((t) => (
        <g key={t}>
          <text className="chart-tick" x={toX(t)} y={frameBottom + 14} textAnchor="middle">
            {t}
          </text>
          <text className="chart-tick" x={frameLeft - 6} y={toY(t) + 3} textAnchor="end">
            {t}
          </text>
        </g>
      ))}

      <rect
        className="chart-frame"
        x={frameLeft}
        y={frameTop}
        width={frameRight - frameLeft}
        height={frameBottom - frameTop}
      />

      {/* Perfect calibration: corner to corner */}
      <line
        className="chart-perfect"
        x1={frameLeft}
        y1={frameBottom}
        x2={frameRight}
        y2={frameTop}
      />

      {/* Zone names sit outside the frame so dots never cover them */}
      <text className="chart-zone-label" x={frameLeft} y={frameTop - 7}>
        ↖ Underconfident
      </text>
      <text
        className="chart-zone-label over"
        x={frameRight + 14}
        y={frameBottom}
        transform={`rotate(-90, ${frameRight + 14}, ${frameBottom})`}
      >
        Overconfident
      </text>

      {/* Axis labels */}
      <text className="chart-label" x={(frameLeft + frameRight) / 2} y={SIZE - 6} textAnchor="middle">
        You said
      </text>
      <text
        className="chart-label"
        x={12}
        y={(frameTop + frameBottom) / 2}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${(frameTop + frameBottom) / 2})`}
      >
        You won
      </text>

      {/* Your actual curve, drawn under the dots */}
      {points.length > 1 && <polyline className="chart-line" points={linePoints} />}

      {points.map((p) => {
        // Bigger dots for ranges with more calls, between 4 and 12
        const r = Math.min(12, Math.max(4, 3 + p.count * 1.5));

        return (
          <circle className="chart-dot" key={p.min} cx={p.x} cy={p.y} r={r}>
            <title>
              {`You said ${p.min}–${p.max}%\nYou won ${p.winRate}%\n${p.count} ${p.count === 1 ? "call" : "calls"}`}
            </title>
          </circle>
        );
      })}
    </svg>
  );
}
