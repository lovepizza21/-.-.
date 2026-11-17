import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { FetchJobsRequest, GroundSource, JobCategory, JobListing, JobType, PayCycle, Province } from './src/types/job.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractJsonArray(rawText: string): unknown[] {
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    throw new Error('Could not parse structured job JSON array from search results.');
  }
  const slice = cleaned.slice(firstBracket, lastBracket + 1);
  const parsed = JSON.parse(slice);
  if (!Array.isArray(parsed)) {
    throw new Error('Parsed payload is not an array.');
  }
  return parsed;
}

const VALID_CATEGORIES: JobCategory[] = [
  'บริการ/คาเฟ่/ร้านอาหาร',
  'ช่าง/โรงงาน/โกดัง/ขนส่ง',
  'ค้าขาย/PC/แคชเชียร์',
  'ออฟฟิศ/บัญชี/แอดมิน',
  'ดิจิทัล/ครีเอทีฟ/สอนพิเศษ',
  'ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร',
];

function normalizeJobType(val: unknown): JobType {
  const s = String(val ?? '').toLowerCase();
  if (s.includes('part')) return 'part-time';
  if (s.includes('daily') || s.includes('freelance') || s.includes('รายวัน') || s.includes('ฟรีแลนซ์')) {
    return 'daily-freelance';
  }
  return 'full-time';
}

function normalizeProvince(val: unknown, fallback: 'all' | Province): Province {
  const s = String(val ?? '');
  if (s.includes('ลำพูน')) return 'ลำพูน';
  if (s.includes('เชียงใหม่')) return 'เชียงใหม่';
  return fallback === 'ลำพูน' ? 'ลำพูน' : 'เชียงใหม่';
}

function normalizeCategory(val: unknown): JobCategory {
  const s = String(val ?? '');
  const exact = VALID_CATEGORIES.find((c) => c === s);
  if (exact) return exact;
  if (s.includes('กาแฟ') || s.includes('อาหาร') || s.includes('บริการ') || s.includes('โรงแรม')) {
    return 'บริการ/คาเฟ่/ร้านอาหาร';
  }
  if (s.includes('โรงงาน') || s.includes('ช่าง') || s.includes('ขนส่ง') || s.includes('คลัง') || s.includes('โกดัง')) {
    return 'ช่าง/โรงงาน/โกดัง/ขนส่ง';
  }
  if (s.includes('ขาย') || s.includes('แคชเชียร์') || s.includes('PC')) {
    return 'ค้าขาย/PC/แคชเชียร์';
  }
  if (s.includes('ออฟฟิศ') || s.includes('บัญชี') || s.includes('แอดมิน')) {
    return 'ออฟฟิศ/บัญชี/แอดมิน';
  }
  if (s.includes('ดิจิทัล') || s.includes('กราฟิก') || s.includes('สอน') || s.includes('โปรแกรม')) {
    return 'ดิจิทัล/ครีเอทีฟ/สอนพิเศษ';
  }
  return 'ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร';
}

