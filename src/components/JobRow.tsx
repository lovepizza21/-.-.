import { Bookmark, BookmarkCheck, Clock, ExternalLink, Flame, Globe, Wallet } from 'lucide-react';
import type { ApplicationStatus, JobListing, JobType } from '../types/job';

interface JobRowProps {
  job: JobListing;
  isSaved: boolean;
  status: ApplicationStatus;
  onSelect: (job: JobListing) => void;
  onToggleSave: (jobId: string) => void;
}

const JOB_TYPE_LABEL: Record<JobType, string> = {
  'full-time': 'Full-time (ประจำ)',
  'part-time': 'Part-time (พาร์ทไทม์)',
  'daily-freelance': 'ฟรีแลนซ์รายวัน',
};

const STATUS_TEXT: Record<ApplicationStatus, string> = {
  none: '',
  applied: 'สถานะ: ส่งใบสมัครแล้ว',
  interview: 'สถานะ: นัดสัมภาษณ์',
  hired: 'สถานะ: เริ่มงานแล้ว',
};

export function JobRow({
  job,
  isSaved,
  status,
  onSelect,
  onToggleSave,
}: JobRowProps) {
  return (
    <article className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left: Kicker + Title + Description */}
        <div className="min-w-0 flex-1 space-y-2">
          {/* Unboxed clean typographic metadata kicker */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{job.province}</span>
            <span aria-hidden="true">·</span>
            <span>{job.district}</span>
            <span aria-hidden="true">·</span>
            <span>{JOB_TYPE_LABEL[job.jobType]}</span>
            <span aria-hidden="true">·</span>
            <span>{job.category}</span>
            <span aria-hidden="true">·</span>
            <span>{job.postedAt}</span>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onSelect(job)}
              className="text-left text-base sm:text-lg font-bold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {job.title}
            </button>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
              <span className="font-medium">{job.employer}</span>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{job.shiftHours}</span>
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          {/* Subtle unboxed status & provenance line */}
          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {job.immediateCash && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                <span>รับเงินรายวัน / เงินไว</span>
              </span>
            )}
            {job.urgent && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                <span>เปิดรับด่วน</span>
              </span>
            )}
            {job.sourceType === 'live-web' && (
              <span className="inline-flex items-center gap-1 font-medium text-teal-700">
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span>ดึงข้อมูลสด: {job.sourceName}</span>
              </span>
            )}
            {job.sourceType === 'community' && (
              <span className="font-medium text-slate-600">
                ประกาศโดยผู้ประกอบการในพื้นที่
              </span>
            )}
            {status !== 'none' && (
              <span className="font-semibold text-teal-800">
                {STATUS_TEXT[status]}
              </span>
            )}
          </div>
        </div>

        {/* Right: Tabular Wage + Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 md:min-w-[200px] pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <div className="text-base sm:text-lg font-bold text-slate-900 font-mono-num">
              {job.payDisplay}
            </div>
            <div className="text-xs text-slate-500">
              แหล่งประกาศ: {job.sourceName}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              aria-label={isSaved ? 'นำออกจากงานที่บันทึก' : 'บันทึกงานนี้'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                isSaved
                  ? 'bg-teal-50 border-teal-700 text-teal-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelect(job)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <span>ดูรายละเอียด</span>
              {job.sourceUrl && (
                <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
