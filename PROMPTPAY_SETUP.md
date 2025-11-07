# การตั้งค่าเบอร์ PromptPay ของคุณเอง

## 🔧 วิธีการเปลี่ยนเบอร์ PromptPay

### ขั้นตอนที่ 1: แก้ไขในไฟล์ `payment.service.ts`

เปิดไฟล์: `Nestjs/src/payments/payment.service.ts`

ค้นหาบรรทัดนี้:
```typescript
private readonly promptpayId = '0861234567'; // เปลี่ยนเป็นเบอร์จริงของคุณ
```

แก้ไขเป็นเบอร์โทรศัพท์ที่ลงทะเบียน PromptPay ของคุณ:
```typescript
private readonly promptpayId = '0812345678'; // ← ใส่เบอร์ของคุณ
```

### รูปแบบเบอร์โทรศัพท์ที่รองรับ

#### แบบที่ 1: เบอร์โทรศัพท์ (10 หลัก)
```typescript
private readonly promptpayId = '0812345678';
```

#### แบบที่ 2: เลขประจำตัวประชาชน (13 หลัก)
```typescript
private readonly promptpayId = '1234567890123';
```

#### แบบที่ 3: Tax ID/เลขประจำตัวผู้เสียภาษี (13 หลัก)
```typescript
private readonly promptpayId = '0123456789012';
```

## 📝 ตัวอย่างการใช้งาน

### 1. เบอร์โทรศัพท์ส่วนตัว
```typescript
export class PaymentService {
  private readonly promptpayId = '0891234567';
  // QR Code จะโอนเงินเข้าบัญชีที่ผูกกับเบอร์นี้
}
```

### 2. เบอร์โทรศัพท์บริษัท
```typescript
export class PaymentService {
  private readonly promptpayId = '021234567';
  // QR Code จะโอนเงินเข้าบัญชีบริษัท
}
```

### 3. เลขประจำตัวประชาชน
```typescript
export class PaymentService {
  private readonly promptpayId = '1103700123456';
  // QR Code จะโอนเงินเข้าบัญชีที่ผูกกับเลขบัตรประชาชนนี้
}
```

## ⚠️ ข้อควรระวัง

### 1. ตรวจสอบการลงทะเบียน PromptPay
- เบอร์/เลขที่ใช้ต้อง**ลงทะเบียน PromptPay ไว้แล้ว**
- ตรวจสอบผ่านแอพธนาคารของคุณว่า PromptPay เปิดใช้งานอยู่
- สามารถลงทะเบียนได้ที่:
  - Mobile Banking App
  - ATM ของธนาคาร
  - สาขาธนาคาร

### 2. ทดสอบก่อนใช้งานจริง
```bash
# 1. Start Backend
cd Nestjs
npm run start:dev

# 2. ทดสอบสร้าง QR Code
POST http://localhost:3000/payments/generate-qr
{
  "orderId": "TEST001",
  "amount": 1
}

# 3. สแกน QR Code ด้วยแอพธนาคาร
# 4. ตรวจสอบว่าชื่อและเบอร์ที่แสดงถูกต้อง
```

### 3. จำนวนเงินขั้นต่ำ
```typescript
// จำนวนเงินต้องมากกว่า 0 บาท
{
  "amount": 1  // ✅ ถูกต้อง
}

{
  "amount": 0  // ❌ ผิด - ต้องมากกว่า 0
}
```

## 🔐 ความปลอดภัย

### 1. ไม่ควร Hard-code เบอร์ในโค้ด (Production)
ใช้ Environment Variable แทน:

#### แก้ไขในไฟล์ `payment.service.ts`:
```typescript
export class PaymentService {
  private readonly promptpayId = process.env.PROMPTPAY_ID || '0861234567';
}
```

#### สร้างไฟล์ `.env` ในโฟลเดอร์ `Nestjs/`:
```env
PROMPTPAY_ID=0891234567
MONGODB_URI=mongodb://localhost:27017/hype-macro
JWT_SECRET=your-secret-key
```

#### อัพเดทไฟล์ `.gitignore`:
```
.env
```

