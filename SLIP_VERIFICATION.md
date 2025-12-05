# 📄 Slip Verification System

ระบบตรวจสอบสลิปโอนเงินอัตโนมัติ โดยใช้ `promptparse/validate` เหมือนกับระบบใน Discord Bot (planet_management)

## 🎯 Features

- ✅ อัปโหลดสลิปโอนเงิน (JPG, PNG, WEBP)
- ✅ ตรวจสอบความถูกต้องของสลิปอัตโนมัติ
- ✅ อ่าน QR Code จากสลิป
- ✅ ดึงข้อมูลจำนวนเงินด้วย OCR (Tesseract.js)
- ✅ แสดงข้อมูลธนาคาร, เลขที่รายการ, จำนวนเงิน
- ✅ อัปเดทสถานะการชำระเงินอัตโนมัติ

## 📦 Dependencies

```bash
npm install promptparse jimp jsqr sharp tesseract.js multer @types/multer
```

## 🔧 Backend API

### 1. Verify Slip (Upload File)

**Endpoint:** `POST /payments/verify-slip-upload`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
slip: <File>
orderId: <string>
```

**Response:**
```json
{
  "success": true,
  "message": "สลิปถูกต้อง",
  "data": {
    "sendingBank": "ธนาคารกสิกรไทย (KBANK)",
    "receivingBank": "...",
    "transRef": "...",
    "transDate": "...",
    "transTime": "...",
    "amount": "100.00 บาท",
    "isValid": true,
    "orderId": "ORDER_123",
    "imageUrl": "..."
  }
}
```

### 2. Verify Slip (URL)

**Endpoint:** `POST /payments/verify-slip`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://example.com/slip.jpg",
  "orderId": "ORDER_123"
}
```

## 💻 Frontend Usage

### Import Service

```typescript
import { paymentService } from '../services/paymentService'
```

### Upload Slip (File)

```typescript
const handleVerifySlip = async (file: File, orderId: string) => {
  const result = await paymentService.verifySlipUpload(file, orderId)
  
  if (result.success && result.data?.isValid) {
    console.log('✅ สลิปถูกต้อง!')
    // ดำเนินการต่อ...
  } else {
    console.log('❌ สลิปไม่ถูกต้อง')
  }
}
```

### Verify Slip (URL)

```typescript
const result = await paymentService.verifySlip(
  'https://example.com/slip.jpg',
  'ORDER_123'
)
```

## 🎨 UI Component

ระบบมี UI สำหรับอัปโหลดสลิปใน `Payment.tsx`:

- 📤 Upload area with drag & drop
- 🖼️ Image preview
- 🔍 Verify button
- ✅ Verification result display
- 📊 Transaction details (bank, ref, amount)

## 🏦 รหัสธนาคารที่รองรับ

- `002` - ธนาคารกรุงเทพ (BBL)
- `004` - ธนาคารกสิกรไทย (KBANK)
- `006` - ธนาคารกรุงไทย (KTB)
- `011` - ธนาคารทหารไทยธนชาต (TTB)
- `014` - ธนาคารไทยพาณิชย์ (SCB)
- `025` - ธนาคารกรุงศรีอยุธยา (BAY)
- `030` - ธนาคารออมสิน (GSB)
- และอื่น ๆ...

## 📝 How It Works

1. **ผู้ใช้อัปโหลดสลิป** → Frontend ส่ง file ไปยัง Backend
2. **Backend ดาวน์โหลดและแปลงรูป** → แปลง webp/png เป็น jpg
3. **อ่าน QR Code** → ใช้ `jsQR` อ่าน QR จากสลิป
4. **ตรวจสอบความถูกต้อง** → ใช้ `promptparse/validate` ตรวจสอบ
5. **ดึงจำนวนเงิน** → ใช้ `Tesseract.js` (OCR) อ่านจำนวนเงิน
6. **อัปเดท Order** → บันทึก transaction ID และ status
7. **ส่งผลลัพธ์กลับ** → Frontend แสดงผลและดำเนินการต่อ

## 🔐 Security

- ✅ ต้อง Login ก่อน (JWT Authentication)
- ✅ จำกัดประเภทไฟล์ (JPG, PNG, WEBP only)
- ✅ จำกัดขนาดไฟล์ (max 5MB)
- ✅ ลบไฟล์ทันทีหลังประมวลผลเสร็จ
- ✅ Validate Order ID

## 🚀 Testing

### 1. Start Backend

```bash
cd Nestjs
npm run start:dev
```

### 2. Start Frontend

```bash
cd React
npm run dev
```

### 3. Test Flow

1. เข้าสู่ระบบ
2. เลือกสินค้าและไปที่หน้า Payment
3. สร้าง QR Code
4. โอนเงินผ่าน Mobile Banking
5. Screenshot สลิปโอนเงิน
6. อัปโหลดสลิปในหน้า Payment
7. กดปุ่ม "ตรวจสอบสลิปและดำเนินการต่อ"
8. ระบบจะตรวจสอบและดำเนินการอัตโนมัติ

## 📸 Example Slip Structure

สลิปที่ถูกต้องต้องมี:
- QR Code (PromptPay Standard)
- ข้อมูลธนาคาร
- เลขที่รายการ (Transaction Reference)
- จำนวนเงิน (ตัวเลขชัดเจน)
- วันที่และเวลา

## 🐛 Troubleshooting

### ❌ "ไม่พบ QR Code ในรูปภาพ"
- ตรวจสอบว่ารูปภาพชัดเจน
- QR Code ต้องอยู่ในรูป
- ลองถ่ายภาพใหม่

### ❌ "ไม่สามารถตรวจสอบความถูกต้องของสลิปได้"
- สลิปต้องเป็น PromptPay QR standard
- QR Code ต้องไม่เสียหาย

### ❌ "ไม่พบจำนวนเงิน"
- ตัวเลขจำนวนเงินต้องชัดเจน
- แนะนำให้ใช้ screenshot จากแอพธนาคาร

## 📚 Related Files

### Backend
- `Nestjs/src/payments/payment.service.ts` - Slip verification logic
- `Nestjs/src/payments/payment.controller.ts` - API endpoints
- `Nestjs/src/payments/slip-verification.dto.ts` - DTOs
- `Nestjs/src/main.ts` - Static file serving setup

### Frontend
- `React/src/services/paymentService.ts` - API client
- `React/src/components/Payment.tsx` - UI component

### Directories
- `Nestjs/uploads/slips/` - Uploaded slips (temporary)
- `Nestjs/cache/receipt/` - Processed images (temporary)

## 🔄 Comparison with Discord Bot

| Feature | Discord Bot (planet_management) | Web App (NestJS + React) |
|---------|-------------------------------|--------------------------|
| Library | `promptparse/validate` | `promptparse/validate` |
| QR Reader | `jsqr` | `jsqr` |
| Image Processing | `jimp`, `sharp` | `jimp`, `sharp` |
| OCR | `tesseract.js` | `tesseract.js` |
| File Upload | Discord attachment | Multer (multipart/form-data) |
| Verification | Same algorithm | Same algorithm |
| Bank Codes | Same mapping | Same mapping |

## ✅ สรุป

ระบบ Slip Verification นี้ใช้เทคโนโลยีเดียวกับที่ใช้ใน Discord Bot ทำให้มั่นใจได้ว่าการตรวจสอบจะแม่นยำและเชื่อถือได้ 🎉
