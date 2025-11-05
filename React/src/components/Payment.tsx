import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { selectCartItems, selectCartSubtotal, clearCart } from '../features/cart/cartSlice'
import { setPaymentMethod, type PaymentMethod, clearCheckout } from '../features/checkout/checkoutSlice'
import { setUser } from '../features/auth/authSlice'
import { orderService } from '../services/orderService'
import { userService } from '../services/userService'
import CheckoutProgress from './CheckoutProgress'

const currency = (n: number) => n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })

const Payment = () => {
		const navigate = useNavigate()
		const dispatch = useAppDispatch()
		const items = useAppSelector(selectCartItems)
		const subtotal = useAppSelector(selectCartSubtotal)
		const address = useAppSelector((s) => s.checkout.shippingAddress)
		const user = useAppSelector((s) => s.auth.user)
		const [method, setMethod] = useState<PaymentMethod>('card')
		const [isPaying, setIsPaying] = useState(false)

		// Modal state
		const [showSaveCardModal, setShowSaveCardModal] = useState(false)
		const [isSavingCard, setIsSavingCard] = useState(false)

	useEffect(() => {
		// Block entering payment with empty cart, but allow when we are processing payment
		if (!isPaying && items.length === 0) navigate('/cart', { replace: true })
	}, [items, isPaying, navigate])
	useEffect(() => {
		// Require shipping address unless we're finalizing payment
		if (!isPaying && !address) navigate('/checkout/shipping', { replace: true })
	}, [address, isPaying, navigate])

	// Card form state
	const [cardName, setCardName] = useState('')
	const [cardNumber, setCardNumber] = useState('')
	const [expiry, setExpiry] = useState('')
	const [cvv, setCvv] = useState('')

	// Check if card is different from saved card
	const isCardDifferent = useMemo(() => {
		if (!user?.cardLast4) return true
		const currentLast4 = cardNumber.replace(/\s+/g, '').slice(-4)
		return currentLast4 !== user.cardLast4 || 
					 cardName.trim() !== (user.cardName || '') || 
					 expiry !== (user.cardExpiry || '')
	}, [user, cardName, cardNumber, expiry])

	// Auto-fill saved card
	const hasSavedCard = !!user?.cardLast4
	const useSavedCard = () => {
		if (!user) return
		setCardName(user.cardName || '')
		setCardNumber(`**** **** **** ${user.cardLast4 || ''}`)
		setExpiry(user.cardExpiry || '')
	}

	const saveCardToProfile = async () => {
		if (!user || !cardName || !cardNumber || !expiry) return
		try {
			setIsSavingCard(true)
			const last4 = cardNumber.replace(/\s+/g, '').slice(-4)
			const updated = await userService.updateProfile({
				cardName: cardName.trim(),
				cardLast4: last4,
				cardExpiry: expiry
			})
			dispatch(setUser(updated))
			setShowSaveCardModal(false)
		} catch (error) {
			console.error('Failed to save card:', error)
			alert('ไม่สามารถบันทึกข้อมูลบัตรได้')
		} finally {
			setIsSavingCard(false)
		}
	}

	const cardValid = useMemo(() => {
		const digits = cardNumber.replace(/\s+/g, '')
		return cardName.trim().length >= 2 && /^\d{16}$/.test(digits) && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3,4}$/.test(cvv)
	}, [cardName, cardNumber, expiry, cvv])

	// QR form state
	const [bank, setBank] = useState('KBANK')

	const handlePay = async () => {
		try {
			// ถ้าใช้บัตรใหม่หรือแก้ไขบัตรเดิม → ถามก่อนว่าจะบันทึกไหม
			if (method === 'card' && user && cardValid && isCardDifferent) {
				setShowSaveCardModal(true)
				return // รอ user ตอบก่อนจะชำระเงิน
			}

			dispatch(setPaymentMethod(method))
			setIsPaying(true)
			
			const orderId = Math.random().toString(36).slice(2, 10).toUpperCase()
			
			// บันทึกออเดอร์ลง Database
			const orderPayload = {
				orderId,
				items: items.map(item => ({
					productId: item.id,
					name: item.name,
					price: item.price,
					qty: item.qty,
					image: item.image
				})),
				address: address ?? undefined,
				paymentMethod: method,
				subtotal
			}
			
			const savedOrder = await orderService.create(orderPayload)
			
			// บันทึกข้อมูลออเดอร์ทั้งหมดไว้ใน localStorage สำหรับหน้า success
			const lastOrderData = {
				orderId: savedOrder.orderId,
				items: items.map(item => ({
					id: item.id,
					name: item.name,
					price: item.price,
					qty: item.qty,
					image: item.image
				})),
				address: address ? {
					id: address.id,
					fullName: address.fullName,
					phone: address.phone,
					address1: address.address1,
					address2: address.address2 || '',
					province: address.province,
					district: address.district,
					postcode: address.postcode
				} : null,
				paymentMethod: method,
				subtotal,
				timestamp: Date.now()
			}
			localStorage.setItem('lastOrder', JSON.stringify(lastOrderData))
			
			dispatch(clearCart())
			dispatch(clearCheckout())
			navigate(`/checkout/success?order=${savedOrder.orderId}`)
		} catch (error) {
			console.error('Failed to create order:', error)
			alert('เกิดข้อผิดพลาดในการสร้างออเดอร์ กรุณาลองใหม่อีกครั้ง')
			setIsPaying(false)
		}
	}

	const proceedWithoutSaving = () => {
		setShowSaveCardModal(false)
		// เรียก handlePay อีกครั้งโดยข้ามการเช็คบัตร
		dispatch(setPaymentMethod(method))
		setIsPaying(true)
		
		const orderId = Math.random().toString(36).slice(2, 10).toUpperCase()
		
		const orderPayload = {
			orderId,
			items: items.map(item => ({
				productId: item.id,
				name: item.name,
				price: item.price,
				qty: item.qty,
				image: item.image
			})),
			address: address ?? undefined,
			paymentMethod: method,
			subtotal
		}
		
		orderService.create(orderPayload).then(savedOrder => {
			const lastOrderData = {
				orderId: savedOrder.orderId,
				items: items.map(item => ({
					id: item.id,
					name: item.name,
					price: item.price,
					qty: item.qty,
					image: item.image
				})),
				address: address ? {
					id: address.id,
					fullName: address.fullName,
					phone: address.phone,
					address1: address.address1,
					address2: address.address2 || '',
					province: address.province,
					district: address.district,
					postcode: address.postcode
				} : null,
				paymentMethod: method,
				subtotal,
				timestamp: Date.now()
			}
			localStorage.setItem('lastOrder', JSON.stringify(lastOrderData))
			
			dispatch(clearCart())
			dispatch(clearCheckout())
			navigate(`/checkout/success?order=${savedOrder.orderId}`)
		}).catch(error => {
			console.error('Failed to create order:', error)
			alert('เกิดข้อผิดพลาดในการสร้างออเดอร์ กรุณาลองใหม่อีกครั้ง')
			setIsPaying(false)
		})
	}

	const canPay = method === 'card' ? cardValid : !!bank

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
			<CheckoutProgress currentStep={3} />
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
				<div className="lg:col-span-2 space-y-6">
				<div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
					<h2 className="text-xl font-semibold mb-4">เลือกวิธีชำระเงิน</h2>

					<div className="flex gap-3 mb-6">
						<button onClick={() => setMethod('card')} className={`px-4 py-2 rounded-lg border ${method === 'card' ? 'border-blue-600 text-blue-600' : 'border-gray-300 dark:border-gray-700'}`}>บัตรเครดิต/เดบิต</button>
						<button onClick={() => setMethod('qr')} className={`px-4 py-2 rounded-lg border ${method === 'qr' ? 'border-blue-600 text-blue-600' : 'border-gray-300 dark:border-gray-700'}`}>QR PromptPay</button>
					</div>

					{method === 'card' ? (
						<>
							{hasSavedCard && (
								<div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
									<div className="flex justify-between items-center">
										<div>
											<p className="text-sm font-medium">บัตรที่บันทึกไว้</p>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{user?.cardName} • •••• {user?.cardLast4} • {user?.cardExpiry}
											</p>
										</div>
										<button onClick={useSavedCard} className="text-sm text-blue-600 hover:underline">ใช้บัตรนี้</button>
									</div>
								</div>
							)}
							<div className="grid sm:grid-cols-2 gap-4">
								<div className="sm:col-span-2">
									<label className="block text-sm text-gray-600 mb-1">ชื่อบนบัตร</label>
									<input value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
								</div>
								<div className="sm:col-span-2">
									<label className="block text-sm text-gray-600 mb-1">หมายเลขบัตร (16 หลัก)</label>
									<input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim())} maxLength={19} placeholder="1234 5678 9012 3456" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">หมดอายุ (MM/YY)</label>
									<input value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/[^\d]/g, '').slice(0,4).replace(/(\d{2})/, '$1/'))} placeholder="MM/YY" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
								</div>
								<div>
									<label className="block text-sm text-gray-600 mb-1">CVV</label>
									<input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, '').slice(0,4))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
								</div>
							</div>
						</>
					) : (
						<div className="space-y-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">เลือกธนาคาร</label>
								<select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
									<option value="KBANK">กสิกรไทย (KBANK)</option>
									<option value="SCB">ไทยพาณิชย์ (SCB)</option>
									<option value="BBL">กรุงเทพ (BBL)</option>
									<option value="KTB">กรุงไทย (KTB)</option>
								</select>
							</div>
							<div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
								<p className="mb-2">สแกน QR เพื่อชำระเงิน (Mock)</p>
								<img alt="QR" className="mx-auto w-44 h-44 bg-gray-100 dark:bg-gray-800 rounded" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER:${subtotal}`}/>
							</div>
						</div>
					)}

					<div className="mt-6 flex gap-3">
						<button disabled={!canPay} onClick={handlePay} className="rounded-xl bg-green-600 text-white px-5 py-3 font-semibold disabled:opacity-50">ชำระเงิน</button>
						<button onClick={() => navigate('/checkout/shipping')} className="rounded-xl border px-5 py-3">ย้อนกลับ</button>
					</div>
				</div>
						</div>

						<aside className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-max sticky top-20">
							<h3 className="text-lg font-semibold mb-3">สรุปคำสั่งซื้อ</h3>
							<div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
								<div className="font-medium text-gray-900 dark:text-gray-100">ที่อยู่จัดส่ง</div>
								{address && (
									<div>
										{address.fullName} • {address.phone}
										<br />
										{address.address1} {address.address2} {address.district} {address.province} {address.postcode}
									</div>
								)}
							</div>
							<div className="space-y-2 text-sm">
								{items.map((it) => (
									<div key={it.id} className="flex justify-between">
										<span>
											{it.name} × {it.qty}
										</span>
										<span>{currency(it.price * it.qty)}</span>
									</div>
								))}
							</div>
							<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between font-semibold">
								<span>ยอดรวม</span>
					<span>{currency(subtotal)}</span>
				</div>
			</aside>
		</motion.div>

		{/* Modal บันทึกบัตร */}
		{showSaveCardModal && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSaveCardModal(false)}>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
					onClick={(e) => e.stopPropagation()}
				>
					<h3 className="text-lg font-semibold mb-2">บันทึกข้อมูลบัตร?</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
						ต้องการบันทึกข้อมูลบัตรนี้สำหรับการสั่งซื้อครั้งถัดไปหรือไม่?
					</p>
					<div className="flex gap-3">
						<button
							onClick={async () => {
								await saveCardToProfile()
								proceedWithoutSaving()
							}}
							disabled={isSavingCard}
							className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 font-medium disabled:opacity-50"
						>
							{isSavingCard ? 'กำลังบันทึก...' : 'บันทึก'}
						</button>
						<button
							onClick={proceedWithoutSaving}
							className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 py-2.5 font-medium"
						>
							ข้าม
						</button>
					</div>
				</motion.div>
			</div>
		)}
		</div>
	)
}

export default Payment