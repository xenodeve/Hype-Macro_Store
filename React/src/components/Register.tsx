import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { register as registerThunk, clearError } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import AuthCardBackdrop from './AuthCardBackdrop'

const Register = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { status, error, user } = useAppSelector((s) => s.auth)

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [touched, setTouched] = useState<{ [k: string]: boolean }>({})
	const [hasAnimated, setHasAnimated] = useState(false)

	const nameValid = name.trim().length >= 2
	const emailValid = /.+@.+\..+/.test(email)
	const passwordValid = password.length >= 6
	const confirmValid = confirm === password && passwordValid
	const formValid = nameValid && emailValid && passwordValid && confirmValid

	useEffect(() => {
		setHasAnimated(true)
		// Clear any previous errors when component mounts
		dispatch(clearError())
	}, [dispatch])

	useEffect(() => {
		if (user) navigate('/', { replace: true })
	}, [user, navigate])

	const onSubmit = (e: FormEvent) => {
		e.preventDefault()
		setTouched({ name: true, email: true, password: true, confirm: true })
		if (!formValid) return
		// Clear error before submitting
		dispatch(clearError())
		dispatch(registerThunk({ name, email, password }))
	}

	return (
		<div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#0d0d0d] dark:to-[#1a1a1a] px-4 py-12 transition-colors">
			<AuthCardBackdrop />
			<motion.div
				key="register-form"
				initial={hasAnimated ? false : { opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.95 }}
				transition={{ duration: 0.4, ease: 'easeInOut' }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="bg-[var(--login-surface-bg)] shadow-xl rounded-2xl p-8 border border-[var(--login-surface-border)] transition-[background-color,border-color] duration-300">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Create your account</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">Join HYPE MACRO in seconds</p>

					<form className="mt-8 space-y-5" onSubmit={onSubmit}>
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
								Full name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => setTouched((t) => ({ ...t, name: true }))}
								className={`mt-1 w-full rounded-xl border px-4 py-2.5 shadow-sm bg-[var(--login-input-bg)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-[background-color,border-color] duration-300 ${
									touched.name && !nameValid ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-[var(--login-input-border)]'
								} text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors`}
								placeholder="Jane Doe"
								autoComplete="name"
							/>
							{touched.name && !nameValid && (
								<p className="mt-1 text-sm text-red-500 dark:text-red-400">Name must be at least 2 characters.</p>
							)}
						</div>

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
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
								Password
							</label>
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
								autoComplete="new-password"
							/>
							{touched.password && !passwordValid && (
								<p className="mt-1 text-sm text-red-500 dark:text-red-400">Password must be at least 6 characters.</p>
							)}
						</div>

						<div>
							<label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
								Confirm password
							</label>
							<input
								id="confirm"
								type="password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
								className={`mt-1 w-full rounded-xl border px-4 py-2.5 shadow-sm bg-[var(--login-input-bg)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-[background-color,border-color] duration-300 ${
									touched.confirm && !confirmValid ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-[var(--login-input-border)]'
								} text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors`}
								placeholder="••••••••"
								autoComplete="new-password"
							/>
							{touched.confirm && !confirmValid && (
								<p className="mt-1 text-sm text-red-500 dark:text-red-400">Passwords do not match.</p>
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
							{status === 'loading' ? 'Creating account…' : 'Create account'}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
						Already have an account?{' '}
						<Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
							Sign in
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	)
}

export default Register

