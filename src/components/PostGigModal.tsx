import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { CHIANG_MAI_DISTRICTS, LAMPHUN_DISTRICTS } from '../data/initialJobs';
import type { JobCategory, JobListing, JobType, PayCycle, Province } from '../types/job';

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: JobListing) => void;
}

const CATEGORIES: JobCategory[] = [
  'บริการ/คาเฟ่/ร้านอาหาร',
  'ช่าง/โรงงาน/โกดัง/ขนส่ง',
  'ค้าขาย/PC/แคชเชียร์',
  'ออฟฟิศ/บัญชี/แอดมิน',
  'ดิจิทัล/ครีเอทีฟ/สอนพิเศษ',
  'ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร',
];

export function PostGigModal({ isOpen, onClose, onSubmit }: PostGigModalProps) {
  const [title, setTitle] = useState('');
  const [employer, setEmployer] = useState('');
  const [province, setProvince] = useState<Province>('เชียงใหม่');
  const [district, setDistrict] = useState(CHIANG_MAI_DISTRICTS[0]);
  const [jobType, setJobType] = useState<JobType>('daily-freelance');
  const [category, setCategory] = useState<JobCategory>('บริการ/คาเฟ่/ร้านอาหาร');
  const [payMin, setPayMin] = useState('500');
  const [payMax, setPayMax] = useState('700');
  const [payCycle, setPayCycle] = useState<PayCycle>('ต่อวัน');
  const [shiftHours, setShiftHours] = useState('08:30–17:30 น.');
  const [description, setDescription] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [immediateCash, setImmediateCash] = useState(true);
  const [urgent, setUrgent] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const districtList = province === 'เชียงใหม่' ? CHIANG_MAI_DISTRICTS : LAMPHUN_DISTRICTS;

  const handleProvinceChange = (nextProv: Province) => {
    setProvince(nextProv);
    setDistrict(nextProv === 'เชียงใหม่' ? CHIANG_MAI_DISTRICTS[0] : LAMPHUN_DISTRICTS[0]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !employer.trim() || !contactChannel.trim()) {
      setErrorMsg('กรุณากรอกชื่อตำแหน่งงาน ชื่อร้าน/ผู้จ้าง และช่องทางติดต่อให้ครบถ้วน');
      return;
    }

    const minNum = Math.max(50, Number(payMin) || 500);
    const maxNum = Math.max(minNum, Number(payMax) || minNum);
    const unitLabel = payCycle.replace('ต่อ', '');

    const newJob: JobListing = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      employer: employer.trim(),
      province,
      district,
      jobType,
      category,
      payMin: minNum,
      payMax: maxNum,
      payCycle,
      payDisplay:
        minNum === maxNum
          ? `${minNum.toLocaleString('th-TH')} บาท/${unitLabel}`
          : `${minNum.toLocaleString('th-TH')}–${maxNum.toLocaleString('th-TH')} บาท/${unitLabel}`,
      immediateCash,
      urgent,
      shiftHours: shiftHours.trim() || 'ตามตกลง',
      postedAt: 'โพสต์เมื่อสักครู่',
      description:
        description.trim() ||
        'เปิดรับคนทำงานจริงจัง มีความรับผิดชอบ ไม่เกี่ยงงาน สามารถติดต่อสอบถามรายละเอียดเพิ่มเติมได้ทันที',
      requirements: ['ขยัน ซื่อสัตย์ ตรงต่อเวลา', 'พร้อมทำงานในพื้นที่ที่ระบุ'],
      contactChannel: contactChannel.trim(),
      sourceName: 'ประกาศชุมชนลานนา',
      sourceType: 'community',
    };

    onSubmit(newJob);
    setTitle('');
    setEmployer('');
    setDescription('');
    setContactChannel('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-gig-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="post-gig-title" className="text-lg font-bold text-slate-900">
              ลงประกาศรับคนทำงาน (เชียงใหม่–ลำพูน)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              รองรับทั้งงานประจำ พาร์ทไทม์ และงานรายวันรับเงินสด
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อตำแหน่งงาน *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น พนักงานล้างจาน/ช่วยครัว, ช่างทาสีรายวัน, แอดมินเพจ"
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อร้าน / บริษัท / ผู้จ้าง *
              </label>
              <input
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                placeholder="เช่น ร้านก๋วยเตี๋ยวบ้านสวน"
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่อาชีพ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จังหวัด
              </label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value as Province)}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="เชียงใหม่">เชียงใหม่</option>
                <option value="ลำพูน">ลำพูน</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อำเภอ / ย่าน
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทงาน
              </label>
              <select
                value={jobType}
                onChange={(e) => {
                  const next = e.target.value as JobType;
                  setJobType(next);
                  if (next === 'full-time') {
                    setPayCycle('ต่อเดือน');
                    setPayMin('15000');
                    setPayMax('18000');
                    setImmediateCash(false);
                  } else if (next === 'part-time') {
                    setPayCycle('ต่อชั่วโมง');
                    setPayMin('60');
                    setPayMax('80');
                  } else {
                    setPayCycle('ต่อวัน');
                    setPayMin('500');
                    setPayMax('700');
                    setImmediateCash(true);
                  }
                }}
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="daily-freelance">ฟรีแลนซ์รายวัน / งานเหมา</option>
                <option value="part-time">Part-time (พาร์ทไทม์)</option>
                <option value="full-time">Full-time (ประจำ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาทำงาน
              </label>
              <input
                type="text"
                value={shiftHours}
                onChange={(e) => setShiftHours(e.target.value)}
                placeholder="เช่น 08:30–17:30 น."
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าจ้างต่ำสุด (บาท)
                </label>
                <input
                  type="number"
                  value={payMin}
                  onChange={(e) => setPayMin(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono-num border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ค่าจ้างสูงสุด (บาท)
                </label>
                <input
                  type="number"
                  value={payMax}
                  onChange={(e) => setPayMax(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono-num border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รอบจ่าย
                </label>
                <select
                  value={payCycle}
                  onChange={(e) => setPayCycle(e.target.value as PayCycle)}
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  <option value="ต่อวัน">ต่อวัน</option>
                  <option value="ต่อชั่วโมง">ต่อชั่วโมง</option>
                  <option value="ต่อเดือน">ต่อเดือน</option>
                  <option value="ต่องาน">ต่องาน</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดงาน
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายลักษณะงาน สวัสดิการ ค่าอาหาร หรือจุดนัดพบ..."
                className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ช่องทางติดต่อ / สมัครงาน *
              </label>
              <input
                type="text"
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value)}
                placeholder="เช่น โทร 081-xxx-xxxx หรือ Line ID: @shopname"
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={immediateCash}
                  onChange={(e) => setImmediateCash(e.target.checked)}
                  className="w-4 h-4 accent-teal-700"
                />
                <span>จ่ายเงินสด / โอนไวหลังจบงาน</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 accent-teal-700"
                />
                <span>เปิดรับด่วน (พร้อมเริ่มงานทันที)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
            >
              ลงประกาศทันที
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
