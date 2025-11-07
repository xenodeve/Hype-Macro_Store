import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { orderService } from '../services/orderService'

interface PendingPayment {
  orderId: string
  method: 'qr' | 'bank-transfer'
  confirmedAt: number
  amount: number
}

const PendingPaymentNotification = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    // ไม่แสดงใน payment page เอง
    if (location.pathname === '/checkout/payment') {
      return
    }

    // ตรวจสอบว่ามี pending payment หรือไม่
    const checkPendingPayment = () => {
      const stored = localStorage.getItem('pendingPayment')
      if (stored) {
        try {
          const data = JSON.parse(stored) as PendingPayment
          setPendingPayment(data)
          setIsDismissed(false)
        } catch (error) {
          console.error('Failed to parse pending payment:', error)
          localStorage.removeItem('pendingPayment')
        }
      } else {
        setPendingPayment(null)
      }
    }

    checkPendingPayment()

    // Listen for storage changes (ถ้า user เปิดหลายแท็บ)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingPayment') {
        checkPendingPayment()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location.pathname])

  const handleGoToPayment = () => {
    // บันทึกสถานะว่ากำลังกลับมาจาก notification
    sessionStorage.setItem('resumePayment', JSON.stringify({
      orderId: pendingPayment?.orderId,
      method: pendingPayment?.method,
      timestamp: Date.now()
    }))
    navigate('/checkout/payment')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  const handleCancelOrder = async () => {
    if (!pendingPayment) return

    const confirmed = window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกคำสั่งซื้อนี้?')
    if (!confirmed) return

    setIsCanceling(true)
    try {
      await orderService.deleteOrder(pendingPayment.orderId)
      localStorage.removeItem('pendingPayment')
      setPendingPayment(null)
      alert('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsCanceling(false)
    }
  }

  if (!pendingPayment || isDismissed || location.pathname === '/checkout/payment') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-4 right-4 z-[9999] w-full max-w-sm"
      >
        <div className="bg-yellow-500 text-white rounded-lg shadow-2xl p-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">
                ⚠️ คุณยังไม่ได้ส่งหลักฐานการโอน
              </p>
              <p className="text-xs text-yellow-50 mt-0.5 truncate">
                Order #{pendingPayment.orderId}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleGoToPayment}
                  disabled={isCanceling}
                  className="flex-1 px-3 py-1.5 bg-white text-yellow-600 font-medium text-sm rounded hover:bg-yellow-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📤 ส่งสลิป
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCanceling}
                  className="px-3 py-1.5 bg-red-600 text-white font-medium text-sm rounded hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isCanceling ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white hover:text-yellow-100 transition"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PendingPaymentNotification
