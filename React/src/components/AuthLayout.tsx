import { useEffect, type ReactNode } from 'react'
import AppNav from './AppNav'
import FloatingThemeToggle from './FloatingThemeToggle'

type Props = {
	children: ReactNode
}

const AuthLayout = ({ children }: Props) => {
	// Ensure any homepage loading overlay is removed
	useEffect(() => {
		// Remove loading overlay element if it still exists
		const loading = document.getElementById('loading-page')
		if (loading && loading.parentNode) loading.parentNode.removeChild(loading)
		
		// Disable the mainContentFadeIn animation for auth pages
		const style = document.createElement('style')
		style.id = 'auth-layout-override'
		style.textContent = `
			body.content-loaded > *:not(.loading-page) {
				animation: none !important;
			}
			body:not(.content-loaded) > *:not(.loading-page) {
				opacity: 1 !important;
				visibility: visible !important;
				transform: none !important;
				filter: none !important;
			}
		`
		document.head.appendChild(style)
		
		// Mark as loaded to prevent hiding content
		document.body.classList.add('content-loaded')
		
		return () => {
			const styleEl = document.getElementById('auth-layout-override')
			if (styleEl) styleEl.remove()
		}
	}, [])

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#0d0d0d] dark:to-[#1a1a1a] text-gray-900 dark:text-gray-100 -mt-[110px] pt-[110px]">
			<AppNav />
			<FloatingThemeToggle />
			<div>{children}</div>
		</div>
	)
}

export default AuthLayout

