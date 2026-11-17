import { useState } from 'react';
import { Calculator, Coins, RotateCcw } from 'lucide-react';
import type { JobListing } from '../types/job';

interface IncomeCalculatorProps {
  jobs: JobListing[];
  presetJob: JobListing | null;
}

export function IncomeCalculator({ jobs, presetJob }: IncomeCalculatorProps) {
  const initialMode: 'monthly' | 'hourly' =
    presetJob && presetJob.payCycle === 'ต่อชั่วโมง' ? 'hourly' : 'monthly';
  const initialMainPay =
    presetJob && presetJob.payCycle === 'ต่อเดือน'
      ? Math.round((presetJob.payMin + presetJob.payMax) / 2)
      : 15500;
  const initialHourly =
    presetJob && presetJob.payCycle === 'ต่อชั่วโมง'
      ? Math.round((presetJob.payMin + presetJob.payMax) / 2)
      : 70;
  const initialSideDaily =
    presetJob && (presetJob.payCycle === 'ต่อวัน' || presetJob.payCycle === 'ต่องาน')
      ? Math.round((presetJob.payMin + presetJob.payMax) / 2)
      : 600;

  const [mainMode, setMainMode] = useState<'monthly' | 'hourly'>(initialMode);
  const [monthlyBase, setMonthlyBase] = useState<number>(initialMainPay);
  const [hourlyRate, setHourlyRate] = useState<number>(initialHourly);
  const [hoursPerDay, setHoursPerDay] = useState<number>(5.5);
  const [partTimeDaysPerWeek, setPartTimeDaysPerWeek] = useState<number>(5);

  const [enableSideGig, setEnableSideGig] = useState<boolean>(true);
  const [sideDailyRate, setSideDailyRate] = useState<number>(initialSideDaily);
  const [sideDaysPerMonth, setSideDaysPerMonth] = useState<number>(8);
  const [extraOvertimeMonthly, setExtraOvertimeMonthly] = useState<number>(1500);

  const primaryMonthly =
    mainMode === 'monthly'
      ? monthlyBase
      : Math.round(hourlyRate * hoursPerDay * partTimeDaysPerWeek * 4.33);

  const sideMonthly = enableSideGig ? sideDailyRate * sideDaysPerMonth : 0;
  const totalMonthly = primaryMonthly + sideMonthly + extraOvertimeMonthly;
  const dailyAverage = Math.round(totalMonthly / 30);
  const annualTotal = totalMonthly * 12;

  const applyPresetFromJob = (jobId: string) => {
    const found = jobs.find((j) => j.id === jobId);
    if (!found) return;
    const mid = Math.round((found.payMin + found.payMax) / 2);
    if (found.payCycle === 'ต่อเดือน') {
      setMainMode('monthly');
      setMonthlyBase(mid);
    } else if (found.payCycle === 'ต่อชั่วโมง') {
      setMainMode('hourly');
      setHourlyRate(mid);
    } else {
      setEnableSideGig(true);
      setSideDailyRate(mid);
    }
  };

  const resetDefaults = () => {
    setMainMode('monthly');
    setMonthlyBase(15500);
    setHourlyRate(70);
    setHoursPerDay(5.5);
    setPartTimeDaysPerWeek(5);
    setEnableSideGig(true);
    setSideDailyRate(600);
    setSideDaysPerMonth(8);
    setExtraOvertimeMonthly(1500);
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-700" aria-hidden="true" />
              <span>วางแผนรายได้ฉบับไม่เลือกงานไม่ยากจน</span>
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              ลองจับคู่งานประจำหรือพาร์ทไทม์เข้ากับงานฟรีแลนซ์รายวันในเชียงใหม่–ลำพูน
              เพื่อคำนวณรายรับรวมต่อเดือน
            </p>
          </div>

          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>รีเซ็ตค่าเริ่มต้น</span>
          </button>
        </div>

        {/* Quick pick from live board */}
        <div>
          <label
            htmlFor="calc-job-preset"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            ดึงเรตค่าจ้างจากตำแหน่งงานในบอร์ดมาคำนวณทันที
          </label>
          <select
            id="calc-job-preset"
            defaultValue=""
            onChange={(e) => applyPresetFromJob(e.target.value)}
            className="w-full sm:max-w-lg h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
          >
            <option value="" disabled>
              เลือกตำแหน่งงานเพื่อโหลดอัตราค่าตอบแทน...
            </option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                [{j.province}] {j.title} — {j.payDisplay}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Primary Job */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">1. รายได้จากงานหลัก</h3>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMainMode('monthly')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      mainMode === 'monthly'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    เงินเดือนประจำ (Full-time)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainMode('hourly')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      mainMode === 'hourly'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    รายชั่วโมง (Part-time)
                  </button>
                </div>
              </div>

              {mainMode === 'monthly' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>เงินเดือนฐาน</span>
                    <span className="font-mono-num font-bold text-slate-900">
                      {monthlyBase.toLocaleString('th-TH')} บาท/เดือน
                    </span>
                  </div>
                  <input
                    type="range"
                    min={9000}
                    max={45000}
                    step={500}
                    value={monthlyBase}
                    onChange={(e) => setMonthlyBase(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      ค่าแรงต่อชั่วโมง (บาท)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={1000}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                      className="w-full h-9 px-3 text-sm font-mono-num border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      ชั่วโมงต่อวัน
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      step={0.5}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Math.max(1, Number(e.target.value)))}
                      className="w-full h-9 px-3 text-sm font-mono-num border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      วันทำงานต่อสัปดาห์
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={partTimeDaysPerWeek}
                      onChange={(e) =>
                        setPartTimeDaysPerWeek(Math.min(7, Math.max(1, Number(e.target.value))))
                      }
                      className="w-full h-9 px-3 text-sm font-mono-num border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Side Daily Freelance Gig */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  2. งานเสริม / ฟรีแลนซ์รายวัน (เสาร์–อาทิตย์ หรือวันว่าง)
                </h3>
                <button
                  type="button"
                  onClick={() => setEnableSideGig(!enableSideGig)}
                  className={`px-3 py-1 text-xs font-medium rounded-md border cursor-pointer ${
                    enableSideGig
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {enableSideGig ? 'เปิดใช้งานอยู่' : 'ปิดไว้'}
                </button>
              </div>

              {enableSideGig && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>ค่าจ้างรายวันเฉลี่ย</span>
                      <span className="font-mono-num font-bold text-slate-900">
                        {sideDailyRate.toLocaleString('th-TH')} บาท/วัน
                      </span>
                    </div>
                    <input
                      type="range"
                      min={350}
                      max={2500}
                      step={50}
                      value={sideDailyRate}
                      onChange={(e) => setSideDailyRate(Number(e.target.value))}
                      className="w-full accent-teal-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>จำนวนวันที่รับงาน/เดือน</span>
                      <span className="font-mono-num font-bold text-slate-900">
                        {sideDaysPerMonth} วัน/เดือน
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={sideDaysPerMonth}
                      onChange={(e) => setSideDaysPerMonth(Number(e.target.value))}
                      className="w-full accent-teal-700 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OT / Tips / Bonus */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  3. ค่าล่วงเวลา (OT) / เบี้ยขยัน / ทิป / ค่าคอมมิชชันต่อเดือน
                </span>
                <span className="font-mono-num font-bold text-slate-900">
                  {extraOvertimeMonthly.toLocaleString('th-TH')} บาท
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={12000}
                step={250}
                value={extraOvertimeMonthly}
                onChange={(e) => setExtraOvertimeMonthly(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-medium">
                <Coins className="w-4 h-4" aria-hidden="true" />
                <span>ประมาณการรายรับรวมของคุณ</span>
              </div>

              <div>
                <div className="text-xs text-slate-300">รายรับรวมต่อเดือน</div>
                <div className="mt-1 text-3xl sm:text-4xl font-bold font-mono-num text-white">
                  {totalMonthly.toLocaleString('th-TH')} บาท
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">งานหลัก ({mainMode === 'monthly' ? 'รายเดือน' : 'พาร์ทไทม์'})</span>
                  <span className="font-mono-num font-semibold">
                    {primaryMonthly.toLocaleString('th-TH')} บาท
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">งานเสริมรายวัน ({enableSideGig ? `${sideDaysPerMonth} วัน` : 'ไม่รวม'})</span>
                  <span className="font-mono-num font-semibold text-emerald-400">
                    +{sideMonthly.toLocaleString('th-TH')} บาท
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">โอที / เบี้ยขยัน / ทิป</span>
                  <span className="font-mono-num font-semibold text-teal-300">
                    +{extraOvertimeMonthly.toLocaleString('th-TH')} บาท
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">เฉลี่ยวันละ</div>
                <div className="mt-0.5 text-lg font-bold font-mono-num">
                  {dailyAverage.toLocaleString('th-TH')} บาท
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">สะสม 1 ปี</div>
                <div className="mt-0.5 text-lg font-bold font-mono-num">
                  {annualTotal.toLocaleString('th-TH')} บาท
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
