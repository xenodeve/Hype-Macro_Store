import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import CardNav, { type CardNavItem } from './CardNav'
import Logo from './Logo'
import { useAppDispatch, useAppSelector } from '../hooks'
import { logout } from '../features/auth/authSlice'

type UserMenuProps = {
  isMobile?: boolean
  closeMenu: () => void
  userName: string
  onLogout: () => void
}

const UserMenu = ({ isMobile, closeMenu, userName, onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (containerRef.current.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [isMobile])

  const triggerClass = isMobile
    ? 'inline-flex items-center justify-center rounded-xl border border-white/30 px-3 py-2 text-xs font-medium text-white/90 backdrop-blur hover:bg-white/10'
    : 'inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors'

  const menuClass = isMobile
    ? 'absolute right-0 top-full mt-2 w-36 rounded-2xl border border-white/25 bg-black/80 text-white shadow-lg backdrop-blur z-10'
    : 'absolute right-0 top-full mt-2 w-44 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-10'

  const menuItemClass = isMobile
    ? 'block w-full px-3 py-2 text-left text-sm hover:bg-white/15'
    : 'block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'

  return (
    <div className={`relative ${isMobile ? 'flex-1' : ''}`} ref={containerRef}>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Hi, {userName}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className={`${menuClass} overflow-hidden`}
            role="menu"
            aria-label="เมนูผู้ใช้"
          >
            <Link
              to="/profile"
              onClick={() => {
                setOpen(false)
                if (isMobile) closeMenu()
              }}
              className={menuItemClass}
              role="menuitem"
            >
              ตั้งค่า
            </Link>
            <Link
              to="/orders"
              onClick={() => {
                setOpen(false)
                if (isMobile) closeMenu()
              }}
              className={menuItemClass}
              role="menuitem"
            >
              คำสั่งซื้อ
            </Link>
            <button
              type="button"
              onClick={() => {
                onLogout()
                setOpen(false)
                if (isMobile) closeMenu()
              }}
              className={menuItemClass}
              role="menuitem"
            >
              ออกจากระบบ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const AppNav = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const cartCount = useAppSelector((state) => state.cart?.items?.reduce((total, item) => total + item.qty, 0) ?? 0)

  const items = useMemo<CardNavItem[]>(
    () => [
      {
        label: 'สำรวจ',
        bgColor: '#0D0716',
        textColor: '#fff',
        lightBgColor: '#F2F0FF',
        lightTextColor: '#1A1330',
        links: [
          { label: 'หน้าหลัก', to: '/#home', ariaLabel: 'ไปยังหน้าหลัก' },
          { label: 'จุดเด่น', to: '/#features', ariaLabel: 'ดูจุดเด่นสินค้า' },
          { label: 'รีวิว', to: '/#reviews', ariaLabel: 'อ่านรีวิว' },
        ],
      },
      {
        label: 'สินค้า',
        bgColor: '#170D27',
        textColor: '#fff',
        lightBgColor: '#F9F3FF',
        lightTextColor: '#26133E',
        links: [
          { label: 'สินค้าทั้งหมด', to: '/#products', ariaLabel: 'ไปยังรายการสินค้า' },
          { label: 'ตะกร้าสินค้า', to: '/cart', ariaLabel: 'เปิดตะกร้าสินค้า' },
          { label: 'ที่อยู่จัดส่ง', to: '/checkout/shipping', ariaLabel: 'ไปหน้ากรอกที่อยู่จัดส่ง' },
        ],
      },
      {
        label: 'ช่วยเหลือ',
        bgColor: '#271E37',
        textColor: '#fff',
        lightBgColor: '#F7F5FE',
        lightTextColor: '#2A1746',
        links: [
          { label: 'ลงชื่อเข้าใช้', to: '/login', ariaLabel: 'ไปยังหน้าเข้าสู่ระบบ' },
          { label: 'สมัครสมาชิก', to: '/register', ariaLabel: 'ไปยังหน้าสมัครสมาชิก' },
          { label: 'ติดต่อเรา', href: 'mailto:support@hype-macro.com', ariaLabel: 'ส่งอีเมลถึง HYPE-MACRO' },
        ],
      },
    ],
    [],
  )

  const handleLogout = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const renderActions = useCallback(
    ({ isMobile, closeMenu }: { isMobile?: boolean; closeMenu: () => void }) => {
      const linkBase = isMobile
        ? 'inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-xs font-medium text-white/90 backdrop-blur transition hover:bg-white/10'
        : 'inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors'

      const cartContent = (
        <span className="relative">
          ตะกร้า
          {cartCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] h-5 min-w-[20px] px-1">
              {cartCount}
            </span>
          )}
        </span>
      )

      const onNavigate = () => {
        if (isMobile) closeMenu()
      }

      return (
        <>
          <Link to="/cart" className={linkBase} onClick={onNavigate}>
            {cartContent}
          </Link>
          {!user ? (
            <>
              <Link to="/login" className={linkBase} onClick={onNavigate}>
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className={`${linkBase} ${isMobile ? '' : 'bg-blue-600 text-white hover:bg-blue-500 dark:hover:bg-blue-400 border-blue-600 dark:border-blue-500'}`} onClick={onNavigate}>
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <UserMenu
              isMobile={isMobile}
              closeMenu={closeMenu}
              userName={user.name}
              onLogout={() => {
                handleLogout()
                onNavigate()
              }}
            />
          )}
        </>
      )
    },
    [cartCount, handleLogout, user],
  )

  return (
    <CardNav
      logo={<Logo to="/" />}
      items={items}
      actions={renderActions}
    />
  )
}

export default AppNav