function normalizePayCycle(val: unknown, jobType: JobType): PayCycle {
  const s = String(val ?? '');
  if (s.includes('ชั่วโมง') || s.includes('ชม')) return 'ต่อชั่วโมง';
  if (s.includes('วัน')) return 'ต่อวัน';
  if (s.includes('งาน') || s.includes('ชิ้น') || s.includes('ครั้ง')) return 'ต่องาน';
  if (s.includes('เดือน')) return 'ต่อเดือน';
  if (jobType === 'daily-freelance') return 'ต่อวัน';
  if (jobType === 'part-time') return 'ต่อชั่วโมง';
  return 'ต่อเดือน';
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.post('/api/jobs/fetch', async (req, res) => {
    try {
      const body = (req.body ?? {}) as Partial<FetchJobsRequest>;
      const province: 'all' | Province =
        body.province === 'เชียงใหม่' || body.province === 'ลำพูน' ? body.province : 'all';
      const jobType: 'all' | JobType =
        body.jobType === 'full-time' || body.jobType === 'part-time' || body.jobType === 'daily-freelance'
          ? body.jobType
          : 'all';
      const category = body.category ?? 'all';
      const keyword = (body.keyword ?? '').trim();

      const provinceLabel =
        province === 'all' ? 'จังหวัดเชียงใหม่ และ จังหวัดลำพูน (รวมนิคมอุตสาหกรรมภาคเหนือ)' : `จังหวัด${province}`;
      const typeLabel =
        jobType === 'all'
          ? 'ทั้งงานประจำ Full-time, งาน Part-time และงานฟรีแลนซ์/งานรับจ้างรายวัน'
          : jobType === 'full-time'
            ? 'งานประจำ Full-time'
            : jobType === 'part-time'
              ? 'งานพาร์ทไทม์ Part-time'
              : 'งานฟรีแลนซ์และงานรับจ้างรายวัน';
      const categoryHint = category && category !== 'all' ? `หมวดหมู่เน้น: ${category}` : '';
      const keywordHint = keyword ? `คำค้นหาเฉพาะ: "${keyword}"` : '';

      const prompt = `ค้นหาประกาศรับสมัครงานจริงและตำแหน่งงานว่างล่าสุดในปัจจุบัน บนเว็บไซต์หางานไทย (เช่น JobThai, JobsDB, JobBKK, ThaiJob, CM108, Fastwork, ประกาศรับสมัครงานในพื้นที่) สำหรับ:
- พื้นที่: ${provinceLabel}
- ประเภท: ${typeLabel}
${categoryHint ? `- ${categoryHint}` : ''}
${keywordHint ? `- ${keywordHint}` : ''}

แนวคิด "ไม่เลือกงานไม่ยากจน" ให้ครอบคลุมงานสุจริตที่เปิดรับสมัครจริงหลากหลายระดับ ตั้งแต่งานโรงงาน/คลังสินค้า/ช่าง/บาริสต้า/แม่บ้าน/ขนส่ง/แอดมิน ไปจนถึงงานพาร์ทไทม์และงานฟรีแลนซ์รายวัน

โปรดตอบกลับเป็น JSON Array เท่านั้น (ห้ามอธิบายนอก JSON) จำนวน 6 ถึง 8 ตำแหน่ง โดยแต่ละรายการต้องมีโครงสร้างดังนี้:
[
  {
    "title": "ชื่อตำแหน่งงาน (ภาษาไทย ชัดเจน)",
    "employer": "ชื่อบริษัท ร้านค้า หรือผู้จ้างจริงจากผลค้นหา",
    "province": "เชียงใหม่" หรือ "ลำพูน",
    "district": "อำเภอหรือย่าน เช่น เมืองเชียงใหม่, นิมมาน, สันทราย, หางดง, นิคมอุตสาหกรรมภาคเหนือ, เมืองลำพูน",
    "jobType": "full-time" | "part-time" | "daily-freelance",
    "category": "หนึ่งใน: บริการ/คาเฟ่/ร้านอาหาร | ช่าง/โรงงาน/โกดัง/ขนส่ง | ค้าขาย/PC/แคชเชียร์ | ออฟฟิศ/บัญชี/แอดมิน | ดิจิทัล/ครีเอทีฟ/สอนพิเศษ | ดูแลผู้สูงอายุ/แม่บ้าน/เกษตร",
    "payMin": ตัวเลขค่าตอบแทนขั้นต่ำเป็นบาท (number),
    "payMax": ตัวเลขค่าตอบแทนสูงสุดเป็นบาท (number),
    "payCycle": "ต่อเดือน" | "ต่อวัน" | "ต่อชั่วโมง" | "ต่องาน",
    "payDisplay": "ข้อความแสดงค่าตอบแทน เช่น 15,000–18,000 บาท/เดือน หรือ 500–650 บาท/วัน",
    "immediateCash": true หากเป็นงานรายวัน/รับเงินไวหลังจบงาน มิฉะนั้น false,
    "urgent": true หากเปิดรับด่วน มิฉะนั้น false,
    "shiftHours": "เวลาทำงาน เช่น 08:30–17:30 น. หรือ ตามกะ",
    "postedAt": "ระบุเวลาประกาศจากผลค้นหา เช่น ล่าสุดวันนี้ หรือ เมื่อ 1 วันที่แล้ว",
    "description": "สรุปลักษณะงานและความรับผิดชอบสั้นๆ 2-3 ประโยค",
    "requirements": ["คุณสมบัติข้อ 1", "คุณสมบัติข้อ 2"],
    "contactChannel": "ช่องทางการสมัครหรือติดต่อที่ระบุในประกาศ",
    "sourceName": "ชื่อเว็บไซต์หรือแหล่งที่มาของประกาศ เช่น JobThai, CM108, JobBKK",
    "sourceUrl": "ลิงก์ URL ของแหล่งประกาศหากมี"
  }
]`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = response.text ?? '';
      const rawItems = extractJsonArray(rawText);

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: GroundSource[] = [];
      const seenUris = new Set<string>();
      for (const chunk of groundingChunks) {
        const web = (chunk as { web?: { uri?: string; title?: string } }).web;
        if (web?.uri && !seenUris.has(web.uri)) {
          seenUris.add(web.uri);
          sources.push({
            title: web.title || web.uri,
            uri: web.uri,
          });
        }
      }

      const nowStamp = Date.now();
      const jobs: JobListing[] = rawItems.map((item, idx) => {
        const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const normalizedType = normalizeJobType(obj.jobType);
        const normalizedProvince = normalizeProvince(obj.province, province);
        const payCycle = normalizePayCycle(obj.payCycle, normalizedType);
        const payMin = Number(obj.payMin) > 0 ? Number(obj.payMin) : normalizedType === 'daily-freelance' ? 500 : normalizedType === 'part-time' ? 60 : 15000;
        const payMax = Number(obj.payMax) >= payMin ? Number(obj.payMax) : payMin;

        return {
          id: `live-${nowStamp}-${idx}`,
          title: String(obj.title || 'ตำแหน่งงานว่างในพื้นที่').trim(),
          employer: String(obj.employer || 'ผู้ประกอบการท้องถิ่น').trim(),
          province: normalizedProvince,
          district: String(obj.district || (normalizedProvince === 'ลำพูน' ? 'เมืองลำพูน' : 'เมืองเชียงใหม่')).trim(),
          jobType: normalizedType,
          category: normalizeCategory(obj.category),
          payMin,
          payMax,
          payCycle,
          payDisplay: String(
            obj.payDisplay ||
              (payMin === payMax
                ? `${payMin.toLocaleString('th-TH')} บาท/${payCycle.replace('ต่อ', '')}`
                : `${payMin.toLocaleString('th-TH')}–${payMax.toLocaleString('th-TH')} บาท/${payCycle.replace('ต่อ', '')}`)
          ),
          immediateCash: Boolean(obj.immediateCash ?? normalizedType === 'daily-freelance'),
          urgent: Boolean(obj.urgent ?? idx < 3),
          shiftHours: String(obj.shiftHours || 'ตามตกลง / เวลาทำการปกติ').trim(),
          postedAt: String(obj.postedAt || 'ดึงข้อมูลล่าสุดจากเว็บ').trim(),
          description: String(obj.description || 'ตำแหน่งงานเปิดรับสมัครในพื้นที่จังหวัดเชียงใหม่และลำพูน').trim(),
          requirements: Array.isArray(obj.requirements)
            ? obj.requirements.map((r) => String(r)).filter(Boolean).slice(0, 5)
            : ['ขยัน ซื่อสัตย์ มีความรับผิดชอบ ไม่เกี่ยงงาน'],
          contactChannel: String(obj.contactChannel || 'ดูรายละเอียดเพิ่มเติมจากแหล่งประกาศต้นทาง').trim(),
          sourceName: String(obj.sourceName || 'Web Search Grounding').trim(),
          sourceUrl: typeof obj.sourceUrl === 'string' && obj.sourceUrl.startsWith('http')
            ? obj.sourceUrl
            : sources[idx % Math.max(1, sources.length)]?.uri,
          sourceType: 'live-web',
        };
      });

      const responsePayload: {
        jobs: JobListing[];
        sources: GroundSource[];
        fetchedAt: string;
        summary: string;
      } = {
        jobs,
        sources,
        fetchedAt: new Date().toISOString(),
        summary: `ดึงตำแหน่งงานจริง ${jobs.length} ตำแหน่ง (${province === 'all' ? 'เชียงใหม่ & ลำพูน' : province}) จากแหล่งข้อมูลออนไลน์ล่าสุด`,
      };

      res.json(responsePayload);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error while fetching live jobs';
      console.error('Error in /api/jobs/fetch:', errMsg);
      const isQuotaError = errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429');
      const isKeyError =
        errMsg.includes('API_KEY') ||
        errMsg.includes('GEMINI_API_KEY') ||
        errMsg.includes('PERMISSION_DENIED');
      const statusCode = isQuotaError ? 429 : isKeyError ? 403 : 502;
      const userMessage = isQuotaError
        ? 'โควต้าการดึงข้อมูลจากเว็บแบบเรียลไทม์เต็มชั่วคราว สามารถใช้งานรายการงานเชียงใหม่–ลำพูนที่มีอยู่ หรือลงประกาศงานได้ตามปกติ'
        : isKeyError
          ? 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือสิทธิ์คีย์ไม่ถูกต้องใน Settings > Secrets'
          : 'ไม่สามารถดึงตำแหน่งงานสดจากเว็บได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
      res.status(statusCode).json({
        error: errMsg,
        message: userMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
