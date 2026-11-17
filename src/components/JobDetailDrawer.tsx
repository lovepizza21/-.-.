import { useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Calculator,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  PhoneCall,
  Wallet,
  X,
} from 'lucide-react';
import type { ApplicationStatus, JobListing, JobType } from '../types/job';

interface JobDetailDrawerProps {
  job: JobListing | null;
  isSaved: boolean;
  status: ApplicationStatus;
  onClose: () => void;
  onToggleSave: (jobId: string) => void;
  onStatusChange: (jobId: string, status: ApplicationStatus) => void;
  onSendToCalculator: (job: JobListing) => void;
}

const JOB_TYPE_LABEL: Record<JobType, string> = {
  'full-time': 'งานประจำ (Full-time)',
  'part-time': 'งานพาร์ทไทม์ (Part-time)',
  'daily-freelance': 'งานฟรีแลนซ์ / รายวัน',
};

const STATUS_OPTIONS: { id: ApplicationStatus; label: string }[] = [
  { id: 'none', label: 'ยังไม่สมัคร' },
  { id: 'applied', label: 'ส่งสมัครแล้ว' },
  { id: 'interview', label: 'นัดสัมภาษณ์' },
  { id: 'hired', label: 'ได้งานแล้ว' },
];

export function JobDetailDrawer({
  job,
  isSaved,
  status,
  onClose,
  onToggleSave,
  onStatusChange,
  onSendToCalculator,
}: JobDetailDrawerProps) {
  useEffect(() => {
    if (!job) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [job, onClose]);

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-job-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full overflow-y-auto border-l border-slate-200 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <span className="font-semibold text-teal-800">{job.province}</span>
                <span aria-hidden="true">·</span>
                <span>{job.district}</span>
                <span aria-hidden="true">·</span>
                <span>{JOB_TYPE_LABEL[job.jobType]}</span>
              </div>
              <h2
                id="drawer-job-title"
                className="text-xl font-bold text-slate-900 leading-snug"
              >
                {job.title}
              </h2>
              <p className="text-sm font-medium text-slate-700">{job.employer}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างรายละเอียด"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compensation & Key Facts */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                <span>ค่าตอบแทน</span>
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900 font-mono-num">
                {job.payDisplay}
              </div>
              {job.immediateCash && (
                <div className="mt-0.5 text-xs font-medium text-emerald-700">
                  จ่ายรายวัน / จบงานรับเงินไว
                </div>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>เวลาทำงาน</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {job.shiftHours}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                <span>
                  {job.district}, {job.province}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">รายละเอียดงาน</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">คุณสมบัติผู้สมัคร</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-teal-700 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Source */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>ช่องทางการสมัครและติดต่อ</span>
            </h3>
            <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              {job.contactChannel}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
              <span>แหล่งข้อมูล: {job.sourceName} · {job.postedAt}</span>
              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline"
                >
                  <span>เปิดลิงก์ประกาศต้นทาง</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Application Tracker */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">ติดตามสถานะการสมัครของคุณ</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onStatusChange(job.id, opt.id)}
                    className={`px-2.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-teal-50 border-teal-700 text-teal-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Bookmark className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isSaved ? 'บันทึกไว้แล้ว' : 'บันทึกงานนี้'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSendToCalculator(job)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calculator className="w-4 h-4" aria-hidden="true" />
            <span>ลองคำนวณรายได้จากงานนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
}
