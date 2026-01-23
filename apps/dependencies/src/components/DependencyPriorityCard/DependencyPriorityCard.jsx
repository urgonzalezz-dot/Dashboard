import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import styles from './DependencyPriorityCard.module.scss';

const DependencyPriorityCard = ({ dependency, onViewDetails }) => {
  const {
    packageName,
    currentVersion,
    latestVersion,
    riskScore,
    riskLevel,
    tags = [],
    recommendedAction,
    analysis,
  } = dependency;

  const risk_color_level = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#F59E0B',
    low: '#10B981',
  };

  const getRiskColor = (level) => risk_color_level[level] ?? '#6B7280';

  const tag_colors = {
    security: { bg: '#FEE2E2', text: '#991B1B' },
    breaking_change: { bg: '#FFEDD5', text: '#9A3412' },
    eol_unmaintained: { bg: '#F3E8FF', text: '#6B21A8' },
    runtime: { bg: '#DBEAFE', text: '#1E40AF' },
    minor_update: { bg: '#D1FAE5', text: '#065F46' },
    up_to_date: { bg: '#D1FAE5', text: '#065F46' },
    transitive: { bg: '#F3F4F6', text: '#374151' },
    non_semver: { bg: '#FEF3C7', text: '#92400E' },
    unknown_type: { bg: '#F3F4F6', text: '#6B7280' },
    low_activity: { bg: '#FEF3C7', text: '#92400E' },
  };

  const getTagColor = (tag) => {
    return tag_colors[tag] ?? { bg: '#F3F4F6', text: '#374151' };
  };

  // CAMBIAR los valores que estaban como _

  const actions_icons = {
    UPDATE_SECURITY: 'U',
    REPLACE: 'R',
    PLAN_MIGRATION: 'P',
    UPDATE_MAJOR: 'U',
    UPDATE_SAFE: 'S',
    MONITOR: 'M',
    REVIEW_MANUAL: 'R',
  };

  const getActionIcon = (actionType) => {
    return actions_icons[actionType] ?? '•';
  };

  return (
    <div
      className={styles.card}
      style={{ borderLeftColor: getRiskColor(riskLevel) }}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.packageName}>{packageName}</h4>
          <div
            className={styles.riskBadge}
            style={{ backgroundColor: getRiskColor(riskLevel) }}
          >
            Risk: {riskScore}
          </div>
        </div>
        <div className={styles.versionRow}>
          <span className={styles.version}>
            {currentVersion} → {latestVersion}
          </span>
          {analysis?.versionGap && (
            <span className={styles.versionGap}>
              {analysis.versionGap.major > 0 &&
                `+${analysis.versionGap.major} major`}
              {analysis.versionGap.minor > 0 &&
                ` +${analysis.versionGap.minor} minor`}
              {analysis.versionGap.patch > 0 &&
                ` +${analysis.versionGap.patch} patch`}
            </span>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className={styles.tagsRow}>
          {tags.map((tag) => {
            const colors = getTagColor(tag);
            return (
              <span
                key={tag}
                className={styles.tag}
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {tag.replace(/-/g, ' ')}
              </span>
            );
          })}
        </div>
      )}

      {recommendedAction && (
        <div className={styles.actionRow}>
          <span className={styles.actionIcon}>
            {getActionIcon(recommendedAction.type)}
          </span>
          <span className={styles.actionText}>
            {recommendedAction.displayText}
          </span>
          <span className={styles.actionPriority}>
            P{recommendedAction.priority}
          </span>
        </div>
      )}

      <div className={styles.footer}>
        <button className={styles.detailsButton} onClick={onViewDetails}>
          <InfoIcon fontSize="small" />
          Ver detalles
        </button>
      </div>
    </div>
  );
};

DependencyPriorityCard.displayName = 'DependencyPriorityCard';
export default DependencyPriorityCard;
