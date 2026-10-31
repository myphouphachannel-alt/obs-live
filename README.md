# 🎬 OBS LOWER THIRD CONTROL PANEL

ระบบควบคุมและจัดการป้ายชื่อบุคคล (Lower Third) ระดับมืออาชีพสำหรับการถ่ายทอดสดผ่าน **OBS Studio** แบบ Real-time 100% ผ่าน WebSocket พร้อมรองรับการเปิดใช้งานเป็น **Custom Browser Dock** ภายใน OBS Studio โดยไม่ต้องสลับหน้าจอ และรองรับภาษาไทย ภาษาลาว และภาษาอังกฤษ

---

## 🌟 จุดเด่นของระบบ (Key Features)

- ⚡ **Real-Time 100% WebSocket**: ส่งคำสั่งขึ้นจอ (PLAY) และซ่อน (HIDE) ได้ทันทีโดยไม่มีการหน่วงเวลา
- 🖥️ **OBS Custom Browser Dock**: ฝังหน้าต่างควบคุมเข้าไปอยู่ในตัวโปรแกรม OBS Studio ได้โดยตรง ลากจัดวางติดขอบจอได้ตามสะดวก
- 🎨 **100% Transparent Overlay (`/overlay`)**: หน้า Overlay โปร่งใสสมบูรณ์แบบ ไร้ปุ่ม ไร้แถบเลื่อน (Scrollbar) ไร้พื้นหลังสีดำ พร้อมใช้ใน OBS Browser Source
- 🎭 **Broadcast-Grade Presets**: รูปแบบป้ายชื่อระดับสตูดิโอทีวี 5 สไตล์:
  1. **Modern Gradient**: แถบสีไล่เฉดหรูหราพร้อมเส้นไฟเรืองแสง
  2. **Broadcast Glass**: กระจกฝ้าโปร่งแสงโมเดิร์น (Glassmorphism) สไตล์ช่องข่าวสากล
  3. **News Ribbon**: ริบบิ้นข่าว 2 ระดับ สไตล์ Breaking News ทันสมัย
  4. **Minimal Solid**: มินิมอล อ่านง่าย คมชัด เหมาะกับงานประชุมสัมมนา
  5. **Cyber Neon**: ขอบไฟนีออน สไตล์ eSports และ Gaming Stream
- 👤 **People Management**: ระบบจัดการรายชื่อบุคคล เพิ่ม, ลบ, แก้ไข, ค้นหา, จัดหมวดหมู่, จัดเรียงลำดับ, พร้อมอัปโหลดรูปโปรไฟล์หรือโลโก้
- 🎞️ **Broadcast Animations**: เลือกลักษณะ Animation ได้หลากหลาย (Slide In Left, Slide In Right, Slide Up, Fade In, Zoom In, 3D Flip In) พร้อมปรับความเร็วได้ 300ms, 500ms, 800ms
- ⏱️ **Auto-Hide System**: ระบบนับเวลาถอยหลังซ่อนป้ายชื่ออัตโนมัติ (3 - 30 วินาที)
- 💾 **Persistent JSON Database**: ข้อมูลรายชื่อและค่าการปรับแต่งทั้งหมดบันทึกอัตโนมัติ ไม่สูญหายเมื่อปิดโปรแกรม พร้อมระบบ Export/Import ไฟล์สำรองข้อมูล (JSON Backup)
- 🔤 **Multilingual Typography**: รองรับฟอนต์ชั้นนำ Prompt, Kanit, Sarabun, Inter, Noto Sans Lao (ພາສາລາວ)

---

## 🚀 วิธีเริ่มต้นใช้งาน (Quick Start)

### วิธีที่ 1: ติดตั้งและใช้งานผ่าน Vercel (Cloud Deployment) 🚀
ระบบได้เพิ่มไฟล์คอนฟิก `vercel.json` และ Serverless API (`api/index.ts`) ให้เรียบร้อยแล้ว:
1. เชื่อมต่อ Git Repository กับ **Vercel**
2. ตั้งค่าการ Build บน Vercel:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. เมื่อ Deploy สำเร็จ คุณจะได้ URL ของ Vercel เช่น:
   - **Control Panel (สำหรับใส่ใน OBS Dock)**: `https://your-app.vercel.app/`
   - **Overlay (สำหรับใส่ใน OBS Browser Source)**: `https://your-app.vercel.app/overlay`
