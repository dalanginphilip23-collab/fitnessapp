import React from 'react';
import HistoryTab from '../tabs/HistoryTab';
import StatsTab from '../tabs/StatsTab';
import FeedTab from '../tabs/FeedTab';

// Desktop right-hand panel for the Strava-style layout.
// Top: the live session (idle CTA / recording stats / summary card / detail).
// Bottom: browse tabs — History / Stats / Feed.

const ActivityPanel = ({
  session,
  activeTab,
  setActiveTab,
  history,
  historyLoading,
  historyError,
  onRefreshHistory,
  onDeleteActivity,
  onViewActivity,
  onShareActivity,
  stats,
  statsLoading,
  statsError,
  feed,
  feedLoading,
  feedError,
  onRefreshFeed,
  onDeleteFeedPost,
  currentUserId,
  formatTime,
}) => {
  const tabs = [
    { key: 'history', label: 'History', icon: 'history' },
    { key: 'stats', label: 'Stats', icon: 'monitoring' },
    { key: 'feed', label: 'Feed', icon: 'group' },
  ];

  return (
    <div className="w-[360px] xl:w-[400px] flex-shrink-0 bg-[var(--bg-secondary)] border-l border-[var(--border-light)] flex flex-col overflow-hidden">
      {/* Session area */}
      <div className="px-4 py-4 xl:px-5 overflow-y-auto no-scrollbar border-b border-[var(--border-light)] shrink-0 max-h-[52vh]">
        {session}
      </div>

      {/* Browse tabs */}
      <div className="flex border-b border-[var(--border-light)] bg-[var(--bg-tertiary)] shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === t.key
                ? 'text-[var(--accent)] border-[var(--accent)]'
                : 'text-[var(--text-disabled)] border-transparent hover:text-[var(--text-muted)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto">
            <HistoryTab
              history={history}
              historyLoading={historyLoading}
              historyError={historyError}
              formatTime={formatTime}
              onRefresh={onRefreshHistory}
              onDelete={onDeleteActivity}
              onView={onViewActivity}
              onShare={onShareActivity}
              isOverlay
            />
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="h-full overflow-y-auto">
            <StatsTab
              stats={stats}
              statsLoading={statsLoading}
              statsError={statsError}
              formatTime={formatTime}
              isOverlay
            />
          </div>
        )}
        {activeTab === 'feed' && (
          <div className="h-full overflow-y-auto">
            <FeedTab
              feed={feed}
              feedLoading={feedLoading}
              feedError={feedError}
              formatTime={formatTime}
              onRefresh={onRefreshFeed}
              onDeletePost={onDeleteFeedPost}
              currentUserId={currentUserId}
              onViewActivity={onViewActivity}
              isOverlay
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
