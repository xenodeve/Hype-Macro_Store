import CardSwap, { Card } from './CardSwap'

const AuthCardBackdrop = () => {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      <CardSwap
        width={360}
        height={420}
        cardDistance={60}
        verticalDistance={70}
        delay={5000}
        pauseOnHover={false}
      >
        <Card customClass="bg-gradient-to-br from-[#11162a] via-[#0c0f1d] to-[#05060a] text-white shadow-[0_30px_120px_-60px_rgba(30,64,175,0.8)] px-8 py-10 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">เข้าสู่ระบบปลอดภัย</span>
          <h3 className="text-xl font-semibold">ยืนยันตัวตนแบบ 2FA</h3>
          <p className="text-sm text-white/70">
            รองรับการยืนยันด้วยอีเมลและอุปกรณ์ เพื่อให้บัญชีของคุณปลอดภัยมากที่สุด
          </p>
        </Card>
        <Card customClass="bg-gradient-to-br from-[#0b1f2b] via-[#071724] to-[#04101b] text-white shadow-[0_30px_120px_-60px_rgba(14,116,144,0.75)] px-8 py-10 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">สมาชิกพิเศษ</span>
          <h3 className="text-xl font-semibold">สิทธิ์ส่วนลดเฉพาะคุณ</h3>
          <p className="text-sm text-white/70">
            สะสมแต้ม แลกคูปอง และรับส่วนลดพิเศษจากแคมเปญของ HYPE MACRO ก่อนใคร
          </p>
        </Card>
        <Card customClass="bg-gradient-to-br from-[#1e1b4b] via-[#19143d] to-[#0f0a2b] text-white shadow-[0_30px_120px_-60px_rgba(79,70,229,0.8)] px-8 py-10 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-white/50">จัดการง่าย</span>
          <h3 className="text-xl font-semibold">ปรับแต่งออเดอร์แบบเรียลไทม์</h3>
          <p className="text-sm text-white/70">
            เช็กสถานะออเดอร์ ติดตามการจัดส่ง และบันทึกการตั้งค่าที่ชอบไว้ใช้ในครั้งต่อไป
          </p>
        </Card>
      </CardSwap>
    </div>
  )
}

export default AuthCardBackdrop