4. **ระบบ Real-Time บน Vercel**: รองรับการสื่อสารแบบ Real-time (0ms) ทันทีระหว่าง OBS Dock และ OBS Browser Source ผ่านมาตรฐาน `BroadcastChannel API` และ Serverless REST API

---

### วิธีที่ 2: รันด้วย start.bat (สำหรับ Windows 10/11 ในเครื่อง)
เพียงดับเบิลคลิกที่ไฟล์ **`start.bat`**
- ระบบจะตรวจสอบ Node.js อัตโนมัติ
- เริ่มต้นเซิร์ฟเวอร์บนพอร์ต 3000
- เปิดหน้าต่าง Control Panel บน Browser อัตโนมัติ

### วิธีที่ 3: รันผ่าน Terminal / Command Prompt
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรันเซิร์ฟเวอร์
npm run dev
```

เมื่อระบบเริ่มทำงาน:
- **Control Panel**: [http://localhost:3000/](http://localhost:3000/)
- **OBS Overlay**: [http://localhost:3000/overlay](http://localhost:3000/overlay)

---

## 📺 คู่มือการเชื่อมต่อกับ OBS Studio (OBS Integration Guide)

### ส่วนที่ 1: วิธีเพิ่มหน้าต่างควบคุมใน OBS (Custom Browser Dock)
คุณสามารถนำหน้า Control Panel เข้าไปฝังในโปรแกรม OBS Studio เพื่อควบคุมได้ในหน้าต่างเดียว:

1. เปิดโปรแกรม **OBS Studio**
2. ไปที่เมนูด้านบน คลิก **Docks** > **Custom Browser Docks...**
3. ในตาราง:
   - ช่อง **Dock Name**: ตั้งชื่อ เช่น `LOWER THIRD CONTROL`
   - ช่อง **URL**: กรอก `http://localhost:3000/`
4. คลิก **Apply**
5. หน้าต่าง Control Panel จะปรากฏขึ้นมาภายใน OBS! คุณสามารถลากหัวหน้าต่างไปติดไว้ที่แถบข้างหรือแถบล่างของ OBS ได้ตามใจชอบ

---

### ส่วนที่ 2: วิธีเพิ่มป้ายชื่อบนหน้าจอถ่ายทอดสด (Browser Source)
วิธีนำ Overlay ไปแสดงผลซ้อนบนภาพกล้องหรือฉากใน OBS:

1. ในหน้าต่างหลักของ OBS ที่ช่อง **Sources** (แหล่งที่มา)
2. คลิกปุ่ม **+** (เพิ่ม) > เลือก **Browser**
3. ตั้งชื่อ Source เช่น `Lower Third Overlay` แล้วกด **OK**
4. ตั้งค่าดังต่อไปนี้:
   - **URL**: `http://localhost:3000/overlay`
   - **Width**: `1920` (หรือความละเอียด Canvas ของสตรีม เช่น 1280)
   - **Height**: `1080` (หรือ 720)
   - **Custom CSS**: ปล่อยว่างไว้ หรือปล่อยตามค่าเริ่มต้น (ระบบจัดการพื้นหลังโปร่งใสให้อัตโนมัติ)
   - ติ๊กถูกที่: `Shutdown source when not visible` (ไม่บังคับ)
   - ติ๊กถูกที่: `Refresh browser when scene becomes active` (แนะนำ)
5. กด **OK**

🎉 **เสร็จเรียบร้อย!** เมื่อคุณกดปุ่ม **PLAY** ในหน้าต่าง Dock ป้ายชื่อจะแสดงขึ้นมาบนหน้าจอ OBS พร้อม Animation ทันที!

---

## 🗂️ โครงสร้างโปรเจกต์ (Project Structure)

