import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../services/orderService'
import type { Order } from '../services/orderService'

const Orders = () => {
	const navigate = useNavigate()
	const [orders, setOrders] = useState<Order[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'shipped' | 'delivered'>('all')

	const stats = useMemo(() => {
		const pending = orders.filter(order => order.paymentStatus === 'pending' || !order.paymentStatus).length
		const paid = orders.filter(order => order.paymentStatus === 'paid').length
		const shipped = orders.filter(order => order.status === 'shipped').length
		const delivered = orders.filter(order => order.status === 'delivered').length
		const totalSpent = orders
			.filter(order => order.paymentStatus === 'paid')
			.reduce((sum, order) => sum + order.subtotal, 0)

		return {
			pending,
			paid,
			shipped,
			delivered,
			totalSpent,
			total: orders.length,
		}
	}, [orders])

	useEffect(() => {
		loadOrders()
	}, [])

	const loadOrders = async () => {
		try {
			setIsLoading(true)
			const data = await orderService.getMyOrders()
			// เรียงตาม createdAt จากใหม่ไปเก่า
			const sortedOrders = data.sort((a, b) => 
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
			setOrders(sortedOrders)
		} catch (error) {
			console.error('Failed to load orders:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const getStatusBadge = (paymentStatus: string, orderStatus: string) => {
		// ใช้ paymentStatus เป็นหลัก แต่ถ้า paid แล้วจะดูจาก orderStatus
		if (paymentStatus === 'paid') {
			if (orderStatus === 'shipped') {
				return (
					<span className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-950">
						กำลังจัดส่ง
					</span>
				)
			}
			if (orderStatus === 'delivered') {
				return (
					<span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-800">
						จัดส่งแล้ว
				</span>
				)
			}
			return (
				<span className="px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950">
					ชำระเงินแล้ว
				</span>
			)
		}
		
		// paymentStatus = pending หรืออื่นๆ
		return (
			<span className="px-3 py-1 rounded-full text-sm font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-950">
				รอการชำระเงิน
			</span>
		)
	}

	const getPaymentMethodIcon = (method: string) => {
		const icons: Record<string, string> = {
			card: '💳',
			qr: '📱',
			'bank-transfer': '🏦',
		}
		return icons[method] || '💰'
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return new Intl.DateTimeFormat('th-TH', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('th-TH', {
			style: 'currency',
			currency: 'THB',
		}).format(amount)
	}

	const filteredOrders = filter === 'all' 
		? orders 
		: filter === 'pending'
			? orders.filter(order => order.paymentStatus === 'pending' || !order.paymentStatus)
			: filter === 'paid'
				? orders.filter(order => order.paymentStatus === 'paid' && (!order.status || order.status === 'pending'))
				: orders.filter(order => order.status === filter)

	const handleOrderClick = (orderId: string) => {
		// Navigate to order detail or payment page if unpaid
		const order = orders.find(o => o.orderId === orderId)
		if (order && order.paymentStatus === 'pending') {
			// ถ้ายังไม่ได้ชำระเงิน นำไปหน้า payment
			sessionStorage.setItem('unpaidOrder', JSON.stringify({
				orderId: order.orderId,
				method: order.paymentMethod,
				hasConfirmedPayment: order.hasConfirmedPayment || false
			}))
			navigate('/checkout/payment')
		}
		// สามารถเพิ่ม navigate ไปหน้ารายละเอียดคำสั่งซื้อได้
	}

	const handleCancelOrder = async (orderId: string) => {
		const confirmed = window.confirm(
			'คุณต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?\n\nหมายเหตุ: คำสั่งซื้อที่ชำระเงินแล้วไม่สามารถยกเลิกได้'
		)
		
		if (!confirmed) return

		try {
			await orderService.deleteOrder(orderId)
			// รีโหลดรายการคำสั่งซื้อ
			await loadOrders()
			alert('✅ ยกเลิกคำสั่งซื้อสำเร็จ')
		} catch (error) {
			console.error('Failed to cancel order:', error)
			alert('❌ ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง')
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#080808] dark:to-[#111]">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative overflow-hidden"
			>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
				<div className="absolute inset-y-0 right-0 w-1/2 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/80 text-sm mb-4">
								<span>📦</span>
								<span>แดชบอร์ดคำสั่งซื้อ</span>
							</div>
							<h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">คำสั่งซื้อของฉัน</h1>
							<p className="text-white/80 max-w-2xl">
								ติดตามสถานะคำสั่งซื้อ ดูยอดรวม และเข้าจัดการรายการที่ต้องดำเนินการต่อ
							</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
							{[
								{ label: 'ทั้งหมด', value: stats.total, accent: 'from-white/80 to-white/60 text-blue-900', icon: '🗂️' },
								{ label: 'รอชำระ', value: stats.pending, accent: 'from-yellow-100/70 to-yellow-50/50 text-yellow-900', icon: '⏳' },
								{ label: 'จัดส่งแล้ว', value: stats.delivered, accent: 'from-emerald-100/70 to-emerald-50/50 text-emerald-900', icon: '🚚' },
								{ label: 'ยอดรวมสุทธิ', value: stats.totalSpent > 0 ? formatCurrency(stats.totalSpent) : '—', accent: 'from-purple-100/70 to-purple-50/50 text-purple-900', icon: '💰' },
							].map((card, idx) => (
								<motion.div
									key={card.label}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 + idx * 0.05 }}
									className={`rounded-2xl px-4 py-3 shadow-lg shadow-black/5 backdrop-blur border border-white/30 bg-gradient-to-br ${card.accent}`}
								>
									<div className="text-lg">{card.icon}</div>
									<p className="text-xs uppercase tracking-wide text-black/50">{card.label}</p>
									<p className="text-lg font-semibold text-black/80">
										{typeof card.value === 'number' ? card.value.toLocaleString('th-TH') : card.value}
									</p>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Filter Tabs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white/80 dark:bg-[#111]/90 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-5 shadow-sm shadow-black/5 backdrop-blur"
				>
					<div className="flex flex-wrap gap-2">
						{[
							{ key: 'all', label: 'ทั้งหมด', count: stats.total },
							{ key: 'pending', label: 'รอชำระเงิน', count: stats.pending },
							{ key: 'paid', label: 'ชำระแล้ว', count: stats.paid },
							{ key: 'shipped', label: 'กำลังจัดส่ง', count: stats.shipped },
							{ key: 'delivered', label: 'จัดส่งแล้ว', count: stats.delivered },
						].map((chip) => (
							<button
								key={chip.key}
								onClick={() => setFilter(chip.key as typeof filter)}
								className={`px-5 py-2.5 rounded-xl text-sm font-medium transition border ${
									filter === chip.key
										? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
										: 'bg-gray-100/80 text-gray-700 border-transparent hover:bg-gray-200/80 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-800'
								}`}
							>
								{chip.label} ({chip.count})
							</button>
						))}
					</div>
				</motion.div>

				{/* Orders List */}
				{isLoading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : filteredOrders.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-20"
					>
						<div className="text-6xl mb-4">📦</div>
						<h3 className="text-xl font-semibold mb-2">ไม่พบคำสั่งซื้อ</h3>
						<p className="text-gray-500 mb-6">
							{filter === 'all' ? 'คุณยังไม่มีคำสั่งซื้อ' : 'ไม่มีคำสั่งซื้อในหมวดนี้'}
						</p>
						<button
							onClick={() => navigate('/')}
							className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
						>
							เริ่มช้อปปิ้ง
						</button>
					</motion.div>
				) : (
					<div className="space-y-6">
						{filteredOrders.map((order, index) => (
							<motion.div
								key={order._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								onClick={() => handleOrderClick(order.orderId)}
								className="bg-white/90 dark:bg-[#0f0f10]/90 rounded-3xl border border-gray-200/70 dark:border-gray-800/70 overflow-hidden hover:border-blue-500/80 dark:hover:border-blue-500/80 transition cursor-pointer shadow-lg shadow-black/5 backdrop-blur"
							>
								{/* Order Header */}
								<div className="px-6 pt-6 pb-5 border-b border-gray-200/70 dark:border-gray-800/70 bg-gradient-to-r from-white/70 to-white/40 dark:from-[#111]/70 dark:to-[#0f0f10]/40">
									<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
										<div className="space-y-2">
											<div className="flex items-center gap-3">
												<span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white text-xl shadow-blue-600/30 shadow">
													{getPaymentMethodIcon(order.paymentMethod)}
												</span>
												<div>
													<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">คำสั่งซื้อ #{order.orderId}</h3>
													<p className="text-sm text-gray-500 dark:text-gray-400">สร้างเมื่อ {formatDate(order.createdAt)}</p>
												</div>
											</div>
											<div className="flex flex-wrap gap-2">
												{getStatusBadge(order.paymentStatus || 'pending', order.status || 'pending')}
												{order.paymentStatus === 'pending' && (
													<span className="px-3 py-1 rounded-full text-sm font-medium text-orange-700 bg-orange-100/80 dark:text-orange-300 dark:bg-orange-900/30 border border-orange-200/60 dark:border-orange-900/60">
														รอการชำระเงิน
													</span>
												)}
											</div>
										</div>
										<div className="flex flex-col items-start sm:items-end gap-2">
											<p className="text-sm text-gray-500 dark:text-gray-400">ยอดรวมสุทธิ</p>
											<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
												{formatCurrency(order.subtotal)}
											</p>
										</div>
									</div>
								</div>

								{/* Order Items */}
								<div className="p-6">
									<div className="space-y-4">
										{order.items.map((item, idx) => (
											<div key={idx} className="flex gap-4">
												{item.image && (
													<img
														src={item.image}
														alt={item.name}
														className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
													/>
												)}
												<div className="flex-1 min-w-0">
													<h4 className="font-medium truncate">{item.name}</h4>
													<p className="text-sm text-gray-500">
														{formatCurrency(item.price)} × {item.qty}
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold">
														{formatCurrency(item.price * item.qty)}
													</p>
												</div>
											</div>
										))}
									</div>

									{/* Shipping Address */}
									{order.address && (
										<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
											<h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">
												📍 ที่อยู่จัดส่ง
											</h4>
											<p className="text-sm">
												{order.address.fullName} | {order.address.phone}
											</p>
											<p className="text-sm text-gray-500">
												{order.address.address} {order.address.district} {order.address.province} {order.address.postalCode}
											</p>
										</div>
									)}

									{/* Status Timeline */}
									<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
										<div className="flex flex-wrap gap-4">
											{[
												{ key: 'pending', label: 'รอชำระเงิน', icon: '🕒', type: 'payment' },
												{ key: 'paid', label: 'ชำระเงินแล้ว', icon: '✅', type: 'payment' },
												{ key: 'shipped', label: 'กำลังจัดส่ง', icon: '🚚', type: 'delivery' },
												{ key: 'delivered', label: 'จัดส่งสำเร็จ', icon: '🎉', type: 'delivery' },
											].map((step) => {
												let reached = false
												
												if (step.type === 'payment') {
													// ขั้นตอนการชำระเงิน
													if (step.key === 'pending') {
														reached = true // ทุก order ต้องผ่านขั้น pending
													} else if (step.key === 'paid') {
														reached = order.paymentStatus === 'paid'
													}
												} else {
													// ขั้นตอนการจัดส่ง (ต้องชำระเงินแล้วก่อน)
													if (order.paymentStatus === 'paid') {
														if (step.key === 'shipped') {
															reached = order.status === 'shipped' || order.status === 'delivered'
														} else if (step.key === 'delivered') {
															reached = order.status === 'delivered'
														}
													}
												}
												
												return (
													<div
														key={step.key}
														className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-sm ${
															reached
																? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200'
																: 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400'
														}`}
												>
													<span className="text-lg">{step.icon}</span>
													<span className="font-medium">{step.label}</span>
												</div>
												)
											})}
										</div>
									</div>

									{/* Actions */}
									{order.paymentStatus === 'pending' && (
										<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
											<div className="flex flex-col sm:flex-row gap-3">
												<button
													onClick={(e) => {
														e.stopPropagation()
														handleOrderClick(order.orderId)
													}}
													className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
												>
													💳 ชำระเงิน
												</button>
												<button
													onClick={(e) => {
														e.stopPropagation()
														handleCancelOrder(order.orderId)
													}}
													className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition font-medium border border-red-300 dark:border-red-800"
												>
													🗑️ ยกเลิกคำสั่งซื้อ
												</button>
											</div>
										</div>
									)}
									
									{/* Show cancel button for paid orders that haven't been shipped */}
									{order.paymentStatus === 'paid' && order.status !== 'shipped' && order.status !== 'delivered' && (
										<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
											<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/60 rounded-lg p-4 mb-4">
												<p className="text-sm text-yellow-800 dark:text-yellow-200">
													⚠️ คำสั่งซื้อที่ชำระเงินแล้วไม่สามารถยกเลิกได้ หากต้องการขอคืนเงิน กรุณาติดต่อฝ่ายบริการลูกค้า
												</p>
											</div>
										</div>
									)}
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default Orders
