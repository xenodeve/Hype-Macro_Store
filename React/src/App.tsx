import './App.css'
import { useEffect, type ReactElement } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import AuthLayout from './components/AuthLayout'
import HomePage from './components/HomePage'
import Cart from './components/Cart'
import Shipping from './components/Shipping'
import Payment from './components/Payment'
import PaymentSuccess from './components/PaymentSuccess'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import { useAppSelector } from './hooks'
import { initializeTheme, reflectThemePreference, setupSystemThemeListener } from './preview/ThemeToggle'

const RequireAuth = ({ children }: { children: ReactElement }) => {
	const { user } = useAppSelector((s) => s.auth)
	if (!user) return <Navigate to="/login" replace />
	return children
}

const App = () => {
	const location = useLocation()

	useEffect(() => {
		initializeTheme()
		reflectThemePreference()
		setupSystemThemeListener()
	}, [])

	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
				<Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
				<Route path="/cart" element={<AuthLayout key="cart"><Cart /></AuthLayout>} />
				<Route path="/checkout/shipping" element={<AuthLayout key="checkout"><Shipping /></AuthLayout>} />
				<Route path="/checkout/payment" element={<AuthLayout key="checkout"><Payment /></AuthLayout>} />
				<Route path="/checkout/success" element={<AuthLayout key="checkout"><PaymentSuccess /></AuthLayout>} />
				{/* Profile Settings */}
				<Route
					path="/profile"
					element={
						<RequireAuth>
							<Profile />
						</RequireAuth>
					}
				/>
				{/* Example of a protected route (replace with real components when ready) */}
				<Route
					path="/account"
					element={
						<RequireAuth>
							<AuthLayout>
								<div className="p-6 max-w-3xl mx-auto">Account dashboard</div>
							</AuthLayout>
						</RequireAuth>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</AnimatePresence>
	)
}

export default App