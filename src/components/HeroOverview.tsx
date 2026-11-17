import { useState } from 'react';
import { Briefcase, Loader2, Plus, Search } from 'lucide-react';

interface HeroOverviewProps {
  totalJobs: number;
  chiangMaiCount: number;
  lamphunCount: number;
  dailyCashCount: number;
  liveWebCount: number;
  lastFetchedAt: string | null;
  isFetching: boolean;
  onFetchLiveJobs: () => void;
  onOpenPostModal: () => void;
  onQuickFilterProvince: (province: 'เชียงใหม่' | 'ลำพูน') => void;
  onQuickFilterDaily: () => void;
}

export function HeroOverview({
  totalJobs,
  chiangMaiCount,
  lamphunCount,
  dailyCashCount,
  liveWebCount,
  lastFetchedAt,
  isFetching,
  onFetchLiveJobs,
  onOpenPostModal,
  onQuickFilterProvince,
  onQuickFilterDaily,
}: HeroOverviewProps) {
  const [imgError, setImgError] = useState(false);

  const formattedFetchTime = lastFetchedAt
    ? new Date(lastFetchedAt).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      {/* 2-Column Split Hero */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-medium text-teal-800">
              เชียงใหม่ · ลำพูน · นิคมอุตสาหกรรมภาคเหนือ · วิถีไม่เลือกงานไม่ยากจน
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-[2.125rem] font-bold text-slate-900 leading-tight text-balance">
              รวมตำแหน่งงานว่างจริง ทั้ง Full-time, Part-time และฟรีแลนซ์รายวัน
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              ดึงประกาศงานล่าสุดในพื้นที่เชียงใหม่และลำพูน ตั้งแต่งานร้านกาแฟ คลังสินค้า
              โรงงานนิคมฯ งานช่าง งานแอดมิน ไปจนถึงงานรายวันรับเงินสดหลังเลิกงาน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onFetchLiveJobs}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-700"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="w-4 h-4" aria-hidden="true" />
              )}
              <span>
                {isFetching ? 'กำลังดึงตำแหน่งงานจากเว็บ...' : 'ดึงงานว่างล่าสุดจากเว็บ'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenPostModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>ลงประกาศรับคนทำงาน</span>
            </button>

            {formattedFetchTime && (
              <span className="text-xs text-slate-500 font-mono-num">
                อัปเดตสดเวลา {formattedFetchTime} น. · พบจากเว็บ {liveWebCount} ตำแหน่ง
              </span>
            )}
          </div>
        </div>

        {/* Right Image Column with Fallback */}
        <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
          {!imgError ? (
            <img
              src="/src/assets/images/lanna_work_banner_1794851863420.jpg"
              alt="บรรยากาศการทำงานยามเช้าในจังหวัดเชียงใหม่ มองเห็นดอยสุเทพในม่านหมอก"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full lg:h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-900 via-slate-800 to-slate-900 text-white">
              <Briefcase className="w-10 h-10 text-teal-300 mb-3" aria-hidden="true" />
              <p className="text-sm font-semibold">กาดงานลานนา เชียงใหม่–ลำพูน</p>
              <p className="text-xs text-slate-300 mt-1">ไม่เลือกงานไม่ยากจน</p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-5"
            aria-hidden="true"
          >
            <p className="text-xs sm:text-sm font-medium text-white/95 leading-snug">
              ทุกอาชีพสุจริตมีคุณค่า — เชื่อมงานประจำ งานเสริม และค่าแรงรายวันทั่วแอ่งเชียงใหม่–ลำพูน
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column KPI Strip Below Hero Split */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
          <div className="text-xs text-slate-500">ตำแหน่งงานพร้อมสมัคร</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-num">
            {totalJobs}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">รวมทุกประเภทงาน</div>
        </div>

        <button
          type="button"
          onClick={() => onQuickFilterProvince('เชียงใหม่')}
          className="text-left bg-white border border-slate-200 hover:border-teal-600 rounded-xl px-4 py-3.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="text-xs text-slate-500">จังหวัดเชียงใหม่</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-num">
            {chiangMaiCount}
          </div>
          <div className="mt-0.5 text-xs text-teal-700 font-medium">
            กดเพื่อกรองเฉพาะเชียงใหม่
          </div>
        </button>

        <button
          type="button"
          onClick={() => onQuickFilterProvince('ลำพูน')}
          className="text-left bg-white border border-slate-200 hover:border-teal-600 rounded-xl px-4 py-3.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="text-xs text-slate-500">จังหวัดลำพูน & นิคมฯ</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono-num">
            {lamphunCount}
          </div>
          <div className="mt-0.5 text-xs text-teal-700 font-medium">
            กดเพื่อกรองเฉพาะลำพูน
          </div>
        </button>

        <button
          type="button"
          onClick={onQuickFilterDaily}
          className="text-left bg-white border border-slate-200 hover:border-emerald-600 rounded-xl px-4 py-3.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <div className="text-xs text-slate-500">งานรายวัน / รับเงินไว</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono-num">
            {dailyCashCount}
          </div>
          <div className="mt-0.5 text-xs text-emerald-700 font-medium">
            กดเพื่อดูงานจบรับเงินทันที
          </div>
        </button>
      </div>
    </section>
  );
}
