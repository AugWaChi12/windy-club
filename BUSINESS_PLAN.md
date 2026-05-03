# Windy Club — Business Plan

## 🎯 สรุปธุรกิจ

**Windy Club** คือแพลตฟอร์มสร้าง Sticker ด้วย AI สำหรับตลาดไทย
- ผู้ใช้พิมพ์ภาษาไทยหรืออังกฤษ → AI วาด Sticker ให้ทันทีใน 1-2 วินาที
- 5 สไตล์: Kawaii, Anime, Comic, Minimal, Pixel
- Batch generation สูงสุด 4 รูปพร้อมกัน (AI สร้างท่าทางแตกต่างกัน)

---

## 💰 Revenue Streams (3 ช่องทาง)

### 1. Subscription — Pro Plan ฿199/เดือน
| | Free | Pro (฿199/เดือน) |
|--|------|------------------|
| สร้างได้ | 3 รูป/วัน | 30 รูป/วัน |
| Batch | สูงสุด 2 รูป | สูงสุด 4 รูป |
| โฆษณา | มี | ไม่มี |
| AI Varied Poses | ✓ | ✓ |

**ต้นทุนต่อ Pro user**: ~฿99/เดือน (30 รูป × ฿3.3)
**กำไรต่อ Pro user**: ~฿100/เดือน (margin 50%)

**เป้าหมาย:**
- เดือน 1-3: 10 Pro users = ฿1,990/เดือน
- เดือน 4-6: 50 Pro users = ฿9,950/เดือน
- เดือน 7-12: 200 Pro users = ฿39,800/เดือน

### 2. Advertising — ขายพื้นที่โฆษณา
| ตำแหน่ง | ราคา | หมายเหตุ |
|---------|------|----------|
| หน้าแรก Hero | ฿500/สัปดาห์ | ทุกคนเห็น |
| หน้าสร้าง บน Gallery | ฿800/สัปดาห์ | ผู้ใช้งาน active |
| หน้าสร้าง ใต้ Gallery | ฿800/สัปดาห์ | ผู้ใช้งาน active |

**ระบบ:** โฆษณาหมุนวน (carousel) ทุก 5 วินาที + track impressions/clicks
**เป้าหมาย:** เริ่มขายเมื่อมี 500+ DAU

**รายได้โฆษณา (เป้า):**
- 3 ตำแหน่ง × ฿700 เฉลี่ย × 4 สัปดาห์ = ฿8,400/เดือน

### 3. Future — Sticker Pack Marketplace (Phase 2)
- ผู้ใช้สร้าง Sticker Pack ขายบน platform
- Windy Club เก็บค่าคอม 20%
- เชื่อมกับ LINE Sticker / iMessage Stickers

---

## 📊 Cost Structure

### Fixed Costs (ต่อเดือน)
| รายการ | ค่าใช้จ่าย |
|--------|-----------|
| Supabase (Free tier) | ฿0 |
| Vercel (Free/Pro) | ฿0 - ฿700 |
| Domain (windy-club.com) | ~฿50 |
| **รวม** | **~฿50 - ฿750** |

### Variable Costs
| รายการ | ราคา |
|--------|------|
| Replicate (Flux Schnell) | ~฿0.1/รูป ($0.003) |
| Groq (Llama 3.3 70B) | ฿0 (Free tier) |
| Supabase Storage | Free ถึง 1GB |

### Break-even Analysis
- ต้นทุนต่ำมาก (~฿750 fixed + variable)
- Break-even: ~4 Pro users หรือ โฆษณา 1 ตำแหน่ง/สัปดาห์

---

## 🎯 Target Audience

1. **คนไทย Gen Z/Millennial** — ชอบ Sticker, ใช้ LINE, IG Stories
2. **ร้านค้าออนไลน์** — อยากได้ mascot/sticker สำหรับ branding
3. **Content Creator** — ต้องการ asset สำหรับ video/post
4. **คู่รัก/เพื่อนกลุ่ม** — สร้าง sticker กลุ่ม/คู่

---

## 📈 Growth Strategy

### Phase 1: Launch (เดือน 1-2)
- [ ] Deploy บน Vercel + Custom domain
- [ ] SEO: "สร้าง sticker AI", "AI sticker ฟรี"
- [ ] โพสต์ตัวอย่าง sticker บน Twitter/X, IG, TikTok
- [ ] ลง Pantip, Dek-D, Facebook Groups
- [ ] Google OAuth + Social login

### Phase 2: Growth (เดือน 3-6)
- [ ] Referral program: ชวนเพื่อน ได้ฟรีเพิ่ม 2 รูป/วัน
- [ ] Sticker of the Day — showcase บนหน้าแรก
- [ ] Community gallery (แชร์ sticker สาธารณะ)
- [ ] ระบบ collection/album
- [ ] เริ่มขายโฆษณา
- [ ] Stripe live mode + PromptPay

### Phase 3: Expand (เดือน 7-12)
- [ ] Sticker Pack marketplace
- [ ] LINE Sticker export
- [ ] API สำหรับ developer
- [ ] B2B: ร้านค้าสร้าง branded sticker set
- [ ] ภาษาอื่น: อังกฤษ, ญี่ปุ่น, เกาหลี

---

## 🔧 Tech Stack (Current)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS v4, TypeScript |
| Auth | Supabase Auth (Email + OAuth) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI Image | Replicate (Flux Schnell) |
| AI Text | Groq (Llama 3.3 70B) |
| Payment | Stripe |
| Hosting | Vercel (planned) |
| Domain | windy-club.com (Squarespace) |

---

## 🛡️ Competitive Advantage

1. **ภาษาไทย** — คู่แข่ง (Midjourney, DALL-E) ไม่รองรับไทยดี
2. **เร็วมาก** — 1-2 วินาที vs คู่แข่ง 10-30 วินาที
3. **ราคาถูก** — ฿199/เดือน vs Midjourney $10/เดือน
4. **Sticker-focused** — UX ออกแบบมาเพื่อ sticker โดยเฉพาะ
5. **Batch + Varied Poses** — กดทีเดียวได้หลายท่า

---

## 📋 TODO — Priority

### Critical (ก่อน launch)
- [ ] Vercel deployment
- [ ] Custom domain setup (windy-club.com)
- [ ] Google OAuth
- [ ] Stripe live mode + webhook secret
- [ ] ทดสอบ flow จ่ายเงินจริง
- [ ] Privacy Policy + Terms of Service

### Important (สัปดาห์แรก)
- [ ] Google Analytics / Plausible
- [ ] OpenGraph meta tags สำหรับ share
- [ ] Mobile responsive ตรวจสอบ
- [ ] Error monitoring (Sentry)
- [ ] PromptPay สำหรับโฆษณา

### Nice to have
- [ ] PWA (install บนมือถือ)
- [ ] Share sticker ไป LINE/IG โดยตรง
- [ ] Watermark สำหรับ free tier
- [ ] Email welcome sequence

---

## 📞 Contact

- Email: supakorn@windy-club.com
- GitHub: github.com/AugWaChi12/windy-club
- Domain: windy-club.com
