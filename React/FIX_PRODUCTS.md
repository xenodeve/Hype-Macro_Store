# 🔧 แก้ไขปัญหา Frontend ดึงข้อมูล Products

## 🐛 ปัญหาที่พบ:

1. **Backend filter `isActive: true`** แต่ seeder ไม่ได้ set field นี้
2. **Frontend ใช้ `id`** แต่ MongoDB return `_id`
3. **findOne, update, remove** ใช้ `findOne({ id })` แทน `findById(id)`

## ✅ วิธีแก้:

### 1. แก้ไขไฟล์ (เสร็จแล้ว):
- ✅ `product.seeder.ts` - เพิ่ม `isActive: true` ทุกรายการ
- ✅ `products.service.ts` - แปลง `_id` เป็น `id` สำหรับ Frontend
- ✅ `products.service.ts` - ใช้ `findById`, `findByIdAndUpdate`, `findByIdAndDelete`

### 2. ลบข้อมูลเก่าและ Seed ใหม่:

เลือก 1 ใน 3 วิธี:

#### วิธีที่ 1: ใช้ MongoDB Compass (แนะนำ)
1. เปิด MongoDB Compass
2. เชื่อมต่อ `mongodb://localhost:27017`
3. เลือก database: `hype-macro`
4. เลือก collection: `products`
5. คลิก "Delete" ลบเอกสารทั้งหมด
6. กลับมารัน: `npm run seed` (ใน Nestjs folder)

#### วิธีที่ 2: ใช้ mongosh CLI
```bash
mongosh
use hype-macro
db.products.deleteMany({})
exit
```
จากนั้นรัน:
```bash
cd Nestjs
npm run seed
```

#### วิธีที่ 3: Restart Backend (Auto-seed)
1. Stop Backend server (Ctrl+C)
2. ลบข้อมูลใน MongoDB Compass
3. Start Backend: `npm run start:dev`

## 🎯 ผลลัพธ์ที่คาดหวัง:

### Backend Response (GET /products):
```json
[
  {
    "id": "67890abcdef123456789...",
    "name": "VXE R1 Pro Max",
    "description": "High-performance wireless gaming mouse with 8K polling rate",
    "price": 2990,
    "image": "https://ik.imagekit.io/xenodev/...",
    "stock": 50,
    "isActive": true
  },
  ...
]
```

### Frontend:
- ✅ HomePage แสดงสินค้า 4 รายการ
- ✅ Cart แสดงสินค้า 4 รายการ
- ✅ เพิ่มลงตะกร้าได้ปกติ

## 🧪 ทดสอบ:

```bash
# 1. ลบข้อมูลเก่า (MongoDB Compass หรือ mongosh)

# 2. Seed ข้อมูลใหม่
cd Nestjs
npm run seed

# 3. Start Backend
npm run start:dev

# 4. Test API
curl http://localhost:3000/products

# 5. Start Frontend
cd React
npm run dev

# 6. เปิด http://localhost:5173
# - ควรเห็นสินค้า 4 รายการใน HomePage
# - ควรเห็นสินค้า 4 รายการใน Cart
```

---

**หมายเหตุ:** ต้องลบข้อมูลเก่าก่อน เพราะ seeder จะข้ามถ้ามีข้อมูลอยู่แล้ว
