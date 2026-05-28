import { useEffect, useState } from 'react';
import { Flame, Award } from 'lucide-react';
import api from '../../services/api.js';
import { levelFromXP, xpProgress, xpForNextLevel, BADGE_META } from '../../utils/xp.js';
import '../../styles/components/gamification.css';

export default function GamificationWidget() {
  const [gam, setGam] = useState(null);

  useEffect(() => {
    api.get('/gamification').then(r => setGam(r.data)).catch(() => {});
  }, []);

  if (!gam) return (
    <div className="gam-widget">
      <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%' }} />
      <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 4 }} />
    </div>
  );

  const level = levelFromXP(gam.xp);
  const progress = xpProgress(gam.xp);
  const nextLevelXP = xpForNextLevel(gam.xp);
  const xpInLevel = gam.xp % 500;
  const badges = Array.isArray(gam.badges) ? gam.badges : [];

  return (
    <div className="gam-widget">
      <div className="gam-level-badge">{level}</div>

      <div style={{ width: '100%' }}>
        <div className="gam-xp-label">
          <span>Level {level}</span>
          <span>{500 - xpInLevel} XP to Lv {level + 1}</span>
        </div>
        <div className="gam-xp-bar">
          <div className="gam-xp-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="gam-streak">
        <Flame size={16} style={{ fill: 'var(--accent)', color: 'var(--accent)' }} />
        <span>{gam.streak} Day Streak</span>
      </div>

      {badges.length > 0 && (
        <div className="gam-badges">
          {badges.slice(0, 4).map(badgeId => {
            const meta = BADGE_META[badgeId];
            if (!meta) return null;
            return (
              <div key={badgeId} className="gam-badge-chip">
                <Award size={11} />
                {meta.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
