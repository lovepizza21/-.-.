export type Province = 'เชียงใหม่' | 'ลำพูน';

export type JobType = 'full-time' | 'part-time' | 'daily-freelance';

export type PayCycle = 'ต่อเดือน' | 'ต่อวัน' | 'ต่อชั่วโมง' | 'ต่องาน';

export type JobCategory =
  | 'บริการ/คาเฟ่/ร้านอาหาร'
  | 'ช่าง/โรงงาน/โกดัง/ขนส่ง'
  | 'ค้าขาย/PC/แคชเชียร์'
  | 'ออฟฟิศ/บัญชี/แอดมิน'
  | 'ดิจิทัล/ครีเอทีฟ/สอนพิเศษ'
  | 'ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร';

export type ApplicationStatus =
  | 'none'
  | 'applied'
  | 'interview'
  | 'hired';

export interface GroundSource {
  title: string;
  uri: string;
}

export interface JobListing {
  id: string;
  title: string;
  employer: string;
  province: Province;
  district: string;
  jobType: JobType;
  category: JobCategory;
  payMin: number;
  payMax: number;
  payCycle: PayCycle;
  payDisplay: string;
  immediateCash: boolean;
  urgent: boolean;
  shiftHours: string;
  postedAt: string;
  description: string;
  requirements: string[];
  contactChannel: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: 'live-web' | 'directory' | 'community';
}

export interface FetchJobsRequest {
  province: 'all' | Province;
  jobType: 'all' | JobType;
  category: 'all' | JobCategory;
  keyword: string;
}

export interface FetchJobsResponse {
  jobs: JobListing[];
  sources: GroundSource[];
  fetchedAt: string;
  summary: string;
}
