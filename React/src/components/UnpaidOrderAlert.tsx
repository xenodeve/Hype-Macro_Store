import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { orderService, type Order } from '../services/orderService'

const UnpaidOrderAlert = () => {
  const navigate = useNavigate()
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([])
  const [isDismissed, setIsDismissed] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    const fetchUnpaidOrders = async () => {
      try {
        const orders = await orderService.getUnpaidOrders()
        setUnpaidOrders(orders)
      } catch (error) {
        console.error('Failed to fetch unpaid orders:', error)
      }
    }

    fetchUnpaidOrders()
  }, [])

  const handleGoToPayment = () => {
    // บันทึกข้อมูล order เพื่อกลับไปชำระเงิน order เดิม (ไม่ใช่สร้างใหม่)
    sessionStorage.setItem('unpaidOrder', JSON.stringify({
      orderId: latestUnpaidOrder.orderId,
      method: latestUnpaidOrder.paymentMethod,
      amount: latestUnpaidOrder.subtotal,
      hasConfirmedPayment: latestUnpaidOrder.hasConfirmedPayment || false,
      timestamp: Date.now()
    }))
    navigate('/checkout/payment')
  }

  const handleCancelOrder = async (order: Order) => {
    const confirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะยกเลิกคำสั่งซื้อ #${order.orderId}?`)
    if (!confirmed) return

    setIsCanceling(true)
    try {
      await orderService.deleteOrder(order.orderId)
      // ลบ order ออกจาก list
      setUnpaidOrders(prev => prev.filter(o => o.orderId !== order.orderId))
      alert('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsCanceling(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // ไม่แสดงถ้าไม่มี unpaid orders หรือถูก dismiss
  if (unpaidOrders.length === 0 || isDismissed) {
    return null
  }

  // แสดงเฉพาะ order แรก (ล่าสุด)
  const latestUnpaidOrder = unpaidOrders[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg shadow-md mb-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              💳 ดูเหมือนคุณยังไม่ได้ชำระเงิน Order #{latestUnpaidOrder.orderId} ก่อนหน้านะ
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              ยอดรวม: {latestUnpaidOrder.subtotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
              {unpaidOrders.length > 1 && ` • และอีก ${unpaidOrders.length - 1} รายการ`}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleGoToPayment}
                disabled={isCanceling}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💳 ชำระเงิน
              </button>
              <button
                onClick={() => handleCancelOrder(latestUnpaidOrder)}
                disabled={isCanceling}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-blue-500 hover:text-blue-600 transition"
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UnpaidOrderAlert