```
obs-lower-third/
├── data/
│   └── database.json          # ไฟล์ฐานข้อมูลจัดเก็บรายชื่อและการตั้งค่า (Persistent JSON DB)
├── server/
│   ├── database.ts            # Data Layer จัดการ CRUD, บันทึกไฟล์ และ Backup/Restore
│   └── websocket.ts           # Real-time WebSocket Server ถ่ายทอดสถานะสด
├── src/
│   ├── components/
│   │   ├── Header.tsx         # แถบหัวระบบ, สถานะ ON AIR, ตัวคัดลอก URL
│   │   ├── PeopleManager.tsx  # ระบบจัดการรายชื่อ, ปุ่ม PLAY/HIDE, ค้นหา, เรียงลำดับ
│   │   ├── ControlSidebar.tsx # จอ Monitor สด 16:9, ตัวปรับแต่งสไตล์, Animation, Auto-Hide
│   │   ├── LowerThirdGraphic.tsx # ตัวเรนเดอร์กราฟิกป้ายชื่อแบบพรีเมียม 5 สไตล์
│   │   ├── PersonModal.tsx    # หน้าต่างเพิ่ม/แก้ไขบุคคล พร้อมอัปโหลดรูปและ Live Preview
│   │   ├── SettingsModal.tsx  # หน้าต่างตั้งค่าระบบ, กู้คืนไฟล์ และคู่มือ OBS
│   │   ├── ControlPanel.tsx   # คอมโพเนนต์หน้าควบคุมหลัก
│   │   └── OverlayView.tsx    # หน้า Overlay โปร่งใสสำหรับ OBS Browser Source
│   ├── hooks/
│   │   └── useBroadcastSocket.ts # WebSocket Hook เชื่อมต่อแบบ Auto-reconnect
│   ├── types/
│   │   └── broadcast.ts       # Shared TypeScript Type Definitions
│   ├── utils/
│   │   └── themePresets.ts    # กำหนด Presets, ฟอนต์ และ Animation Variants
│   ├── App.tsx                # Client Routing สลับระหว่าง Control Panel และ /overlay
│   ├── main.tsx               # React Entrypoint
│   └── index.css              # Tailwind CSS & Global Broadcast Styles
├── server.ts                  # Backend Server Entrypoint (Express + WebSocket + Vite)
├── start.bat                  # ไฟล์ 1-Click Launcher สำหรับ Windows
├── package.json
└── README.md
```

---

## 🎛️ สรุปขั้นตอนการทำงานของระบบ (How It Works)

```
[ OBS Custom Browser Dock ]
       │  (กดปุ่ม PLAY)
       ▼
[ WebSocket Message: SHOW_LOWER_THIRD ]
       │
       ▼
[ Node.js Backend Server (Port 3000) ]
       │  (บันทึกสถานะลง data/database.json)
       │  (Broadcast ส่งข้อมูลทันที)
       ▼
[ OBS Browser Source (/overlay) ]
       │  (รับ Event)
       ▼
[ ป้ายชื่อแสดงผลบนหน้าจอสดด้วย Animation อย่างนุ่มนวล ]
```

---

## 💡 คำแนะนำสำหรับการถ่ายทอดสดจริง (Broadcast Pro Tips)

1. **สลับบุคคลสดโดยไม่กระพริบ**: เมื่อมีวิทยากรพูดต่อเนื่อง คุณสามารถกดปุ่ม **PLAY** ของบุคคลถัดไปได้ทันที ระบบจะเปลี่ยนชื่ออย่างราบรื่นโดยไม่ดับวูบ
2. **ปุ่ม HIDE ALL ฉุกเฉิน**: ที่แถบด้านบนมีปุ่ม **HIDE ALL** สีเทา/แดง สำหรับสั่งซ่อนป้ายชื่อทั้งหมดจากจอทันทีในคลิกเดียว
3. **โหมด Compact สำหรับ Dock แคบ**: หากหน้าต่าง Dock ใน OBS มีขนาดแคบ ให้กดปุ่มย่อหน้าต่างมุมขวาบน ระบบจะซ่อน Sidebar ด้านข้างเพื่อให้คุณเห็นรายชื่อและกดปุ่ม PLAY ได้อย่างคล่องตัว
4. **การสำรองข้อมูล (Backup)**: ในเมนู Settings สามารถคลิก "ดาวน์โหลดไฟล์ JSON" เพื่อสำรองรายชื่อวิทยากรเก็บไว้ใช้ในงานถ่ายทอดสดครั้งต่อไปได้

---

พัฒนาขึ้นเพื่อระบบถ่ายทอดสดระดับมืออาชีพ รองรับ OBS Studio ทุกเวอร์ชัน 🚀
