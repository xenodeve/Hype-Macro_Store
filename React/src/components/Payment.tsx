import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { selectCartItems, selectCartSubtotal, clearCart } from '../features/cart/cartSlice'
import { setPaymentMethod, type PaymentMethod, clearCheckout } from '../features/checkout/checkoutSlice'
import { setUser } from '../features/auth/authSlice'
import { orderService } from '../services/orderService'
import { userService } from '../services/userService'
import { paymentService } from '../services/paymentService'
import CheckoutProgress from './CheckoutProgress'

const currency = (n: number) => n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })

// Helper function to format date YYYYMMDD -> DD/MM/YYYY
const formatSlipDate = (dateStr: string): string => {
	if (!dateStr || dateStr.length !== 8) return dateStr;
	const year = dateStr.substring(0, 4);
	const month = dateStr.substring(4, 6);
	const day = dateStr.substring(6, 8);
	return `${day}/${month}/${year}`;
}

// Helper function to format time HHmmss -> HH:mm:ss
const formatSlipTime = (timeStr: string): string => {
	if (!timeStr || timeStr.length !== 6) return timeStr;
	const hours = timeStr.substring(0, 2);
	const minutes = timeStr.substring(2, 4);
	const seconds = timeStr.substring(4, 6);
	return `${hours}:${minutes}:${seconds}`;
}

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

	// Card form state
	const [cardName, setCardName] = useState('')
	const [cardNumber, setCardNumber] = useState('')
	const [expiry, setExpiry] = useState('')
	const [cvv, setCvv] = useState('')

	// QR form state
	const [qrCodeDataURL, setQrCodeDataURL] = useState('')
	const [qrExpiry, setQrExpiry] = useState<Date | null>(null)
	const [isGeneratingQR, setIsGeneratingQR] = useState(false)
	const [currentOrderId, setCurrentOrderId] = useState('')
	const [timeRemaining, setTimeRemaining] = useState<number>(0) // เวลาที่เหลือในวินาที
	const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false) // ติดตามว่ากดยืนยันการโอนแล้วหรือยัง
	const [hasSelectedPaymentMethod, setHasSelectedPaymentMethod] = useState(false) // ติดตามว่าเลือกวิธีการชำระเงินแล้วหรือยัง
	const [hasPendingSlip, setHasPendingSlip] = useState(false) // ติดตามว่ามี order ที่ยืนยันแล้วแต่ยังไม่ส่งสลิป

	// Bank Transfer state
	const bankAccountInfo = {
		accountNumber: '038-3-87041-0',
		bankName: 'ธนาคารกสิกรไทย (KBANK)',
		accountName: 'ด.ช. ธีรตม์ ดอกกฐิน',
	}

	// Slip verification state
	const [slipFile, setSlipFile] = useState<File | null>(null)
	const [slipPreview, setSlipPreview] = useState<string | null>(null)
	const [isVerifyingSlip, setIsVerifyingSlip] = useState(false)
	const [slipVerificationResult, setSlipVerificationResult] = useState<any>(null)

	useEffect(() => {
		// ตรวจสอบว่ามีการกลับมาจาก PendingPaymentNotification หรือไม่
		const resumePaymentData = sessionStorage.getItem('resumePayment')
		if (resumePaymentData) {
			try {
				const { orderId, method: paymentMethod } = JSON.parse(resumePaymentData)
				
				// ตั้งค่า state ให้แสดงหน้าอัพโหลดสลิป (order ที่ยืนยันการโอนแล้ว)
				setCurrentOrderId(orderId)
				setMethod(paymentMethod as PaymentMethod)
				setHasConfirmedPayment(true)
				setIsPaying(true)
				
				// ลบข้อมูลออกจาก sessionStorage
				sessionStorage.removeItem('resumePayment')
			} catch (error) {
				console.error('Failed to resume payment:', error)
				sessionStorage.removeItem('resumePayment')
			}
		}
		
		// ตรวจสอบว่ามีการกลับมาจาก UnpaidOrderAlert หรือไม่
		const unpaidOrderData = sessionStorage.getItem('unpaidOrder')
		if (unpaidOrderData) {
			try {
				const { orderId, method: paymentMethod, hasConfirmedPayment: confirmedPayment } = JSON.parse(unpaidOrderData)
				
				// ตั้งค่า state ให้แสดงหน้า payment ตามสถานะของ order
				setCurrentOrderId(orderId)
				setMethod(paymentMethod as PaymentMethod)
				
				// ถ้ากดยืนยันการชำระเงินแล้ว ให้พาไปหน้าอัพโหลดสลิปเลย
				if (confirmedPayment) {
					setHasConfirmedPayment(true)
					setIsPaying(true) // ตั้งค่านี้เฉพาะเมื่อกดยืนยันแล้ว
				}
				// ถ้ายังไม่ได้กดยืนยัน ให้อยู่ในสถานะปกติ (isPaying = false) เพื่อให้กดปุ่มได้
				
				// ลบข้อมูลออกจาก sessionStorage
				sessionStorage.removeItem('unpaidOrder')
			} catch (error) {
				console.error('Failed to load unpaid order:', error)
				sessionStorage.removeItem('unpaidOrder')
			}
		}
		
		// ลบ pendingPayment ออกเพราะ user กลับมาแล้ว
		localStorage.removeItem('pendingPayment')
	}, [])

	// ตรวจสอบว่ามี pending payment (ยืนยันแล้วแต่ยังไม่ส่งสลิป) หรือไม่
	useEffect(() => {
		const checkPendingPayment = () => {
			const pendingPaymentData = localStorage.getItem('pendingPayment')
			if (pendingPaymentData) {
				try {
					const { orderId, method: paymentMethod } = JSON.parse(pendingPaymentData)
					// ถ้า orderId ตรงกับ currentOrderId และ method ตรงกัน แสดงว่ามี pending slip
					if (orderId === currentOrderId && paymentMethod === method) {
						setHasPendingSlip(true)
					}
				} catch (error) {
					console.error('Failed to parse pending payment:', error)
				}
			}
		}

		checkPendingPayment()
	}, [currentOrderId, method])

	useEffect(() => {
		// Block entering payment with empty cart, but allow when we are processing payment or resuming from notification
		const isResuming = sessionStorage.getItem('resumePayment') || sessionStorage.getItem('unpaidOrder')
		if (!isPaying && items.length === 0 && !isResuming) navigate('/cart', { replace: true })
	}, [items, isPaying, navigate])
	useEffect(() => {
		// Require shipping address unless we're finalizing payment or resuming from notification
		const isResuming = sessionStorage.getItem('resumePayment') || sessionStorage.getItem('unpaidOrder')
		if (!isPaying && !address && !isResuming) navigate('/checkout/shipping', { replace: true })
	}, [address, isPaying, navigate])

	// Countdown timer สำหรับ QR Code
	useEffect(() => {
		if (!qrExpiry) {
			setTimeRemaining(0)
			return
		}

		// คำนวณเวลาที่เหลือ
		const calculateTimeRemaining = () => {
			const now = new Date().getTime()
			const expiryTime = new Date(qrExpiry).getTime()
			const diff = Math.floor((expiryTime - now) / 1000) // แปลงเป็นวินาที
			return Math.max(0, diff)
		}

		// ตั้งค่าเริ่มต้น
		setTimeRemaining(calculateTimeRemaining())

		// อัพเดททุกวินาที
		const interval = setInterval(() => {
			const remaining = calculateTimeRemaining()
			setTimeRemaining(remaining)
			
			// ถ้าหมดเวลา ล้าง QR Code
			if (remaining <= 0) {
				clearInterval(interval)
				setQrCodeDataURL('')
				setQrExpiry(null)
				alert('QR Code หมดอายุแล้ว กรุณาสร้าง QR Code ใหม่')
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [qrExpiry])

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

	const handlePay = async () => {
		try {
			// ถ้าใช้บัตรใหม่หรือแก้ไขบัตรเดิม → ถามก่อนว่าจะบันทึกไหม
			if (method === 'card' && user && cardValid && isCardDifferent) {
				setShowSaveCardModal(true)
				return // รอ user ตอบก่อนจะชำระเงิน
			}

		dispatch(setPaymentMethod(method))
		setIsPaying(true)
		setHasSelectedPaymentMethod(true) // ล็อคการเลือก payment method
		
		// ถ้ามี orderId อยู่แล้ว (กลับมาจาก UnpaidOrderAlert) ใช้ orderId เดิม
		// ถ้าไม่มี ให้สร้างใหม่
		let orderId = currentOrderId
		if (!orderId) {
			orderId = Math.random().toString(36).slice(2, 10).toUpperCase()
			setCurrentOrderId(orderId)
		}			// บันทึกออเดอร์ลง Database (ถ้ายังไม่มี order ใน database)
			// ถ้ามี currentOrderId อยู่แล้ว แสดงว่า order ถูกสร้างไว้แล้ว ไม่ต้องสร้างใหม่
			let savedOrder
			if (currentOrderId) {
				// Order มีอยู่แล้ว ดึงข้อมูลมาใช้
				savedOrder = await orderService.getByOrderId(currentOrderId)
			} else {
				// สร้าง order ใหม่
				const orderPayload = {
					orderId,
					items: items.map(item => ({
						productId: item.id,
						name: item.name,
						price: item.price,
						qty: item.qty,
						image: item.image
					})),
					address: address ? {
						fullName: address.fullName,
						phone: address.phone,
						address: address.address2 
							? `${address.address1} ${address.address2}` 
							: address.address1,
						district: address.district,
						province: address.province,
						postalCode: address.postcode
					} : undefined,
					paymentMethod: method,
					subtotal
				}
				
				savedOrder = await orderService.create(orderPayload)
			}
			
			// ถ้าเลือกชำระด้วย QR Code → สร้าง QR Code จาก Backend
			if (method === 'qr') {
				setIsGeneratingQR(true)
				try {
					// เรียก API สร้าง PromptPay QR Code
					const qrResponse = await paymentService.generateQR(savedOrder.orderId, subtotal)
					
					setQrCodeDataURL(qrResponse.data.qrCodeDataURL)
					setQrExpiry(new Date(qrResponse.data.expiresAt))
					setIsGeneratingQR(false)
					setIsPaying(false) // รีเซ็ตสถานะหลังสร้าง QR เสร็จ
					
					// อยู่หน้า Payment รอให้ยืนยันการชำระเงิน
					return
				} catch (error) {
					console.error('Failed to generate QR Code:', error)
					alert('ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง')
					setIsPaying(false)
					setIsGeneratingQR(false)
					return
				}
			}

			// ถ้าเลือกโอนธนาคาร → แสดงรายละเอียดบัญชีและรอให้อัปโหลดสลิป
			if (method === 'bank-transfer') {
				// อยู่หน้า Payment รอให้อัปโหลดสลิป
				setIsPaying(false)
				return
			}
			
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
		setCurrentOrderId(orderId)
		
		const orderPayload = {
			orderId,
			items: items.map(item => ({
				productId: item.id,
				name: item.name,
				price: item.price,
				qty: item.qty,
				image: item.image
			})),
			address: address ? {
				fullName: address.fullName,
				phone: address.phone,
				address: address.address2 
					? `${address.address1} ${address.address2}` 
					: address.address1,
				district: address.district,
				province: address.province,
				postalCode: address.postcode
			} : undefined,
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

	// ฟังก์ชันยืนยันการชำระเงิน (สำหรับ QR Code)
	const handleConfirmPayment = async () => {
		try {
			// อัพเดตสถานะใน database
			await orderService.confirmPayment(currentOrderId)
			
			// ซ่อน QR Code และแสดงส่วนอัปโหลดสลิปแทน
			setHasConfirmedPayment(true)
			setQrCodeDataURL('') // ล้าง QR Code
			
			// บันทึกสถานะลง localStorage เพื่อแจ้งเตือนใน page อื่น
			const pendingPayment = {
				orderId: currentOrderId,
				method: method,
				confirmedAt: Date.now(),
				amount: subtotal
			}
			localStorage.setItem('pendingPayment', JSON.stringify(pendingPayment))
		} catch (error) {
			console.error('Failed to confirm payment:', error)
			alert('เกิดข้อผิดพลาดในการยืนยันการชำระเงิน กรุณาลองใหม่อีกครั้ง')
		}
	}

	// ฟังก์ชันย้อนกลับจากหน้าอัพโหลดสลิป
	const handleBackFromSlipUpload = () => {
		console.log('=== handleBackFromSlipUpload called ===')
		console.log('Before reset - isPaying:', isPaying, 'isGeneratingQR:', isGeneratingQR)
		
		// รีเซ็ตสถานะการอัพโหลดสลิป
		setHasConfirmedPayment(false)
		setSlipFile(null)
		setSlipPreview(null)
		setSlipVerificationResult(null)
		
		// รีเซ็ตสถานะการชำระเงินบางส่วน
		// ถ้าเป็น QR Code ให้เก็บ isPaying ไว้เพื่อแสดง QR Code ที่สร้างไว้
		if (method !== 'qr') {
			setIsPaying(false)
		}
		setIsGeneratingQR(false)
		setHasSelectedPaymentMethod(false)
		
		// ถ้าเป็น QR Code ไม่ต้องล้าง qrCodeDataURL และ qrExpiry
		// เพื่อให้ QR Code ยังแสดงอยู่และสามารถแสดง notification ได้
		// ถ้าเป็น bank-transfer ให้ล้าง
		if (method === 'bank-transfer') {
			setQrCodeDataURL('')
			setQrExpiry(null)
		}
		
		// ตั้งค่า hasPendingSlip เพื่อแสดง notification
		setHasPendingSlip(true)
		
		console.log('States reset - should show notification and QR code')
		
		// เก็บ currentOrderId ไว้เพื่อใช้ Order เดิม
	}

	// ฟังก์ชันสำหรับไปหน้าส่งสลิปจาก notification
	const handleGoToSlipUpload = () => {
		setHasConfirmedPayment(true)
		setHasPendingSlip(false)
		// ลบ pendingPayment ออกเพราะ user กำลังจะส่งสลิป
		localStorage.removeItem('pendingPayment')
	}

	// ฟังก์ชันเปลี่ยนวิธีการชำระเงิน
	const handleChangePaymentMethod = () => {
		// รีเซ็ตสถานะทั้งหมด แต่เก็บ orderId ไว้
		setHasSelectedPaymentMethod(false)
		setIsPaying(false)
		setHasConfirmedPayment(false)
		setQrCodeDataURL('')
		setQrExpiry(null)
		setSlipFile(null)
		setSlipPreview(null)
		setSlipVerificationResult(null)
		// ไม่รีเซ็ต currentOrderId เพื่อใช้หมายเลข order เดิม
	}

	// จัดการการเลือกไฟล์สลิป
	const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// ตรวจสอบประเภทไฟล์
		if (!file.type.match(/^image\/(jpe?g|png|webp)$/)) {
			alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)')
			return
		}

		// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert('ขนาดไฟล์ต้องไม่เกิน 5MB')
			return
		}

		setSlipFile(file)

		// สร้าง Preview
		const reader = new FileReader()
		reader.onloadend = () => {
			setSlipPreview(reader.result as string)
		}
		reader.readAsDataURL(file)
	}

	// ฟังก์ชันตรวจสอบสลิป
	const handleVerifySlip = async () => {
		if (!slipFile || !currentOrderId) return

		setIsVerifyingSlip(true)
		setSlipVerificationResult(null)

		try {
			const result = await paymentService.verifySlipUpload(slipFile, currentOrderId)
			setSlipVerificationResult(result)

			if (result.success && result.data?.isValid) {
				alert('✅ สลิปถูกต้อง! กำลังดำเนินการต่อ...')
				
				// ลบ pendingPayment เพราะอัพโหลดสลิปสำเร็จแล้ว
				localStorage.removeItem('pendingPayment')
				
				// บันทึกข้อมูลออเดอร์ทั้งหมดไว้ใน localStorage สำหรับหน้า success
				const lastOrderData = {
					orderId: currentOrderId,
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
					total: subtotal,
					paymentMethod: 'qr' as PaymentMethod,
					createdAt: new Date().toISOString()
				}
				
				localStorage.setItem('lastOrder', JSON.stringify(lastOrderData))
				
				// ล้างตะกร้าและ checkout
				dispatch(clearCart())
				dispatch(clearCheckout())
				
				// ไปหน้า success
				navigate(`/checkout/success?order=${currentOrderId}`)
			} else {
				alert(`❌ ${result.message || 'สลิปไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'}`)
			}
		} catch (error) {
			console.error('Slip verification error:', error)
			alert('เกิดข้อผิดพลาดในการตรวจสอบสลิป')
		} finally {
			setIsVerifyingSlip(false)
		}
	}

	const canPay = method === 'card' ? cardValid : true

	// Debug: แสดง state สำหรับ troubleshooting
	useEffect(() => {
		console.log('Payment states:', {
			isPaying,
			isGeneratingQR,
			hasConfirmedPayment,
			qrCodeDataURL: qrCodeDataURL ? 'exists' : 'empty',
			currentOrderId,
			method,
			canPay
		})
	}, [isPaying, isGeneratingQR, hasConfirmedPayment, qrCodeDataURL, currentOrderId, method, canPay])

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

					<div className="flex gap-3 mb-6 flex-wrap">
						<button 
							onClick={() => setMethod('card')}
							disabled={(hasConfirmedPayment && method !== 'card') || (hasSelectedPaymentMethod && method !== 'card')}
							className={`px-4 py-2 rounded-lg border transition ${
								method === 'card' 
									? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' 
									: 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
							} ${((hasConfirmedPayment && method !== 'card') || (hasSelectedPaymentMethod && method !== 'card')) ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							💳 บัตรเครดิต/เดบิต
						</button>
						<button 
							onClick={() => setMethod('qr')}
							disabled={(hasConfirmedPayment && method !== 'qr') || (hasSelectedPaymentMethod && method !== 'qr')}
							className={`px-4 py-2 rounded-lg border transition ${
								method === 'qr' 
									? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' 
									: 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
							} ${((hasConfirmedPayment && method !== 'qr') || (hasSelectedPaymentMethod && method !== 'qr')) ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							📱 QR Code (PromptPay)
						</button>
						<button 
							onClick={() => setMethod('bank-transfer')}
							disabled={(hasConfirmedPayment && method !== 'bank-transfer') || (hasSelectedPaymentMethod && method !== 'bank-transfer')}
							className={`px-4 py-2 rounded-lg border transition ${
								method === 'bank-transfer' 
									? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600' 
									: 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
							} ${((hasConfirmedPayment && method !== 'bank-transfer') || (hasSelectedPaymentMethod && method !== 'bank-transfer')) ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							🏦 โอนธนาคาร
						</button>
					</div>

					{/* ปุ่มเปลี่ยนวิธีการชำระเงิน */}
					{hasSelectedPaymentMethod && !hasConfirmedPayment && (
						<div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="text-yellow-600 dark:text-yellow-400">🔒</span>
									<p className="text-sm text-yellow-800 dark:text-yellow-200">
										วิธีการชำระเงินถูกล็อคแล้ว
									</p>
								</div>
								<button
									onClick={handleChangePaymentMethod}
									className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
								>
									เปลี่ยนวิธีการชำระเงิน
								</button>
							</div>
						</div>
					)}

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
					) : method === 'qr' ? (
						<div className="space-y-4">
							<div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
								<div className="flex items-start gap-3">
									<span className="text-2xl">📱</span>
									<div>
										<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
											ชำระผ่าน PromptPay QR Code
										</h3>
										<p className="text-sm text-blue-700 dark:text-blue-300">
											สแกน QR Code ด้วยแอพธนาคารของคุณเพื่อชำระเงิน
										</p>
									</div>
								</div>
							</div>

							{/* Notification สำหรับ order ที่ยืนยันแล้วแต่ยังไม่ส่งสลิป */}
							{hasPendingSlip && currentOrderId && !hasConfirmedPayment && (
								<div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											<svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
											</svg>
										</div>
										<div className="flex-1">
											<h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
												⚠️ คุณยืนยันการโอนเงินแล้ว
											</h3>
											<p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
												Order #{currentOrderId} - ยืนยันการโอนแล้วแต่ยังไม่ได้ส่งสลิปยืนยัน กรุณาอัพโหลดสลิปเพื่อดำเนินการต่อ
											</p>
											<button
												onClick={handleGoToSlipUpload}
												className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
											>
												📄 ส่งสลิปเลย
											</button>
										</div>
										<button
											onClick={() => setHasPendingSlip(false)}
											className="flex-shrink-0 text-yellow-600 hover:text-yellow-700 transition"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
							)}

							{qrCodeDataURL ? (
								<div className="rounded-xl border border-gray-300 dark:border-gray-700 p-6 text-center space-y-4">
									<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4">
										<p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
											สแกน QR Code เพื่อชำระเงิน
										</p>
										<p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">
											{currency(subtotal)}
										</p>
										
										<img 
											alt="QR Code" 
											className="mx-auto w-64 h-64 rounded-lg shadow-lg" 
											src={qrCodeDataURL}
										/>
										{qrExpiry && (
											<div className="mt-3 space-y-1">
												<div className="flex items-center justify-center gap-2">
													<svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span className={`text-sm font-semibold ${
														timeRemaining < 300 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
													}`}>
														เหลือเวลา: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} นาที
													</span>
												</div>
												<p className="text-xs text-gray-600 dark:text-gray-400">
													หมดอายุ: {new Date(qrExpiry).toLocaleString('th-TH')}
												</p>
											</div>
										)}
									</div>
									<div className="space-y-3">
										{/* ปุ่มยืนยันการโอน */}
										<button 
											onClick={handleConfirmPayment}
											className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-3 font-semibold transition"
										>
											✓ ยืนยันการโอนเงินแล้ว
										</button>
										<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
											กดปุ่มด้านบนหลังจากโอนเงินเรียบร้อยแล้ว
										</p>
									</div>
								</div>
							) : hasConfirmedPayment ? (
								// แสดงส่วนอัปโหลดสลิปหลังจากกดยืนยันการโอน
								<div className="space-y-4">
									<div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 bg-blue-50 dark:bg-blue-950">
										<div className="text-center mb-4">
											<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
												📄 อัปโหลดสลิปเพื่อตรวจสอบอัตโนมัติ
											</h3>
											<p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
												ระบบจะตรวจสอบความถูกต้องของสลิปอัตโนมัติ
											</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">
												Order ID: <span className="font-mono font-semibold">{currentOrderId}</span>
											</p>
										</div>

										{!slipPreview ? (
											<div>
												<label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
													<div className="flex flex-col items-center justify-center pt-5 pb-6">
														<svg className="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
														</svg>
														<p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
															<span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															PNG, JPG, WEBP (สูงสุด 5MB)
														</p>
													</div>
													<input
														type="file"
														className="hidden"
														accept="image/jpeg,image/png,image/webp"
														onChange={handleSlipFileChange}
													/>
												</label>
											</div>
										) : (
											<div className="space-y-3">
												<div className="relative">
													<img
														src={slipPreview}
														alt="Slip Preview"
														className="w-full h-80 object-contain rounded-lg bg-white"
													/>
													<button
														onClick={() => {
															setSlipFile(null)
															setSlipPreview(null)
															setSlipVerificationResult(null)
														}}
														className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>

												{slipVerificationResult && (
													<div className={`p-4 rounded-lg ${
														slipVerificationResult.success && slipVerificationResult.data?.isValid
															? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
															: 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
													}`}>
														<p className={`text-sm font-semibold mb-2 ${
															slipVerificationResult.success && slipVerificationResult.data?.isValid
																? 'text-green-800 dark:text-green-200'
																: 'text-red-800 dark:text-red-200'
														}`}>
															{slipVerificationResult.message}
														</p>
														{slipVerificationResult.data && (
															<div className="mt-3 space-y-2">
																{/* ข้อมูลหลัก */}
																<div className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3">
																	<div className="flex justify-between">
																		<span className="font-medium">ธนาคารผู้โอน:</span>
																		<span className="font-semibold">{slipVerificationResult.data.sendingBank}</span>
																	</div>
																	{slipVerificationResult.data.receivingBank && (
																		<div className="flex justify-between">
																			<span className="font-medium">ธนาคารผู้รับ:</span>
																			<span className="font-semibold">{slipVerificationResult.data.receivingBank}</span>
																		</div>
																	)}
																	<div className="flex justify-between">
																		<span className="font-medium">เลขที่รายการ:</span>
																		<span className="font-mono text-xs">{slipVerificationResult.data.transRef}</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="font-medium">จำนวนเงิน:</span>
																		<span className="font-bold text-blue-600 dark:text-blue-400">
																			{parseFloat(slipVerificationResult.data.amount).toLocaleString('th-TH', {
																				minimumFractionDigits: 2,
																				maximumFractionDigits: 2
																			})} บาท
																		</span>
																	</div>
																	{slipVerificationResult.data.expectedAmount && (
																		<div className="flex justify-between">
																			<span className="font-medium">จำนวนที่ต้องชำระ:</span>
																			<span className="font-semibold">
																				{parseFloat(slipVerificationResult.data.expectedAmount).toLocaleString('th-TH', {
																					minimumFractionDigits: 2,
																					maximumFractionDigits: 2
																				})} บาท
																			</span>
																		</div>
																	)}
																</div>

																{/* วันที่และเวลาทำรายการ */}
																{(slipVerificationResult.data.transDate || slipVerificationResult.data.transTime || slipVerificationResult.data.transactionDateTime) && (
																	<div className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
																		<div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">⏰ เวลาทำรายการ</div>
																		{slipVerificationResult.data.transDate && (
																			<div className="flex justify-between">
																				<span className="font-medium">วันที่:</span>
																				<span className="font-mono">{formatSlipDate(slipVerificationResult.data.transDate)}</span>
																			</div>
																		)}
																		{slipVerificationResult.data.transTime && (
																			<div className="flex justify-between">
																				<span className="font-medium">เวลา:</span>
																				<span className="font-mono">{formatSlipTime(slipVerificationResult.data.transTime)}</span>
																			</div>
																		)}
																		{slipVerificationResult.data.transactionDateTime && (
																			<div className="flex justify-between">
																				<span className="font-medium">เวลาแบบเต็ม:</span>
																				<span className="font-mono text-xs">
																					{new Date(slipVerificationResult.data.transactionDateTime).toLocaleString('th-TH', {
																						year: 'numeric',
																						month: '2-digit',
																						day: '2-digit',
																						hour: '2-digit',
																						minute: '2-digit',
																						second: '2-digit'
																					})}
																				</span>
																			</div>
																		)}
																	</div>
																)}

																{/* ผลการตรวจสอบแต่ละเงื่อนไข */}
																{slipVerificationResult.data.validations && (
																	<div className="text-xs space-y-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
																		<div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">✓ ผลการตรวจสอบ</div>
																		<div className="flex justify-between items-center">
																			<span>QR Code ถูกต้อง:</span>
																			<span className={slipVerificationResult.data.validations.qrCodeFound ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.qrCodeFound ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>จำนวนเงินถูกต้อง:</span>
																			<span className={slipVerificationResult.data.validations.amountMatch ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.amountMatch ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>โอนภายในเวลา:</span>
																			<span className={slipVerificationResult.data.validations.withinTimeRange ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.withinTimeRange ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>ไม่ใช่สลิปซ้ำ:</span>
																			<span className={slipVerificationResult.data.validations.notDuplicate ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.notDuplicate ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>โครงสร้างสลิป:</span>
																			<span className={slipVerificationResult.data.validations.slipStructureValid ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.slipStructureValid ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																	</div>
																)}
															</div>
														)}
													</div>
												)}

												<button
													onClick={handleVerifySlip}
													disabled={isVerifyingSlip}
													className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 font-semibold transition"
												>
													{isVerifyingSlip ? (
														<span className="flex items-center justify-center gap-2">
															<svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
																<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
																<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
															</svg>
															กำลังตรวจสอบ...
														</span>
													) : (
														'🔍 ตรวจสอบสลิปและดำเนินการต่อ'
													)}
												</button>
											</div>
										)}

										{/* ปุ่มย้อนกลับ - แสดงทั้งตอนยังไม่ได้อัพโหลดและอัพโหลดแล้ว */}
										<button
											onClick={handleBackFromSlipUpload}
											className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition mt-3"
										>
											← ย้อนกลับ
										</button>
									</div>
								</div>
							) : (
								<div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
									<p className="text-gray-600 dark:text-gray-400 mb-2">
										{isGeneratingQR ? 'กำลังสร้าง QR Code...' : 'กดปุ่มสร้าง QR Code เพื่อรับ QR Code สำหรับชำระเงิน'}
									</p>
									{isGeneratingQR && (
										<div className="mx-auto w-44 h-44 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
											<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
										</div>
									)}
								</div>
							)}
						</div>
					) : method === 'bank-transfer' ? (
						<div className="space-y-4">
							{/* Notification สำหรับ order ที่ยืนยันแล้วแต่ยังไม่ส่งสลิป */}
							{hasPendingSlip && currentOrderId && !hasConfirmedPayment && (
								<div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											<svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
											</svg>
										</div>
										<div className="flex-1">
											<h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
												⚠️ คุณยืนยันการโอนเงินแล้ว
											</h3>
											<p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
												Order #{currentOrderId} - ยืนยันการโอนแล้วแต่ยังไม่ได้ส่งสลิปยืนยัน กรุณาอัพโหลดสลิปเพื่อดำเนินการต่อ
											</p>
											<button
												onClick={handleGoToSlipUpload}
												className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
											>
												📄 ส่งสลิปเลย
											</button>
										</div>
										<button
											onClick={() => setHasPendingSlip(false)}
											className="flex-shrink-0 text-yellow-600 hover:text-yellow-700 transition"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								</div>
							)}

							{/* แสดงข้อมูลบัญชีธนาคารเมื่อยังไม่ได้สร้าง Order หรือหลังสร้าง Order แล้ว */}
							{!hasConfirmedPayment && (
								<>
									{/* ข้อมูลบัญชีธนาคาร */}
									<div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
										<div className="flex items-start gap-3 mb-4">
											<span className="text-3xl">🏦</span>
											<div className="flex-1">
												<h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
													โอนเงินเข้าบัญชีธนาคาร
												</h3>
												<p className="text-sm text-green-700 dark:text-green-300">
													โปรดโอนเงินตามรายละเอียดด้านล่าง แล้วอัปโหลดสลิปเพื่อยืนยัน
												</p>
											</div>
										</div>

										<div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-green-200 dark:border-green-800">
											<div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
												<span className="text-sm text-gray-600 dark:text-gray-400">ธนาคาร</span>
												<span className="font-semibold text-gray-900 dark:text-gray-100">{bankAccountInfo.bankName}</span>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
												<span className="text-sm text-gray-600 dark:text-gray-400">เลขที่บัญชี</span>
												<span className="font-semibold text-lg text-gray-900 dark:text-gray-100 font-mono">{bankAccountInfo.accountNumber}</span>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
												<span className="text-sm text-gray-600 dark:text-gray-400">ชื่อบัญชี</span>
												<span className="font-semibold text-gray-900 dark:text-gray-100">{bankAccountInfo.accountName}</span>
											</div>
											<div className="flex justify-between items-center py-2">
												<span className="text-sm text-gray-600 dark:text-gray-400">จำนวนเงิน</span>
												<span className="font-bold text-xl text-green-600 dark:text-green-400">{currency(subtotal)}</span>
											</div>
											{currentOrderId && (
												<div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
													<p className="text-xs text-yellow-800 dark:text-yellow-200">
														<strong>หมายเหตุ:</strong> โปรดระบุเลข Order: <span className="font-mono font-bold">{currentOrderId}</span> ในหมายเหตุการโอน
													</p>
												</div>
											)}
										</div>
									</div>

									{/* คำแนะนำ */}
									<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
										<h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
											<span>ℹ️</span> วิธีการโอนเงิน
										</h4>
										<ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
											<li>คัดลอกเลขที่บัญชีด้านบน</li>
											<li>เปิดแอพธนาคารของคุณ</li>
											<li>โอนเงินตามจำนวนที่ระบุ</li>
											<li>Screenshot หรือบันทึกสลิปการโอนเงิน</li>
											<li>กลับมาอัปโหลดสลิปด้านล่างเพื่อยืนยัน</li>
										</ol>
									</div>

									{/* ปุ่มยืนยันการโอนหลังจากสร้าง Order แล้ว */}
									{currentOrderId && (
										<div className="space-y-3">
											<button 
												onClick={handleConfirmPayment}
												className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-3 font-semibold transition"
											>
												✓ ยืนยันการโอนเงินแล้ว
											</button>
											<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
												กดปุ่มด้านบนหลังจากโอนเงินเรียบร้อยแล้ว
											</p>
										</div>
									)}
								</>
							)}

							{/* แสดงส่วนอัปโหลดสลิปหลังจากกดยืนยันการโอน */}
							{hasConfirmedPayment && (
								<div className="space-y-4">
									<div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 bg-blue-50 dark:bg-blue-950">
										<div className="text-center mb-4">
											<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
												📄 อัปโหลดสลิปเพื่อตรวจสอบอัตโนมัติ
											</h3>
											<p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
												ระบบจะตรวจสอบความถูกต้องของสลิปอัตโนมัติ
											</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">
												Order ID: <span className="font-mono font-semibold">{currentOrderId}</span>
											</p>
										</div>

										{!slipPreview ? (
											<div>
												<label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
													<div className="flex flex-col items-center justify-center pt-5 pb-6">
														<svg className="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
														</svg>
														<p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
															<span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
														</p>
														<p className="text-xs text-gray-500 dark:text-gray-400">
															PNG, JPG, WEBP (สูงสุด 5MB)
														</p>
													</div>
													<input
														type="file"
														className="hidden"
														accept="image/jpeg,image/png,image/webp"
														onChange={handleSlipFileChange}
													/>
												</label>
											</div>
										) : (
											<div className="space-y-3">
												<div className="relative">
													<img
														src={slipPreview}
														alt="Slip Preview"
														className="w-full h-80 object-contain rounded-lg bg-white"
													/>
													<button
														onClick={() => {
															setSlipFile(null)
															setSlipPreview(null)
															setSlipVerificationResult(null)
														}}
														className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>

												{slipVerificationResult && (
													<div className={`p-4 rounded-lg ${
														slipVerificationResult.success && slipVerificationResult.data?.isValid
															? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
															: 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
													}`}>
														<p className={`text-sm font-semibold mb-2 ${
															slipVerificationResult.success && slipVerificationResult.data?.isValid
																? 'text-green-800 dark:text-green-200'
																: 'text-red-800 dark:text-red-200'
														}`}>
															{slipVerificationResult.message}
														</p>
														{slipVerificationResult.data && (
															<div className="mt-3 space-y-2">
																{/* ข้อมูลหลัก */}
																<div className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3">
																	<div className="flex justify-between">
																		<span className="font-medium">ธนาคารผู้โอน:</span>
																		<span className="font-semibold">{slipVerificationResult.data.sendingBank}</span>
																	</div>
																	{slipVerificationResult.data.receivingBank && (
																		<div className="flex justify-between">
																			<span className="font-medium">ธนาคารผู้รับ:</span>
																			<span className="font-semibold">{slipVerificationResult.data.receivingBank}</span>
																		</div>
																	)}
																	<div className="flex justify-between">
																		<span className="font-medium">เลขที่รายการ:</span>
																		<span className="font-mono text-xs">{slipVerificationResult.data.transRef}</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="font-medium">จำนวนเงิน:</span>
																		<span className="font-bold text-blue-600 dark:text-blue-400">
																			{parseFloat(slipVerificationResult.data.amount).toLocaleString('th-TH', {
																				minimumFractionDigits: 2,
																				maximumFractionDigits: 2
																			})} บาท
																		</span>
																	</div>
																	{slipVerificationResult.data.expectedAmount && (
																		<div className="flex justify-between">
																			<span className="font-medium">จำนวนที่ต้องชำระ:</span>
																			<span className="font-semibold">
																				{parseFloat(slipVerificationResult.data.expectedAmount).toLocaleString('th-TH', {
																					minimumFractionDigits: 2,
																					maximumFractionDigits: 2
																				})} บาท
																			</span>
																		</div>
																	)}
																</div>

																{/* วันที่และเวลาทำรายการ */}
																{(slipVerificationResult.data.transDate || slipVerificationResult.data.transTime || slipVerificationResult.data.transactionDateTime) && (
																	<div className="text-xs space-y-1.5 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
																		<div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">⏰ เวลาทำรายการ</div>
																		{slipVerificationResult.data.transDate && (
																			<div className="flex justify-between">
																				<span className="font-medium">วันที่:</span>
																				<span className="font-mono">{formatSlipDate(slipVerificationResult.data.transDate)}</span>
																			</div>
																		)}
																		{slipVerificationResult.data.transTime && (
																			<div className="flex justify-between">
																				<span className="font-medium">เวลา:</span>
																				<span className="font-mono">{formatSlipTime(slipVerificationResult.data.transTime)}</span>
																			</div>
																		)}
																		{slipVerificationResult.data.transactionDateTime && (
																			<div className="flex justify-between">
																				<span className="font-medium">เวลาแบบเต็ม:</span>
																				<span className="font-mono text-xs">
																					{new Date(slipVerificationResult.data.transactionDateTime).toLocaleString('th-TH', {
																						year: 'numeric',
																						month: '2-digit',
																						day: '2-digit',
																						hour: '2-digit',
																						minute: '2-digit',
																						second: '2-digit'
																					})}
																				</span>
																			</div>
																		)}
																	</div>
																)}

																{/* ผลการตรวจสอบแต่ละเงื่อนไข */}
																{slipVerificationResult.data.validations && (
																	<div className="text-xs space-y-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
																		<div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">✓ ผลการตรวจสอบ</div>
																		<div className="flex justify-between items-center">
																			<span>QR Code ถูกต้อง:</span>
																			<span className={slipVerificationResult.data.validations.qrCodeFound ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.qrCodeFound ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>จำนวนเงินถูกต้อง:</span>
																			<span className={slipVerificationResult.data.validations.amountMatch ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.amountMatch ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>โอนภายในเวลา:</span>
																			<span className={slipVerificationResult.data.validations.withinTimeRange ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.withinTimeRange ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>ไม่ใช่สลิปซ้ำ:</span>
																			<span className={slipVerificationResult.data.validations.notDuplicate ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.notDuplicate ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																		<div className="flex justify-between items-center">
																			<span>โครงสร้างสลิป:</span>
																			<span className={slipVerificationResult.data.validations.slipStructureValid ? 'text-green-600' : 'text-red-600'}>
																				{slipVerificationResult.data.validations.slipStructureValid ? '✓ ผ่าน' : '✗ ไม่ผ่าน'}
																			</span>
																		</div>
																	</div>
																)}
															</div>
														)}
													</div>
												)}

												<button
													onClick={handleVerifySlip}
													disabled={isVerifyingSlip}
													className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 font-semibold transition"
												>
													{isVerifyingSlip ? (
														<span className="flex items-center justify-center gap-2">
															<svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
																<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
																<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
															</svg>
															กำลังตรวจสอบ...
														</span>
													) : (
														'🔍 ตรวจสอบสลิปและดำเนินการต่อ'
													)}
												</button>
											</div>
										)}

										{/* ปุ่มย้อนกลับ - แสดงทั้งตอนยังไม่ได้อัพโหลดและอัพโหลดแล้ว */}
										<button
											onClick={handleBackFromSlipUpload}
											className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition mt-3"
										>
											← ย้อนกลับ
										</button>
									</div>
								</div>
							)}
						</div>
					) : null}

					{/* ปุ่มสำหรับ QR Code และ Card - แสดงเมื่อยังไม่มี QR Code และไม่ได้อยู่ในหน้าอัพโหลดสลิป */}
					{(!qrCodeDataURL && method !== 'bank-transfer' && !hasConfirmedPayment) && (
						<div className="mt-6 flex gap-3">
							<button 
								disabled={!canPay || isPaying || isGeneratingQR} 
								onClick={handlePay} 
								className="rounded-xl bg-green-600 text-white px-5 py-3 font-semibold disabled:opacity-50 hover:bg-green-700 transition"
							>
								{isPaying || isGeneratingQR ? 'กำลังดำเนินการ...' : method === 'qr' ? 'สร้าง QR Code' : 'ชำระเงิน'}
							</button>
							<button 
								onClick={() => navigate('/checkout/shipping')} 
								className="rounded-xl border px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
							>
								ย้อนกลับ
							</button>
						</div>
					)}					{/* ปุ่มสำหรับ Bank Transfer */}
					{method === 'bank-transfer' && !currentOrderId && (
						<div className="mt-6 flex gap-3">
							<button 
								disabled={isPaying} 
								onClick={handlePay} 
								className="rounded-xl bg-green-600 text-white px-5 py-3 font-semibold disabled:opacity-50 hover:bg-green-700 transition"
							>
								{isPaying ? 'กำลังดำเนินการ...' : '📝 สร้างคำสั่งซื้อ'}
							</button>
							<button 
								onClick={() => navigate('/checkout/shipping')} 
								className="rounded-xl border px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
							>
								ย้อนกลับ
							</button>
						</div>
					)}
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