import { Link } from 'react-router-dom'

type LogoProps = {
	to?: string | null
	className?: string
	labelClassName?: string
}

const combine = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ').trim()

const LogoContent = ({ labelClassName }: { labelClassName?: string }) => (
	<>
		<div className="w-10 h-8 mouse-logo-glass rounded-lg flex items-center justify-center relative transform-gpu">
			<i className="fas fa-mouse text-white text-sm" />
		</div>
		<span className={combine('text-xl font-bold text-gray-900 dark:text-white mt-1', labelClassName)}>
			HYPE-MACRO
		</span>
	</>
)

const Logo = ({ to = '/', className = '', labelClassName }: LogoProps) => {
	const baseClass = combine('flex items-center space-x-3 flex-shrink-0 transform-gpu', className)

	if (to) {
		return (
			<Link to={to} className={baseClass} aria-label="กลับหน้าหลัก HYPE-MACRO">
				<LogoContent labelClassName={labelClassName} />
			</Link>
		)
	}

	return (
		<div className={baseClass} aria-label="HYPE-MACRO Logo">
			<LogoContent labelClassName={labelClassName} />
		</div>
	)
}

export default Logo
