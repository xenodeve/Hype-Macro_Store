import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { initializeLoadingPage } from '../preview/LoadingPage'
import { reflectThemePreference } from '../preview/ThemeToggle'
import { setRandomVideo } from '../preview/RandomVdoBg'
import { setupSmoothNavigation } from '../preview/Nav'
import { setupFeatureAnimations, setupHeroAnimations, setupProductCardsAnimation } from '../preview/Animations'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addItem } from '../features/cart/cartSlice'
import { fetchProducts, selectProducts, selectProductsStatus } from '../features/products/productsSlice'
import AppNav from './AppNav'
import FloatingThemeToggle from './FloatingThemeToggle'
import Carousel, { type CarouselItem } from './Carousel'

const HomePage = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [hasLoadingPage, setHasLoadingPage] = useState(false)
  const products = useAppSelector(selectProducts)
  const productsStatus = useAppSelector(selectProductsStatus)
  
  useEffect(() => {
    // Fetch products from API
    dispatch(fetchProducts())
  }, [dispatch])
  
  useEffect(() => {
    // Loading overlay and theme init
    const loader = initializeLoadingPage()
    setHasLoadingPage(loader !== null)
    
    // If no loading page, mark content as loaded immediately without animation
    if (loader === null) {
      document.body.classList.add('content-loaded', 'skip-page-transition')
    }

    const start = () => {
      setRandomVideo()
      reflectThemePreference()

      setupSmoothNavigation()

      setupProductCardsAnimation()
      setupHeroAnimations()
      setupFeatureAnimations()
    }

    const onLoad = () => setTimeout(start, 200)
    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad)
    }
    return () => {
      window.removeEventListener('load', onLoad)
    }
  }, [])

  useEffect(() => {
    if (!location.hash) return

    const targetId = location.hash.replace('#', '')
    if (!targetId) return

    const scrollToSection = () => {
      const section = document.getElementById(targetId)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const timer = window.setTimeout(scrollToSection, 200)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  const reviewItems: CarouselItem[] = [
    {
      id: 1,
      title: 'ค. ค. ค. โคตร คุ้ม ค่า!! | VGN Dragonfly F1 MOBA',
      description: 'ทดสอบความแม่นยำและการตอบสนอง',
      icon: <i className="ri-play-circle-line text-white" />,
      videoUrl: 'https://www.youtube.com/embed/6NnDidaP1hw'
    },
    {
      id: 2,
      title: 'เมาส์ที่ผมอยากให้ทุกคนได้ลอง!',
      description: 'ความคิดเห็นจากนักเล่นเกมมืออาชีพ',
      icon: <i className="ri-trophy-line text-white" />,
      videoUrl: 'https://www.youtube.com/embed/l3dyu3GzGKA'
    },
    {
      id: 3,
      title: 'Top 5 เมาส์เกมมิ่งที่ Pro Player ใช้เยอะสุด! อัปเดตใหม่ปี 2025',
      description: 'เปรียบเทียบกับคู่แข่งในตลาด',
      icon: <i className="ri-star-smile-line text-white" />,
      videoUrl: 'https://www.youtube.com/embed/Zsc3Lp_ukiE'
    },
    {
      id: 4,
      title: '4,000 Hz Polling Rate แตกต่างกับ 1,000 Hz แค่ไหน? คลิปนี้มีคำตอบ!',
      description: 'เปรียบเทียบระหว่าง 4,000 Hz และ 1,000 Hz',
      icon: <i className="ri-speed-up-line text-white" />,
      videoUrl: 'https://www.youtube.com/embed/q2rGdFE9Kyg'
    }
  ]

  return (
    <div className="bg-white text-black font-ibmplexthai">
      <AppNav />
      <FloatingThemeToggle />

      {/* Hero */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden -mt-[110px] pt-[110px]">
        <video id="hero-video" className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source id="video-source" src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />

        <div className="container mx-auto px-4 relative z-10 group">
          <div className="text-center text-white flex flex-col items-center justify-center min-h-screen">
            <div className="mb-4 opacity-0 animate-fade-in transform-gpu">
              <div className="transform-gpu">
                <div className="hero-mouse-logo-glass w-32 h-20 rounded-full flex items-center justify-center transform-gpu">
                  <i className="fas fa-mouse text-white/120 text-4xl drop-shadow-lg relative z-10 transform-gpu" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 opacity-0 animate-fade-in drop-shadow-2xl" id="hero-title">
              <span className="block group-hover:scale-105 transition-transform transform-gpu duration-500 ease-in-out">HYPE-MACRO</span>
              <span className="block text-3xl md:text-5xl font-light group-hover:scale-105 transition-transform transform-gpu duration-500 ease-in-out">PRO GAMING</span>
            </h1>
            <p className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto opacity-0 animate-fade-in-delay drop-shadow-lg" id="hero-subtitle">
              ประสบการณ์เกมมิ่งระดับโปรด้วย VXE R1 Series ที่ผสานเทคโนโลยี Omron 20M, Polling Rate 8K และวัสดุพรีเมียม
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 opacity-0 animate-fade-in-delay-2" id="hero-cta">
              <a href="#products" className="hero-cta-primary px-8 py-4 rounded-full font-semibold text-lg shadow-2xl inline-flex items-center justify-center" role="button" aria-label="สั่งซื้อตอนนี้">สั่งซื้อตอนนี้</a>
              <a href="#features" className="hero-cta-secondary px-8 py-4 rounded-full font-semibold text-lg shadow-2xl inline-flex items-center justify-center" role="button" aria-label="ดูรายละเอียด">ดูรายละเอียด</a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <i className="fas fa-chevron-down text-white text-2xl" />
          </div>
        </div>
      </section>

      {/* Features (trimmed structure preserved) */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 group">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">จุดเด่นที่โดดเด่น</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">เทคโนโลยีล้ำสมัยที่จะยกระดับประสบการณ์การเล่นเกมของคุณไปอีกระดับ</p>
          </div>
          {/* Feature blocks copied 1:1 from preview */}
          <div className="mb-20 group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Omron Switch 20M</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">สวิตช์คุณภาพสูงจาก Omron ที่ทนทานถึง 20 ล้านครั้งการกด พร้อมความรู้สึกคลิกที่คมชัดและตอบสนองได้อย่างแม่นยำ เหมาะสำหรับเกมเมอร์ที่ต้องการความแม่นยำสูงสุด</p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />ทนทานถึง 20 ล้านครั้งการกด</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />เสียงคลิกที่เงียบและชัดเจน</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />การตอบสนองที่แม่นยำ</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />ได้รับมาตรฐานสากล</li>
                </ul>
              </div>
              <div className="aspect-square bg-white dark:bg-[#121212] rounded-2xl overflow-hidden shadow-lg p-9">
                <img src="https://ik.imagekit.io/xenodev/Mini%20Project/1?updatedAt=1756061967873" alt="Omron Switch" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="mb-20 group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 aspect-square bg-white dark:bg-[#121212] rounded-2xl overflow-hidden shadow-lg p-9">
                <img src="https://ik.imagekit.io/xenodev/Mini%20Project/2?updatedAt=1756062000340" alt="Premium Materials" className="w-full h-full object-contain" />
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">วัสดุพรีเมียม</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">ผลิตจากพลาสติก ABS คุณภาพสูงและเคลือบด้วยสีขาวเนื้อด้านที่ไม่เป็นรอยนิ้วมือ พร้อมด้วยแผ่นรองเมาส์ที่มีคุณภาพเยี่ยมสำหรับการเคลื่อนไหวที่ลื่นไหล</p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />พลาสติก ABS คุณภาพสูง</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />เคลือบกันรอยนิ้วมือ</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />พื้นผิวเนื้อด้านที่หรูหรา</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />ทนทานต่อการใช้งานหนัก</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-20 group">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Polling Rate 8K</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">อัตราการอัปเดตตำแหน่ง 8,000 Hz ที่รวดเร็วในตลาด ลดความล่าช้า (latency) ให้เหลือเพียง 0.125ms และมอบประสบการณ์การเล่นเกมที่ราบรื่น</p>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />8,000 Hz Polling Rate</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />Latency เพียง 0.125ms</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />การตอบสนองแบบ Real-time</li>
                  <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-3" />เหมาะสำหรับ Competitive Gaming</li>
                </ul>
              </div>
              <div className="order-2 lg:order-1 aspect-square bg-white dark:bg-[#121212] rounded-2xl overflow-hidden shadow-lg p-9">
                <img src="https://ik.imagekit.io/xenodev/Mini%20Project/4?updatedAt=1756062923076" alt="Polling" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews with YouTube Carousel */}
      <section id="reviews" className="py-20 bg-white dark:bg-[#121212] group">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">รีวิวจากผู้เชี่ยวชาญ</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">ชมรีวิวและการทดสอบจากผู้เชี่ยวชาญและเกมเมอร์มืออาชีพ</p>
          </div>
          <div className="flex justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="relative" style={{ height: 'auto', minHeight: '400px', maxHeight: '600px' }}>
              <Carousel
                items={reviewItems}
                baseWidth={800}
                autoplay
                autoplayDelay={4000}
                pauseOnHover
                loop
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-16 group">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">เลือกรุ่นที่ใช่สำหรับคุณ</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">4 รุ่นพิเศษที่ออกแบบมาเพื่อตอบสนองทุกความต้องการของเกมเมอร์</p>
          </div>

          {productsStatus === 'loading' && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">กำลังโหลดสินค้า...</p>
            </div>
          )}

          {productsStatus === 'failed' && (
            <div className="text-center py-12">
              <p className="text-xl text-red-600 dark:text-red-400">ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง</p>
            </div>
          )}

          {productsStatus === 'idle' && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">ไม่มีสินค้าในขณะนี้</p>
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group product-card card-hover rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 ease-in-out">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-80 object-cover object-center" />
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-semibold text-gray-900 dark:text-white relative mb-3">{product.name}</h4>
                  <p className="text-base text-gray-600 dark:text-gray-300 mt-2 mb-4 leading-relaxed">
                    {product.description || 'เมาส์เกมมิ่งคุณภาพสูง ออกแบบมาเพื่อเกมเมอร์'}
                  </p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => dispatch(addItem({ 
                        id: product.id, 
                        name: product.name, 
                        price: product.price, 
                        image: product.image 
                      }))} 
                      className="bg-gray-900 dark:bg-white dark:text-black text-white font-medium text-base px-4 py-2 rounded-lg hover:opacity-90 transition"
                    >
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 dark:bg-[#121212] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                <i className="ri-computer-line mr-2 text-blue-400" />
                Hype-Macro
              </h3>
              <p className="text-gray-400 mb-4">ผู้นำด้านเมาส์เกมมิ่งคุณภาพสูง ออกแบบมาเพื่อเกมเมอร์ทุกระดับ</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-500"><i className="ri-facebook-fill text-xl" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-500"><i className="ri-twitter-fill text-xl" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-500"><i className="ri-instagram-line text-xl" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-500"><i className="ri-youtube-fill text-xl" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">สำรวจ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-all duration-300">ค้นหา</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300">เกี่ยวกับเรา</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300">HYPE-MACRO Rewards</a></li>
                <li><a href="https://hub.atk.pro/" className="hover:text-white">ATK HUB</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">ช่วยเหลือ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-all duration-300">คำถามที่พบบ่อย</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300">การจัดส่ง</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300">การคืนสินค้า</a></li>
                <li><a href="#" className="hover:text-white transition-all duration-300">ติดต่อเรา</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">รับข่าวสาร</h4>
              <p className="text-gray-400 mb-4">รับข้อมูลข่าวสารและโปรโมชั่นล่าสุด</p>
              <div className="flex">
                <input type="email" placeholder="อีเมลของคุณ" className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue transition-all duration-500" />
                <button className="bg-blue-600 px-6 py-2 rounded-r-lg hover:bg-blue-500 transition-all duration-500">สมัคร</button>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 HYPE-RX. สงวนลิขสิทธิ์ทุกประการ</p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-all duration-300">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-white transition-all duration-300">ข้อกำหนดการใช้งาน</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
