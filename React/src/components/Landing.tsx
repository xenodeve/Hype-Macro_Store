import { Link } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggleButton from './ThemeToggleButton'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-[#040404] dark:via-[#0f0f0f] dark:to-[#1a1a1a] text-gray-900 dark:text-gray-100 transition-colors">
      <header className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-3">
          <ThemeToggleButton />
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-14 pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Elevate your streetwear game
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Discover curated drops, seamless checkout, and a community of hypebeasts. All in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-indigo-900/40 dark:via-slate-900/60 dark:to-purple-900/30 border border-gray-100 dark:border-gray-800 shadow-inner" />
            <div className="absolute -bottom-6 -left-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow transition-colors">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Fast checkout</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Save time with one-tap pay</div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow transition-colors">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Trusted sellers</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Curated and verified</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Hype Macro. All rights reserved.
      </footer>
    </div>
  )
}

export default Landing
