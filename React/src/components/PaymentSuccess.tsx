import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import CheckoutProgress from './CheckoutProgress'

type LastOrder = {
  orderId: string
  items: Array<{ id: string; name: string; price: number; image?: string; qty: number }>
  address: {
    id: string
    fullName: string
    phone: string
    address1: string
    address2?: string
    province: string
    district: string
    postcode: string
  } | null
  paymentMethod: 'card' | 'qr'
  subtotal: number
  timestamp: number
}

const PaymentSuccess = () => {
  const [params] = useSearchParams()
  const order = params.get('order')

  const data: LastOrder | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('lastOrder')
      if (!raw) return null
      return JSON.parse(raw) as LastOrder
    } catch {
      return null
    }
  }, [])

  const totalQty = useMemo(() => data?.items?.reduce((a, b) => a + b.qty, 0) ?? 0, [data])
  const itemTypes = data?.items?.length ?? 0
  const currency = (n: number) => n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <CheckoutProgress currentStep={4} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ 
          duration: 0.35, 
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { duration: 0.3 }
        }}
        style={{ willChange: 'transform, opacity' }}
        className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-8"
      >
        <div className="flex items-start gap-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-2xl shrink-0">✓</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">ชำระเงินสำเร็จ</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">หมายเลขคำสั่งซื้อ: <span className="font-mono">{order ?? data?.orderId}</span></p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-3">รายการสินค้า</h2>
              {data?.items && data.items.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {data.items.map((it) => (
                    <div key={it.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                          {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">No image</span>}
                        </div>
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">จำนวน × {it.qty}</div>
                        </div>
                      </div>
                      <div className="font-semibold">{currency(it.price * it.qty)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีข้อมูลรายการสินค้า</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-3">สรุป</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>จำนวนรวม</span><span>{totalQty} ชิ้น</span></div>
                <div className="flex justify-between"><span>ชนิดสินค้า</span><span>{itemTypes} รายการ</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-800"><span>ยอดรวม</span><span>{currency(data?.subtotal ?? 0)}</span></div>
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 h-max">
            <h3 className="text-lg font-semibold mb-3">ที่อยู่จัดส่ง</h3>
            {data?.address ? (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="font-medium text-gray-900 dark:text-gray-100">{data.address.fullName} • {data.address.phone}</div>
                <div className="mt-1">{data.address.address1} {data.address.address2}</div>
                <div>{data.address.district} {data.address.province} {data.address.postcode}</div>
                <div className="mt-3 text-xs text-gray-500">ชำระเงินด้วย: {data.paymentMethod === 'card' ? 'บัตรเครดิต/เดบิต' : 'QR PromptPay'}</div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่มีข้อมูลที่อยู่</p>
            )}

            <div className="mt-6 flex gap-3">
              <Link to="/" className="flex-1 text-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">กลับหน้าแรก</Link>
              <Link to="/cart" className="flex-1 text-center px-5 py-3 rounded-xl border">เลือกซื้อเพิ่ม</Link>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
