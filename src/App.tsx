import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bookmark, Briefcase, ExternalLink, Globe, RefreshCw } from 'lucide-react';
import { FilterToolbar } from './components/FilterToolbar';
import { HeroOverview } from './components/HeroOverview';
import { IncomeCalculator } from './components/IncomeCalculator';
import { JobDetailDrawer } from './components/JobDetailDrawer';
import { JobRow } from './components/JobRow';
import { PostGigModal } from './components/PostGigModal';
import { TopBar, type ActiveTab } from './components/TopBar';
import { INITIAL_JOBS } from './data/initialJobs';
import type {
  ApplicationStatus,
  FetchJobsResponse,
  GroundSource,
  JobCategory,
  JobListing,
  JobType,
  Province,
} from './types/job';

const STORAGE_SAVED_KEY = 'lanna_jobs_saved_v1';
const STORAGE_STATUS_KEY = 'lanna_jobs_status_v1';
const STORAGE_POSTED_KEY = 'lanna_jobs_posted_v1';

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [communityJobs, setCommunityJobs] = useState<JobListing[]>(() =>
    readJsonStorage<JobListing[]>(STORAGE_POSTED_KEY, [])
  );
  const [liveJobs, setLiveJobs] = useState<JobListing[]>([]);
  const [liveSources, setLiveSources] = useState<GroundSource[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [fetchSummary, setFetchSummary] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readJsonStorage<string[]>(STORAGE_SAVED_KEY, [])
  );
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>(() =>
    readJsonStorage<Record<string, ApplicationStatus>>(STORAGE_STATUS_KEY, {})
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState<'all' | Province>('all');
  const [jobType, setJobType] = useState<'all' | JobType>('all');
  const [category, setCategory] = useState<'all' | JobCategory>('all');
  const [district, setDistrict] = useState('all');
  const [immediateOnly, setImmediateOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'pay-high'>('latest');

  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [calcPresetJob, setCalcPresetJob] = useState<JobListing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota issues
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATUS_KEY, JSON.stringify(statuses));
    } catch {
      // Ignore storage quota issues
    }
  }, [statuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POSTED_KEY, JSON.stringify(communityJobs));
    } catch {
      // Ignore storage quota issues
    }
  }, [communityJobs]);

  const allJobs = useMemo(() => {
    const merged = [...communityJobs, ...liveJobs, ...INITIAL_JOBS];
    const seen = new Set<string>();
    return merged.filter((job) => {
      const key = `${job.title.toLowerCase()}::${job.employer.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [communityJobs, liveJobs]);

  const fetchLiveJobs = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/jobs/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province,
          jobType: activeTab === 'daily' ? 'daily-freelance' : jobType,
          category,
          keyword,
        }),
      });

      const data = (await res.json()) as Partial<FetchJobsResponse> & {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.message || data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน');
      }

      if (Array.isArray(data.jobs) && data.jobs.length > 0) {
        setLiveJobs((prev) => {
          const combined = [...data.jobs!, ...prev];
          const seen = new Set<string>();
          return combined.filter((item) => {
            const k = `${item.title}::${item.employer}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        });
      }

      if (Array.isArray(data.sources)) {
        setLiveSources(data.sources);
      }
      setLastFetchedAt(data.fetchedAt || new Date().toISOString());
      setFetchSummary(data.summary || null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อบริการดึงงานสดได้';
      setFetchError(msg);
    } finally {
      setIsFetching(false);
    }
  }, [province, jobType, category, keyword, activeTab]);

  const handleToggleSave = (jobId: string) => {
    setSavedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleStatusChange = (jobId: string, nextStatus: ApplicationStatus) => {
    setStatuses((prev) => ({ ...prev, [jobId]: nextStatus }));
  };

  const handleAddCommunityJob = (newJob: JobListing) => {
    setCommunityJobs((prev) => [newJob, ...prev]);
    setActiveTab('board');
  };

  const handleResetFilters = () => {
    setKeyword('');
    setProvince('all');
    setJobType('all');
    setCategory('all');
    setDistrict('all');
    setImmediateOnly(false);
    setSortBy('latest');
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'daily') {
      setJobType('daily-freelance');
    } else if (tab === 'board' && jobType === 'daily-freelance') {
      setJobType('all');
    }
  };

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const list = allJobs.filter((job) => {
      if (activeTab === 'saved' && !savedIds.includes(job.id)) {
        return false;
      }
      if (activeTab === 'daily' && job.jobType !== 'daily-freelance' && !job.immediateCash) {
        return false;
      }
      if (province !== 'all' && job.province !== province) return false;
      if (activeTab === 'board' && jobType !== 'all' && job.jobType !== jobType) {
        return false;
      }
      if (category !== 'all' && job.category !== category) return false;
      if (district !== 'all' && !job.district.includes(district)) return false;
      if (immediateOnly && !job.immediateCash) return false;
      if (q) {
        const haystack =
          `${job.title} ${job.employer} ${job.province} ${job.district} ${job.category} ${job.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'pay-high') {
      return [...list].sort((a, b) => {
        const normA = a.payCycle === 'ต่อวัน' ? a.payMax * 25 : a.payCycle === 'ต่อชั่วโมง' ? a.payMax * 180 : a.payMax;
        const normB = b.payCycle === 'ต่อวัน' ? b.payMax * 25 : b.payCycle === 'ต่อชั่วโมง' ? b.payMax * 180 : b.payMax;
        return normB - normA;
      });
    }
    return list;
  }, [
    allJobs,
    activeTab,
    savedIds,
    province,
    jobType,
    category,
    district,
    immediateOnly,
    keyword,
    sortBy,
  ]);

  const kpiStats = useMemo(() => {
    return {
      total: allJobs.length,
      chiangMai: allJobs.filter((j) => j.province === 'เชียงใหม่').length,
      lamphun: allJobs.filter((j) => j.province === 'ลำพูน').length,
      dailyCash: allJobs.filter(
        (j) => j.jobType === 'daily-freelance' || j.immediateCash
      ).length,
    };
  }, [allJobs]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        savedCount={savedIds.length}
        isFetching={isFetching}
        onFetchLiveJobs={fetchLiveJobs}
      />

      <main className="flex-1 pb-12">
        <HeroOverview
          totalJobs={kpiStats.total}
          chiangMaiCount={kpiStats.chiangMai}
          lamphunCount={kpiStats.lamphun}
          dailyCashCount={kpiStats.dailyCash}
          liveWebCount={liveJobs.length}
          lastFetchedAt={lastFetchedAt}
          isFetching={isFetching}
          onFetchLiveJobs={fetchLiveJobs}
          onOpenPostModal={() => setIsPostModalOpen(true)}
          onQuickFilterProvince={(prov) => {
            setActiveTab('board');
            setProvince(prov);
            setDistrict('all');
          }}
          onQuickFilterDaily={() => {
            setActiveTab('daily');
            setImmediateOnly(true);
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 mt-2">
          {/* Live Fetch Status / Error Alert */}
          {fetchError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-red-800">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-semibold">การดึงงานสดจากเว็บขัดข้องชั่วคราว</div>
                  <div className="text-xs text-red-700 mt-0.5">{fetchError}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchLiveJobs}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                ลองดึงข้อมูลอีกครั้ง
              </button>
            </div>
          )}

          {fetchSummary && !fetchError && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-teal-900">
              <div className="flex items-center gap-2 font-medium">
                <Globe className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                <span>{fetchSummary}</span>
              </div>
              <span className="text-xs text-teal-700">
                ตำแหน่งงานใหม่ถูกจัดแสดงไว้ด้านบนสุดของรายการแล้ว
              </span>
            </div>
          )}

          {activeTab === 'calculator' ? (
            <IncomeCalculator jobs={allJobs} presetJob={calcPresetJob} />
          ) : (
            <>
              <FilterToolbar
                keyword={keyword}
                onKeywordChange={setKeyword}
                province={province}
                onProvinceChange={setProvince}
                jobType={activeTab === 'daily' ? 'daily-freelance' : jobType}
                onJobTypeChange={(nextType) => {
                  if (activeTab === 'daily' && nextType !== 'daily-freelance') {
                    setActiveTab('board');
                  }
                  setJobType(nextType);
                }}
                category={category}
                onCategoryChange={setCategory}
                district={district}
                onDistrictChange={setDistrict}
                immediateOnly={immediateOnly}
                onImmediateOnlyChange={setImmediateOnly}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                onResetFilters={handleResetFilters}
                resultCount={filteredJobs.length}
              />

              {/* Skeleton Loading Rows when Fetching Live Web Results */}
              {isFetching && (
                <div className="space-y-3" aria-busy="true" aria-label="กำลังดึงประกาศงานล่าสุด">
                  {[0, 1, 2].map((skeletonIdx) => (
                    <div
                      key={skeletonIdx}
                      className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse space-y-3"
                    >
                      <div className="h-3 w-48 bg-slate-200 rounded" />
                      <div className="h-5 w-2/3 bg-slate-200 rounded" />
                      <div className="h-4 w-full bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Job List or Empty State */}
              {filteredJobs.length > 0 ? (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      isSaved={savedIds.includes(job.id)}
                      status={statuses[job.id] ?? 'none'}
                      onSelect={(j) => setSelectedJob(j)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
                  {activeTab === 'saved' ? (
                    <>
                      <Bookmark
                        className="w-8 h-8 text-slate-400 mx-auto"
                        aria-hidden="true"
                      />
                      <h3 className="text-base font-bold text-slate-900">
                        ยังไม่มีตำแหน่งงานที่คุณบันทึกไว้
                      </h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        กดปุ่ม “บันทึก” บนตำแหน่งงานที่คุณสนใจ เพื่อเก็บไว้เปรียบเทียบค่าแรงและติดตามผลการสมัครในหน้านี้
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('board')}
                          className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
                        >
                          ไปดูตำแหน่งงานทั้งหมด
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Briefcase
                        className="w-8 h-8 text-slate-400 mx-auto"
                        aria-hidden="true"
                      />
                      <h3 className="text-base font-bold text-slate-900">
                        ไม่พบตำแหน่งงานที่ตรงกับตัวกรองปัจจุบัน
                      </h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        ลองล้างตัวกรอง หรือกดปุ่มดึงงานสดจากเว็บเพื่อค้นหาตำแหน่งที่เปิดรับสมัครล่าสุดตามคำค้นหานี้
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                        <button
                          type="button"
                          onClick={fetchLiveJobs}
                          disabled={isFetching}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" aria-hidden="true" />
                          <span>ดึงงานสดจากเว็บตามคำค้นนี้</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Grounded Web Sources Panel */}
              {liveSources.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-teal-700" aria-hidden="true" />
                      <span>แหล่งเว็บไซต์ประกาศงานอ้างอิงจากการดึงข้อมูลล่าสุด</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono-num">
                      {liveSources.length} แหล่งข้อมูล
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {liveSources.map((src) => (
                      <a
                        key={src.uri}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-2.5 text-xs text-slate-700 hover:text-teal-800 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 rounded-lg transition-colors"
                      >
                        <span className="truncate font-medium">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">กาดงานลานนา</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>ศูนย์รวมงานสุจริต เชียงใหม่–ลำพูน (Full-time, Part-time และฟรีแลนซ์รายวัน)</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(true)}
              className="text-teal-700 hover:underline font-medium cursor-pointer"
            >
              ลงประกาศรับคนทำงาน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className="text-slate-700 hover:underline font-medium cursor-pointer"
            >
              คำนวณรายได้รายเดือน
            </button>
          </div>
        </div>
      </footer>

      <JobDetailDrawer
        job={selectedJob}
        isSaved={selectedJob ? savedIds.includes(selectedJob.id) : false}
        status={selectedJob ? (statuses[selectedJob.id] ?? 'none') : 'none'}
        onClose={() => setSelectedJob(null)}
        onToggleSave={handleToggleSave}
        onStatusChange={handleStatusChange}
        onSendToCalculator={(job) => {
          setCalcPresetJob(job);
          setSelectedJob(null);
          setActiveTab('calculator');
        }}
      />

      <PostGigModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handleAddCommunityJob}
      />
    </div>
  );
}
