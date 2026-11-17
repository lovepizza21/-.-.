import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { CHIANG_MAI_DISTRICTS, LAMPHUN_DISTRICTS } from '../data/initialJobs';
import type { JobCategory, JobType, Province } from '../types/job';

interface FilterToolbarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  province: 'all' | Province;
  onProvinceChange: (val: 'all' | Province) => void;
  jobType: 'all' | JobType;
  onJobTypeChange: (val: 'all' | JobType) => void;
  category: 'all' | JobCategory;
  onCategoryChange: (val: 'all' | JobCategory) => void;
  district: string;
  onDistrictChange: (val: string) => void;
  immediateOnly: boolean;
  onImmediateOnlyChange: (val: boolean) => void;
  sortBy: 'latest' | 'pay-high';
  onSortByChange: (val: 'latest' | 'pay-high') => void;
  onResetFilters: () => void;
  resultCount: number;
}

const CATEGORIES: JobCategory[] = [
  'บริการ/คาเฟ่/ร้านอาหาร',
  'ช่าง/โรงงาน/โกดัง/ขนส่ง',
  'ค้าขาย/PC/แคชเชียร์',
  'ออฟฟิศ/บัญชี/แอดมิน',
  'ดิจิทัล/ครีเอทีฟ/สอนพิเศษ',
  'ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร',
];

export function FilterToolbar({
  keyword,
  onKeywordChange,
  province,
  onProvinceChange,
  jobType,
  onJobTypeChange,
  category,
  onCategoryChange,
  district,
  onDistrictChange,
  immediateOnly,
  onImmediateOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  resultCount,
}: FilterToolbarProps) {
  const districtOptions =
    province === 'เชียงใหม่'
      ? CHIANG_MAI_DISTRICTS
      : province === 'ลำพูน'
        ? LAMPHUN_DISTRICTS
        : [...CHIANG_MAI_DISTRICTS, ...LAMPHUN_DISTRICTS];

  const hasActiveFilters =
    keyword.trim() !== '' ||
    province !== 'all' ||
    jobType !== 'all' ||
    category !== 'all' ||
    district !== 'all' ||
    immediateOnly;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Row 1: Search input + Province segmented control + JobType segmented control */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="ค้นหางาน ย่าน หรือทักษะ เช่น บาริสต้า, นิคมลำพูน, แพ็กของ, ขับรถ..."
            aria-label="ค้นหาตำแหน่งงาน"
            className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
          />
        </div>

        {/* Province Segmented Buttons */}
        <div
          role="group"
          aria-label="เลือกจังหวัด"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto"
        >
          {(['all', 'เชียงใหม่', 'ลำพูน'] as const).map((item) => {
            const active = province === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onProvinceChange(item);
                  onDistrictChange('all');
                }}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item === 'all' ? 'ทุกจังหวัด' : item}
              </button>
            );
          })}
        </div>

        {/* Job Type Segmented Buttons */}
        <div
          role="group"
          aria-label="เลือกประเภทการจ้างงาน"
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto"
        >
          {(
            [
              { id: 'all', label: 'ทุกประเภท' },
              { id: 'full-time', label: 'Full-time' },
              { id: 'part-time', label: 'Part-time' },
              { id: 'daily-freelance', label: 'ฟรีแลนซ์รายวัน' },
            ] as const
          ).map((item) => {
            const active = jobType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onJobTypeChange(item.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Secondary selects, immediate cash toggle, sort & count */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ตัวกรองเพิ่มเติม</span>
          </span>

          <select
            aria-label="หมวดหมู่งาน"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as 'all' | JobCategory)}
            className="h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่อาชีพ</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="อำเภอหรือย่าน"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
          >
            <option value="all">ทุกอำเภอ / ทุกโซน</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onImmediateOnlyChange(!immediateOnly)}
            aria-pressed={immediateOnly}
            className={`h-9 px-3 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              immediateOnly
                ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            เฉพาะรับเงินรายวัน/เงินไว
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-slate-500 font-mono-num">
            พบ {resultCount} ตำแหน่ง
          </span>
          <select
            aria-label="เรียงลำดับ"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'latest' | 'pay-high')}
            className="h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
          >
            <option value="latest">เรียงตามประกาศล่าสุด</option>
            <option value="pay-high">เรียงตามค่าตอบแทนสูงสุด</option>
          </select>
        </div>
      </div>
    </div>
  );
}
