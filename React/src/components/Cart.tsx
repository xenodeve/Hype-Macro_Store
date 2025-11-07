import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addItem, removeItem, updateQty, clearCart, selectCartItems, selectCartSubtotal } from '../features/cart/cartSlice'
import { fetchProducts, selectProducts, selectProductsStatus } from '../features/products/productsSlice'
import Counter from './Counter'
import CheckoutProgress from './CheckoutProgress'
import UnpaidOrderAlert from './UnpaidOrderAlert'

/**
 * Currency Formatter
 * แปลงตัวเลขเป็นรูปแบบเงินบาท (฿)
 */
const currency = (n: number) => n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })

/**
 * Cart Component
 * หน้าตะกร้าสินค้า (Step 1 ของ Checkout)
 * 
 * Features:
 * - แสดงรายการสินค้าในตะกร้า
 * - เพิ่ม/ลด/ลบ สินค้า
 * - แสดงสินค้าแนะนำจาก API
 * - เพิ่มสินค้าจากรายการแนะนำ
 * - ตรวจสอบ login ก่อน checkout
 * - คำนวณยอดรวมอัตโนมัติ
 */
const Cart = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartSubtotal)
  const products = useAppSelector(selectProducts)
  const productsStatus = useAppSelector(selectProductsStatus)
  const user = useAppSelector((s) => s.auth.user)
  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items])

  /**
   * Fetch Products on Mount
   * ดึงรายการสินค้าจาก API เพื่อแสดงในส่วน "สินค้าแนะนำ"
   */
  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  /**
   * Handle Checkout Click
   * ตรวจสอบ login ก่อน:
   * - ถ้ายังไม่ login → redirect ไป /login พร้อม message
   * - ถ้า login แล้ว → ไปหน้า shipping
   */
  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout/shipping&message=login_required')
    } else {
      navigate('/checkout/shipping')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <CheckoutProgress currentStep={1} />
      
      {/* แจ้งเตือน Unpaid Orders */}
      {user && <UnpaidOrderAlert />}
      
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
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Product list */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">สินค้าทั้งหมด</h2>
          
          {productsStatus === 'loading' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">กำลังโหลดสินค้า...</p>
            </div>
          )}

          {productsStatus === 'failed' && (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>
            </div>
          )}

          {productsStatus === 'idle' && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">ไม่มีสินค้าในขณะนี้</p>
            </div>
          )}

          {productsStatus === 'idle' && products.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 28, mass: 0.9 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="product-card card-hover rounded-xl overflow-hidden shadow-md"
                >
                  <div className="aspect-square bg-white dark:bg-[#121212]">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{currency(p.price)}</p>
                    <button
                      onClick={() => dispatch(addItem({ id: p.id, name: p.name, price: p.price, image: p.image }))}
                      className="mt-3 w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-500 transition"
                    >
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart summary */}
        <motion.aside 
          layout
          transition={{ type: 'spring', stiffness: 200, damping: 28, mass: 0.9 }}
          className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-max sticky top-20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">ตะกร้าสินค้า</h2>
            {items.length > 0 && (
              <button onClick={() => dispatch(clearCart())} className="text-sm text-red-600 hover:underline">ล้างตะกร้า</button>
            )}
          </div>
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {items.map((it) => (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.9 }}
                    className="flex gap-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight">{it.name}</p>
                          <p className="text-sm text-gray-500">{currency(it.price)}</p>
                        </div>
                        <button
                          onClick={() => dispatch(removeItem(it.id))}
                          className="text-sm text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => dispatch(updateQty({ id: it.id, qty: it.qty - 1 }))}
                          className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          -
                        </button>
                        <div className="w-14 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-1">
                          <Counter
                            value={it.qty}
                            places={it.qty >= 10 ? [10, 1] : [1]}
                            fontSize={16}
                            padding={2}
                            gap={2}
                            textColor="currentColor"
                            fontWeight={600}
                            borderRadius={0}
                            horizontalPadding={0}
                            gradientHeight={8}
                            gradientFrom="transparent"
                            gradientTo="transparent"
                          />
                        </div>
                        <button
                          onClick={() => dispatch(updateQty({ id: it.id, qty: it.qty + 1 }))}
                          className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          +
                        </button>
                        <div className="ml-auto font-semibold flex items-center gap-1">
                          <span>฿</span>
                          <Counter
                            value={it.price * it.qty}
                            places={
                              (it.price * it.qty) >= 10000
                                ? [10000, 1000, 100, 10, 1]
                                : (it.price * it.qty) >= 1000
                                  ? [1000, 100, 10, 1]
                                  : (it.price * it.qty) >= 100
                                    ? [100, 10, 1]
                                    : (it.price * it.qty) >= 10
                                      ? [10, 1]
                                      : [1]
                            }
                            fontSize={16}
                            padding={2}
                            gap={1}
                            textColor="currentColor"
                            fontWeight={600}
                            borderRadius={0}
                            horizontalPadding={0}
                            gradientHeight={8}
                            gradientFrom="transparent"
                            gradientTo="transparent"
                          />
                          <span>.00</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            <AnimatePresence>
              {items.length === 0 ? (
                <motion.p
                  key="cart-empty"
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-500"
                >
                  ยังไม่มีสินค้าในตะกร้า
                </motion.p>
              ) : (
                <motion.div
                  key="cart-summary"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26, mass: 0.9 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2"
                >
                  <motion.div layout className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>จำนวนทั้งหมด</span>
                    <span className="flex items-center gap-1">
                      <Counter
                        value={count}
                        places={count >= 100 ? [100, 10, 1] : count >= 10 ? [10, 1] : [1]}
                        fontSize={14}
                        padding={2}
                        gap={2}
                        textColor="currentColor"
                        fontWeight={600}
                        borderRadius={0}
                        horizontalPadding={0}
                        gradientHeight={6}
                        gradientFrom="transparent"
                        gradientTo="transparent"
                      />
                      <span>ชิ้น</span>
                    </span>
                  </motion.div>
                  <motion.div layout className="flex justify-between text-lg font-semibold">
                    <span>ยอดรวม</span>
                    <span className="flex items-center gap-1">
                      <span>฿</span>
                      <Counter
                        value={subtotal}
                        places={
                          subtotal >= 10000
                            ? [10000, 1000, 100, 10, 1]
                            : subtotal >= 1000
                              ? [1000, 100, 10, 1]
                              : subtotal >= 100
                                ? [100, 10, 1]
                                : subtotal >= 10
                                  ? [10, 1]
                                  : [1]
                        }
                        fontSize={18}
                        padding={2}
                        gap={1}
                        textColor="currentColor"
                        fontWeight={700}
                        borderRadius={0}
                        horizontalPadding={0}
                        gradientHeight={8}
                        gradientFrom="transparent"
                        gradientTo="transparent"
                      />
                      <span>.00</span>
                    </span>
                  </motion.div>
                  <motion.button 
                    layout 
                    onClick={handleCheckout}
                    className="w-full mt-2 rounded-xl bg-green-600 text-white py-3 font-semibold hover:bg-green-500 transition"
                  >
                    ไปหน้ากรอกที่อยู่จัดส่ง
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.aside>
      </motion.div>
    </div>
  )
}

export default Cart
