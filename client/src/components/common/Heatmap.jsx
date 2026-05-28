import { useState } from 'react';
import { buildHeatmapGrid, MONTH_LABELS, DAY_LABELS } from '../../utils/dates.js';
import '../../styles/components/heatmap.css';

function getIntensityClass(value, mode = 'hours') {
  if (!value || value === 0) return 'heatmap-cell-empty';
  if (mode === 'score') {
    const s = Math.round(Math.min(10, Math.max(1, value)));
    return `heatmap-cell-score-${s}`;
  }
  // Hours mode
  if (value >= 6) return 'heatmap-cell-l4';
  if (value >= 3) return 'heatmap-cell-l3';
  if (value >= 1) return 'heatmap-cell-l2';
  return 'heatmap-cell-l1';
}

export default function Heatmap({ data = [], mode = 'hours', valueLabel = 'h' }) {
  const [tooltip, setTooltip] = useState(null);

  // Build lookup
  const map = {};
  for (const d of data) {
    map[d.date] = d.value ?? d.hours ?? d.score ?? 0;
  }

  const grid = buildHeatmapGrid(map);

  // Determine month labels positions
  const monthPositions = [];
  grid.forEach((week, wi) => {
    const firstDay = week[0]?.date;
    if (firstDay) {
      const d = new Date(firstDay);
      if (d.getDate() <= 7) {
        monthPositions[wi] = MONTH_LABELS[d.getMonth()];
      }
    }
  });

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-grid">
        {/* Rows = days of week (0=Sun to 6=Sat), Columns = weeks */}
        {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
          <div key={dayIdx} className="heatmap-row">
            <span className="heatmap-day-label">
              {dayIdx === 1 ? 'Mon' : dayIdx === 3 ? 'Wed' : dayIdx === 5 ? 'Fri' : ''}
            </span>
            {grid.map((week, wi) => {
              const cell = week[dayIdx];
              if (!cell) return <div key={wi} className="heatmap-cell heatmap-cell-empty" />;
              const val = map[cell.date] || 0;
              return (
                <div
                  key={wi}
                  className={`heatmap-cell ${getIntensityClass(val, mode)}`}
                  onMouseEnter={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ date: cell.date, val, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-months">
        {grid.map((_, wi) => (
          <span key={wi} style={{ flex: 1, textAlign: 'center' }}>
            {monthPositions[wi] || ''}
          </span>
        ))}
      </div>
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 32,
            pointerEvents: 'none',
            zIndex: 999,
          }}
        >
          <div className="heatmap-tooltip">
            {tooltip.date} — {tooltip.val > 0 ? `${tooltip.val}${valueLabel}` : 'No activity'}
          </div>
        </div>
      )}
    </div>
  );
}
