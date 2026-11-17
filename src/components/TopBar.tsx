import { Loader2, RefreshCw } from 'lucide-react';

export type ActiveTab = 'board' | 'daily' | 'calculator' | 'saved';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  isFetching: boolean;
  onFetchLiveJobs: () => void;
}

export function TopBar({
  activeTab,
  onSelectTab,
  savedCount,
  isFetching,
  onFetchLiveJobs,
}: TopBarProps) {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'board', label: 'ค้นหางาน' },
    { id: 'daily', label: 'งานรายวันด่วน' },
    { id: 'calculator', label: 'คำนวณรายได้' },
    { id: 'saved', label: savedCount > 0 ? `งานที่บันทึก (${savedCount})` : 'งานที่บันทึก' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('board')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded"
        >
          กาดงานลานนา
        </button>

        {/* Zone 2: Single-line navigation links */}
        <nav
          aria-label="เมนูหลัก"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  isActive
                    ? 'border-teal-700 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onFetchLiveJobs}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-700"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isFetching ? 'กำลังดึงงาน...' : 'ดึงงานล่าสุด'}</span>
          </button>
        </div>
      </div>

      {/* Mobile secondary nav row (compact, single-line scrollable) */}
      <div className="md:hidden border-t border-slate-100 px-4 flex items-center gap-5 overflow-x-auto h-11">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`text-xs font-medium whitespace-nowrap shrink-0 py-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-teal-700 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