### 2. ใช้หลายเบอร์ตามสภาพแวดล้อม

```typescript
export class PaymentService {
  private readonly promptpayId = this.getPromptPayId();

  private getPromptPayId(): string {
    // Development
    if (process.env.NODE_ENV === 'development') {
      return process.env.PROMPTPAY_DEV || '0861234567';
    }
    
    // Production
    return process.env.PROMPTPAY_PROD || '0891234567';
  }
}
```

## 📱 การทดสอบ

### ขั้นตอนการทดสอบ QR Code

1. **เปิด Backend**
   ```bash
   cd Nestjs
   npm run start:dev
   ```

2. **เปิด Frontend**
   ```bash
   cd React
   npm run dev
   ```

3. **ทดสอบชำระเงิน**
   - ไปที่ http://localhost:5173
   - Login เข้าระบบ
   - เพิ่มสินค้าลงตะกร้า
   - ไปที่ Checkout → Shipping → Payment
   - เลือก "QR PromptPay"
   - กดปุ่ม "ชำระเงิน"

4. **ตรวจสอบ QR Code**
   - สแกน QR Code ด้วยแอพธนาคาร
   - ตรวจสอบว่า:
     - ✅ ชื่อผู้รับเงินถูกต้อง
     - ✅ จำนวนเงินถูกต้อง
     - ✅ เบอร์โทรศัพท์ถูกต้อง

5. **ทดสอบโอนเงิน (จำนวนน้อย ๆ)**
   - โอน 1 บาทเพื่อทดสอบ
   - กดปุ่ม "ยืนยันการชำระเงิน"
   - ตรวจสอบว่าสถานะอัพเดทเป็น "paid"

## 🎯 Best Practices

### 1. ใช้เบอร์ทดสอบในระหว่างพัฒนา
```typescript
// Development
private readonly promptpayId = '0861234567'; // เบอร์ทดสอบ

// Production
private readonly promptpayId = process.env.PROMPTPAY_ID;
```

### 2. เก็บ Log การสร้าง QR Code
```typescript
async generateQRCode(orderId: string, amount: number) {
  console.log(`[QR] Generating QR for order ${orderId}, amount: ${amount}`);
  console.log(`[QR] PromptPay ID: ${this.promptpayId}`);
  
  const payload = generatePayload(this.promptpayId, { amount });
  const qrCodeDataURL = await QRCode.toDataURL(payload);
  
  console.log(`[QR] QR Code generated successfully`);
  
  return { qrCodeDataURL, ... };
}
```

### 3. ตรวจสอบเบอร์ก่อนสร้าง QR
```typescript
private validatePromptPayId(id: string): boolean {
  // เบอร์โทรศัพท์ (10 หลัก)
  if (/^0\d{9}$/.test(id)) return true;
  
  // เลขบัตรประชาชน/Tax ID (13 หลัก)
  if (/^\d{13}$/.test(id)) return true;
  
  return false;
}

async generateQRCode(orderId: string, amount: number) {
  if (!this.validatePromptPayId(this.promptpayId)) {
    throw new BadRequestException('Invalid PromptPay ID format');
  }
  
  // ... rest of code
}
```

## 🚀 การใช้งานจริง (Production)

### Environment Variables ที่แนะนำ

สร้างไฟล์ `.env.production`:
```env
# PromptPay
PROMPTPAY_ID=0891234567

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hype-macro

# JWT
JWT_SECRET=your-production-secret-key-here

# Server
PORT=3000
NODE_ENV=production
```

### Deploy Configuration

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
ENV PROMPTPAY_ID=${PROMPTPAY_ID}
CMD ["npm", "run", "start:prod"]
```

#### Deploy Script
```bash
#!/bin/bash
export PROMPTPAY_ID="0891234567"
npm run build
npm run start:prod
```

---

**หมายเหตุ:** เบอร์ PromptPay ที่ใช้ในตัวอย่างทั้งหมด (0861234567) เป็นเบอร์สมมติ กรุณาเปลี่ยนเป็นเบอร์จริงของคุณก่อนใช้งาน
