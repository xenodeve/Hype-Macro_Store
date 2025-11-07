# ตัวอย่างการใช้งาน Payment API

## 1. สร้าง QR Code สำหรับการชำระเงิน

### Request
```bash
POST http://localhost:3000/payments/generate-qr
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "orderId": "ABC12345",
  "amount": 1500
}
```

### Response
```json
{
  "success": true,
  "data": {
    "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrCodeText": "00020101021129370016A000000677010111011300668...",
    "expiresAt": "2025-11-05T15:30:00.000Z"
  }
}
```

### คำอธิบาย
- `qrCodeDataURL`: รูป QR Code ในรูปแบบ Data URL (สามารถใส่ใน `<img src="">` ได้เลย)
- `qrCodeText`: ข้อความ QR Code แบบ raw (ใช้สำหรับสร้าง QR Code ด้วยวิธีอื่น)
- `expiresAt`: เวลาหมดอายุของ QR Code (15 นาที จากเวลาที่สร้าง)

---

## 2. ตรวจสอบสถานะการชำระเงิน

### Request
```bash
GET http://localhost:3000/payments/status/ABC12345
```

### Response
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "order": {
      "_id": "673a1234567890abcdef1234",
      "orderId": "ABC12345",
      "userId": "673a0987654321fedcba4321",
      "items": [...],
      "paymentMethod": "qr",
      "paymentStatus": "pending",
      "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "paymentExpiry": "2025-11-05T15:30:00.000Z",
      "subtotal": 1500,
      "createdAt": "2025-11-05T15:15:00.000Z"
    }
  }
}
```

### สถานะที่เป็นไปได้
- `pending`: รอการชำระเงิน
- `paid`: ชำระเงินแล้ว
- `cancelled`: ยกเลิกแล้ว
- `expired`: หมดอายุ

---

## 3. ยืนยันการชำระเงิน

### Request
```bash
POST http://localhost:3000/payments/confirm
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "orderId": "ABC12345",
  "transactionId": "TXN1730815800123"
}
```

### Response
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "_id": "673a1234567890abcdef1234",
    "orderId": "ABC12345",
    "paymentStatus": "paid",
    "transactionId": "TXN1730815800123",
    "paidAt": "2025-11-05T15:20:00.000Z",
    ...
  }
}
```

---

## 4. ยกเลิกการชำระเงิน

### Request
```bash
POST http://localhost:3000/payments/cancel/ABC12345
Authorization: Bearer <your_jwt_token>
```

### Response
```json
{
  "success": true,
  "message": "Payment cancelled",
  "data": {
    "_id": "673a1234567890abcdef1234",
    "orderId": "ABC12345",
    "paymentStatus": "cancelled",
    ...
  }
}
```

---

## การทดสอบด้วย Postman

### 1. Login ก่อน
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. เก็บ JWT Token
- Copy `token` จาก response
- ใส่ใน Header: `Authorization: Bearer <token>`

### 3. สร้าง Order
```bash
POST http://localhost:3000/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "TEST001",
  "items": [
    {
      "productId": "prod123",
      "name": "Product 1",
      "price": 500,
      "qty": 2,
      "image": "https://example.com/image.jpg"
    }
  ],
  "paymentMethod": "qr",
  "subtotal": 1000
}
```

### 4. สร้าง QR Code
```bash
POST http://localhost:3000/payments/generate-qr
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "TEST001",
  "amount": 1000
}
```

### 5. ดู QR Code
- Copy `qrCodeDataURL` จาก response
- วางใน browser address bar หรือ
- สร้างไฟล์ HTML เพื่อแสดงผล:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>QR Code PromptPay</h1>
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." />
</body>
</html>
```

---

## Error Handling

### Order Not Found
```json
{
  "statusCode": 400,
  "message": "Order ABC12345 not found",
  "error": "Bad Request"
}
```

### QR Code Expired
```json
{
  "statusCode": 400,
  "message": "QR Code has expired",
  "error": "Bad Request"
}
```

### Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Frontend Integration

### ตัวอย่างการใช้งานใน React

```typescript
import { paymentService } from '../services/paymentService'

// สร้าง QR Code
const handleGenerateQR = async () => {
  try {
    const result = await paymentService.generateQR(orderId, amount)
    setQrCodeDataURL(result.data.qrCodeDataURL)
    setQrExpiry(new Date(result.data.expiresAt))
  } catch (error) {
    console.error('Failed to generate QR:', error)
  }
}

// ตรวจสอบสถานะ
const handleCheckStatus = async () => {
  try {
    const result = await paymentService.checkPaymentStatus(orderId)
    console.log('Payment status:', result.data.status)
  } catch (error) {
    console.error('Failed to check status:', error)
  }
}

// ยืนยันการชำระเงิน
const handleConfirmPayment = async () => {
  try {
    const transactionId = `TXN${Date.now()}`
    await paymentService.confirmPayment(orderId, transactionId)
    navigate('/checkout/success')
  } catch (error) {
    console.error('Failed to confirm payment:', error)
  }
}
```

### แสดง QR Code
```tsx
{qrCodeDataURL && (
  <div className="text-center">
    <img 
      src={qrCodeDataURL} 
      alt="QR Code PromptPay"
      className="w-64 h-64 mx-auto"
    />
    <p className="mt-2 text-sm text-gray-600">
      สแกน QR Code เพื่อชำระเงิน
    </p>
    <p className="text-lg font-bold">
      {amount.toLocaleString('th-TH')} บาท
    </p>
  </div>
)}
```

---

## Auto-Polling สถานะการชำระเงิน

```typescript
useEffect(() => {
  if (!orderId) return
  
  const interval = setInterval(async () => {
    try {
      const result = await paymentService.checkPaymentStatus(orderId)
      if (result.data.status === 'paid') {
        clearInterval(interval)
        navigate('/checkout/success')
      }
    } catch (error) {
      console.error('Failed to check status:', error)
    }
  }, 5000) // ตรวจสอบทุก 5 วินาที
  
  return () => clearInterval(interval)
}, [orderId])
```

---

## Tips สำหรับการใช้งานจริง

1. **ใช้ Webhook แทน Polling**
   - ประหยัด resource มากกว่า
   - Real-time มากกว่า
   - แต่ต้องมี Public URL สำหรับรับ Webhook

2. **จัดการ QR Code หมดอายุ**
   - แสดงนาฬิกานับถอยหลัง
   - อนุญาตให้สร้าง QR Code ใหม่ได้
   - ยกเลิก Order อัตโนมัติเมื่อหมดอายุ

3. **Security**
   - ตรวจสอบว่าจำนวนเงินตรงกับ Order
   - Validate Transaction ID ว่าไม่ซ้ำ
   - เก็บ Log การชำระเงินทั้งหมด

4. **UX ที่ดี**
   - แสดง Loading state ตอนสร้าง QR
   - แสดงข้อความชัดเจนว่าต้องทำอะไร
   - มีปุ่ม "ลองใหม่" กรณีเกิด Error
