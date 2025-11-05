import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setShippingAddress, type Address } from '../features/checkout/checkoutSlice'
import { selectCartItems, selectCartSubtotal } from '../features/cart/cartSlice'
import { setUser } from '../features/auth/authSlice'
import { userService } from '../services/userService'
import CheckoutProgress from './CheckoutProgress'

const currency = (n: number) => n.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })

type RequiredField = 'fullName' | 'phone' | 'address1' | 'province' | 'district' | 'postcode'

const EMPTY_TOUCHED: Record<RequiredField, boolean> = {
	fullName: false,
	phone: false,
	address1: false,
	province: false,
	district: false,
	postcode: false,
}

const EMPTY_ERRORS: Record<RequiredField, string> = {
	fullName: '',
	phone: '',
	address1: '',
	province: '',
	district: '',
	postcode: '',
}

const sanitizePhone = (value: string) => value.replace(/\D/g, '')

const Shipping = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const items = useAppSelector(selectCartItems)
	const subtotal = useAppSelector(selectCartSubtotal)
	const selected = useAppSelector((s) => s.checkout.shippingAddress)
	const user = useAppSelector((s) => s.auth.user)

	useEffect(() => {
		if (items.length === 0) navigate('/cart', { replace: true })
	}, [items, navigate])

	// Create initial address from user profile or selected address
	const getInitialAddress = (): Address => {
		// If there's a selected address, use it
		if (selected) {
			return { ...selected }
		}
		
		// If user has saved address in profile, use it
		if (user && user.phone && user.address) {
			return {
				id: crypto.randomUUID(),
				fullName: user.name,
				phone: user.phone,
				address1: user.address,
				address2: '',
				province: user.province || '',
				district: user.district || '',
				postcode: user.postalCode || '',
			}
		}
		
		// Otherwise, return empty form
		return {
			id: crypto.randomUUID(),
			fullName: user?.name || '',
			phone: '',
			address1: '',
			address2: '',
			province: '',
			district: '',
			postcode: '',
		}
	}

	// Check if user has saved address in profile
	const hasSavedAddress = user && user.phone && user.address

	const [form, setForm] = useState<Address>(getInitialAddress())
	const [touched, setTouched] = useState<Record<RequiredField, boolean>>({ ...EMPTY_TOUCHED })
	const [attempted, setAttempted] = useState(false)
	const [showSaveModal, setShowSaveModal] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const { errors, formValid, sanitizedPhone } = useMemo(() => {
		const nextErrors: Record<RequiredField, string> = { ...EMPTY_ERRORS }
		const phoneDigits = sanitizePhone(form.phone)

		if (form.fullName.trim().length < 2) {
			nextErrors.fullName = 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร'
		}
		if (!/^0\d{8,9}$/.test(phoneDigits)) {
			nextErrors.phone = 'กรุณากรอกเบอร์โทรที่ขึ้นต้นด้วย 0 และยาว 9-10 หลัก (อนุญาตให้มีขีดหรือช่องว่าง)'
		}
		if (form.address1.trim().length < 4) {
			nextErrors.address1 = 'กรุณากรอกที่อยู่อย่างน้อย 4 ตัวอักษร'
		}
		if (form.province.trim().length < 2) {
			nextErrors.province = 'กรุณากรอกจังหวัด'
		}
		if (form.district.trim().length < 2) {
			nextErrors.district = 'กรุณากรอกอำเภอหรือเขต'
		}
		if (!/^\d{5}$/.test(form.postcode.trim())) {
			nextErrors.postcode = 'กรุณากรอกรหัสไปรษณีย์ 5 หลัก'
		}

		const isValid = (Object.values(nextErrors) as string[]).every((msg) => msg === '')
		return { errors: nextErrors, formValid: isValid, sanitizedPhone: phoneDigits }
	}, [form])

	const errorList = (Object.values(errors) as string[]).filter(Boolean)
	const buttonTitle = !formValid && errorList.length > 0 ? errorList.join('\n') : undefined
	const firstError = errorList[0] ?? ''

	const markAllTouched = () => setTouched({
		fullName: true,
		phone: true,
		address1: true,
		province: true,
		district: true,
		postcode: true,
	})

	const setFieldTouched = (field: RequiredField) => setTouched((prev) => ({ ...prev, [field]: true }))

	// Check if address is different from saved address
	const isAddressDifferent = () => {
		if (!user || !user.phone || !user.address) return true
		
		return (
			form.fullName !== user.name ||
			sanitizedPhone !== user.phone.replace(/\D/g, '') ||
			form.address1 !== user.address ||
			form.province !== (user.province || '') ||
			form.district !== (user.district || '') ||
			form.postcode !== (user.postalCode || '')
		)
	}

	const saveAddressToProfile = async () => {
		setIsSaving(true)
		try {
			await userService.updateProfile({
				phone: sanitizedPhone,
				address: form.address1,
				district: form.district,
				city: form.district, // Using district as city
				province: form.province,
				postalCode: form.postcode,
			})
			
			// Update Redux store
			if (user) {
				dispatch(setUser({
					...user,
					phone: sanitizedPhone,
					address: form.address1,
					district: form.district,
					city: form.district,
					province: form.province,
					postalCode: form.postcode,
				}))
			}
		} catch (error) {
			console.error('Failed to save address:', error)
		} finally {
			setIsSaving(false)
		}
	}

	const saveAndContinue = async () => {
		if (!formValid) {
			setAttempted(true)
			markAllTouched()
			return
		}
		
		const normalized = { ...form, phone: sanitizedPhone }
		
		// Check if address is different and ask to save
		if (isAddressDifferent()) {
			setShowSaveModal(true)
		} else {
			dispatch(setShippingAddress(normalized))
			navigate('/checkout/payment')
		}
	}

	const handleContinueWithoutSaving = () => {
		const normalized = { ...form, phone: sanitizedPhone }
		dispatch(setShippingAddress(normalized))
		setShowSaveModal(false)
		navigate('/checkout/payment')
	}

	const handleSaveAndContinue = async () => {
		await saveAddressToProfile()
		const normalized = { ...form, phone: sanitizedPhone }
		dispatch(setShippingAddress(normalized))
		setShowSaveModal(false)
		navigate('/checkout/payment')
	}

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
			<CheckoutProgress currentStep={2} />
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
					<h2 className="text-xl font-semibold mb-4">ที่อยู่สำหรับจัดส่ง</h2>

					{hasSavedAddress && (
						<div className="mb-6">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ที่อยู่ที่บันทึกไว้ในโปรไฟล์</p>
							<div className="p-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
									</svg>
									<div className="flex-1">
										<div className="font-medium text-gray-900 dark:text-gray-100">{user?.name} • {user?.phone}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
											{user?.address} {user?.district} {user?.province} {user?.postalCode}
										</div>
										<button
											onClick={() => {
												if (user && user.phone && user.address) {
													setForm({
														id: crypto.randomUUID(),
														fullName: user.name,
														phone: user.phone,
														address1: user.address,
														address2: '',
														province: user.province || '',
														district: user.district || '',
														postcode: user.postalCode || '',
													})
													setTouched({ ...EMPTY_TOUCHED })
													setAttempted(false)
												}
											}}
											className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
										>
											ใช้ที่อยู่นี้
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="grid sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
							<input
								id="shipping-fullName"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.fullName}
								onChange={(e) => setForm({ ...form, fullName: e.target.value })}
								onBlur={() => setFieldTouched('fullName')}
								aria-invalid={touched.fullName && !!errors.fullName}
								aria-describedby={errors.fullName ? 'shipping-fullName-error' : undefined}
							/>
							{touched.fullName && errors.fullName && <p id="shipping-fullName-error" className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
							<input
								id="shipping-phone"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.phone}
								onChange={(e) => setForm({ ...form, phone: e.target.value })}
								onBlur={() => setFieldTouched('phone')}
								aria-invalid={touched.phone && !!errors.phone}
								aria-describedby={errors.phone ? 'shipping-phone-error' : undefined}
							/>
							{touched.phone && errors.phone && <p id="shipping-phone-error" className="mt-1 text-sm text-red-500">{errors.phone}</p>}
						</div>
						<div className="sm:col-span-2">
							<label className="block text-sm text-gray-600 mb-1">ที่อยู่</label>
							<input
								id="shipping-address1"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.address1}
								onChange={(e) => setForm({ ...form, address1: e.target.value })}
								onBlur={() => setFieldTouched('address1')}
								aria-invalid={touched.address1 && !!errors.address1}
								aria-describedby={errors.address1 ? 'shipping-address1-error' : undefined}
							/>
							{touched.address1 && errors.address1 && <p id="shipping-address1-error" className="mt-1 text-sm text-red-500">{errors.address1}</p>}
						</div>
						<div className="sm:col-span-2">
							<label className="block text-sm text-gray-600 mb-1">เพิ่มเติม (ถ้ามี)</label>
							<input className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">อำเภอ/เขต</label>
							<input
								id="shipping-district"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.district}
								onChange={(e) => setForm({ ...form, district: e.target.value })}
								onBlur={() => setFieldTouched('district')}
								aria-invalid={touched.district && !!errors.district}
								aria-describedby={errors.district ? 'shipping-district-error' : undefined}
							/>
							{touched.district && errors.district && <p id="shipping-district-error" className="mt-1 text-sm text-red-500">{errors.district}</p>}
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">จังหวัด</label>
							<input
								id="shipping-province"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.province}
								onChange={(e) => setForm({ ...form, province: e.target.value })}
								onBlur={() => setFieldTouched('province')}
								aria-invalid={touched.province && !!errors.province}
								aria-describedby={errors.province ? 'shipping-province-error' : undefined}
							/>
							{touched.province && errors.province && <p id="shipping-province-error" className="mt-1 text-sm text-red-500">{errors.province}</p>}
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">รหัสไปรษณีย์</label>
							<input
								id="shipping-postcode"
								className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
								value={form.postcode}
								onChange={(e) => setForm({ ...form, postcode: e.target.value })}
								onBlur={() => setFieldTouched('postcode')}
								aria-invalid={touched.postcode && !!errors.postcode}
								aria-describedby={errors.postcode ? 'shipping-postcode-error' : undefined}
							/>
							{touched.postcode && errors.postcode && <p id="shipping-postcode-error" className="mt-1 text-sm text-red-500">{errors.postcode}</p>}
						</div>
					</div>

					<div className="mt-6 flex gap-3">
						<button
							onClick={saveAndContinue}
							disabled={!formValid}
							title={buttonTitle}
							className="rounded-xl bg-blue-600 text-white px-5 py-3 font-semibold disabled:opacity-50"
						>
							บันทึกและไปต่อ
						</button>
						<button onClick={() => navigate('/cart')} className="rounded-xl border px-5 py-3">กลับไปตะกร้า</button>
					</div>
					{attempted && !formValid && firstError && <p className="mt-2 text-sm text-red-500">{firstError}</p>}
				</div>
						</div>

						<aside className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-max sticky top-20">
							<h3 className="text-lg font-semibold mb-3">สรุปคำสั่งซื้อ</h3>
							<div className="space-y-2 text-sm">
								{items.map((it) => (
									<div key={it.id} className="flex justify-between">
										<span>{it.name} × {it.qty}</span>
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

			{/* Save Address Modal */}
			{showSaveModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
					>
						<div className="flex items-start gap-3 mb-4">
							<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">บันทึกที่อยู่นี้?</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									ต้องการบันทึกที่อยู่นี้ในโปรไฟล์เพื่อใช้ในการสั่งซื้อครั้งถัดไปหรือไม่?
								</p>
							</div>
						</div>

						<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4 text-sm">
							<div className="font-medium text-gray-900 dark:text-white">{form.fullName}</div>
							<div className="text-gray-600 dark:text-gray-400 mt-1">
								{sanitizedPhone}<br />
								{form.address1} {form.address2}<br />
								{form.district} {form.province} {form.postcode}
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleContinueWithoutSaving}
								disabled={isSaving}
								className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								ไม่บันทึก
							</button>
							<button
								onClick={handleSaveAndContinue}
								disabled={isSaving}
								className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSaving ? 'กำลังบันทึก...' : 'บันทึกและดำเนินการต่อ'}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	)
}

export default Shipping

