import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { login, clearError } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import AuthCardBackdrop from './AuthCardBackdrop'

const Login = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [params] = useSearchParams()
	const { status, error, user } = useAppSelector((s) => s.auth)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
	const [hasAnimated, setHasAnimated] = useState(false)
	
	// Check if redirect requires login
	const loginRequired = params.get('message') === 'login_required'

	const emailValid = /.+@.+\..+/.test(email)
	const passwordValid = password.length >= 6
	const formValid = emailValid && passwordValid

	useEffect(() => {
		setHasAnimated(true)
		// Clear any previous errors when component mounts
		dispatch(clearError())
	}, [dispatch])

	useEffect(() => {
		if (user) {
			const redirect = params.get('redirect') || '/'
			navigate(redirect, { replace: true })
		}
	}, [user, navigate, params])

	const onSubmit = (e: FormEvent) => {
		e.preventDefault()
		setTouched({ email: true, password: true })
		if (!formValid) return
		// Clear error before submitting
		dispatch(clearError())
		dispatch(login({ email, password }))
	}

	return (
		<div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#0d0d0d] dark:to-[#1a1a1a] px-4 py-12 transition-colors">
			<AuthCardBackdrop />
			<motion.div
				key="login-form"
				initial={hasAnimated ? false : { opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.95 }}
				transition={{ duration: 0.4, ease: 'easeInOut' }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="bg-[var(--login-surface-bg)] shadow-xl rounded-2xl p-8 border border-[var(--login-surface-border)] transition-[background-color,border-color] duration-300">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Welcome back</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">Sign in to continue to HYPE MACRO</p>

					{loginRequired && (
						<div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/40 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 transition-colors">
							<div className="flex items-start gap-2">
								<svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
								<div>
									<p className="font-medium">ต้อง Login เพื่อทำการสั่งซื้อ</p>
									<p className="mt-1 text-xs">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
								</div>
							</div>
						</div>
					)}

					<form className="mt-8 space-y-5" onSubmit={onSubmit}>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
								Email address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onBlur={() => setTouched((t) => ({ ...t, email: true }))}
								className={`mt-1 w-full rounded-xl border px-4 py-2.5 shadow-sm bg-[var(--login-input-bg)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-[background-color,border-color] duration-300 ${
									touched.email && !emailValid ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-[var(--login-input-border)]'
								} text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors`}
								placeholder="you@example.com"
								autoComplete="email"
							/>
							{touched.email && !emailValid && (
							<p className="mt-1 text-sm text-red-500 dark:text-red-400">Please enter a valid email.</p>
							)}
						</div>

						<div>
							<div className="flex items-center justify-between">
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
									Password
								</label>
								<Link to="#" className="text-sm text-indigo-600 hover:text-indigo-500">
									Forgot?
								</Link>
							</div>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onBlur={() => setTouched((t) => ({ ...t, password: true }))}
								className={`mt-1 w-full rounded-xl border px-4 py-2.5 shadow-sm bg-[var(--login-input-bg)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-[background-color,border-color] duration-300 ${
									touched.password && !passwordValid ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-[var(--login-input-border)]'
								} text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors`}
								placeholder="••••••••"
								autoComplete="current-password"
							/>
							{touched.password && !passwordValid && (
							<p className="mt-1 text-sm text-red-500 dark:text-red-400">Password must be at least 6 characters.</p>
							)}
						</div>

						{error && (
						<div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/40 px-3 py-2 text-sm text-red-700 dark:text-red-300 transition-colors">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={status === 'loading'}
						className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
						>
							{status === 'loading' ? 'Signing in…' : 'Sign in'}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
						New here?{' '}
						<Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
							Create an account
						</Link>
					</p>
				</div>
				<p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500/80 transition-colors">By continuing, you agree to our Terms and Privacy Policy.</p>
			</motion.div>
		</div>
	)
}

export default Login

