// Random Video Background - วิดีโอพื้นหลังสุ่ม
        const videoUrls = [
            'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20Bg/ik-video.mp4?updatedAt=1756063825420',
            'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20bg%202/ik-video.mp4?updatedAt=1756064429930'
        ];

        // ฟังก์ชั่นสุ่มเลือกวิดีโอ
        function setRandomVideo() {
            const randomIndex = Math.floor(Math.random() * videoUrls.length); // สุ่มเลือกวิดีโอ
            const videoSource = document.getElementById('video-source'); // หาองค์ประกอบ video source
            const heroVideo = document.getElementById('hero-video'); // หาองค์ประกอบ video

            videoSource.src = videoUrls[randomIndex]; // ตั้งค่า URL ของวิดีโอ
            heroVideo.load(); // โหลดวิดีโอใหม่
        }

        // Theme Toggle Functionality - ฟังก์ชั่นเปลี่ยนธีม
        const storageKey = 'theme-preference' // คีย์สำหรับเก็บค่าธีมใน localStorage

        // ฟังก์ชั่นคลิกเปลี่ยนธีม
        const onClick = () => {
            theme.value = theme.value === 'light' ? 'dark' : 'light' // สลับระหว่างโหมดสว่างและมืด
            setPreference() // บันทึกค่าธีม
        }

        // ฟังก์ชั่นดึงค่าธีมที่ต้องการ
        const getColorPreference = () => {
            if (localStorage.getItem(storageKey)) // ถ้ามีค่าเก็บไว้ใน localStorage
                return localStorage.getItem(storageKey) // คืนค่าที่เก็บไว้
            else // ถ้าไม่มีค่าเก็บไว้
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' // ใช้ค่าจากระบบ
        }

        // ฟังก์ชั่นตั้งค่าธีมเริ่มต้นจากระบบปฏิบัติการ
        const initializeTheme = () => {
            const preferredTheme = getColorPreference() // ดึงค่าธีมที่ต้องการ
            theme.value = preferredTheme // ตั้งค่าธีม

            // ตั้งค่า data-theme attribute ทันที
            document.documentElement.setAttribute('data-theme', preferredTheme)

            // เพิ่ม/ลบ dark class สำหรับ Tailwind
            if (preferredTheme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }

            console.log(`🌙 Theme initialized: ${preferredTheme}`) // แสดงข้อความในคอนโซล
        }

        // ฟังก์ชั่นบันทึกค่าธีม
        const setPreference = () => {
            localStorage.setItem(storageKey, theme.value) // บันทึกค่าลง localStorage
            reflectPreference() // อัปเดตหน้าเว็บ
        }

        // ฟังก์ชั่นอัปเดตหน้าเว็บตามธีม
        const reflectPreference = () => {
            document.firstElementChild.setAttribute('data-theme', theme.value) // ตั้งค่า attribute ธีม
            document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value) // อัปเดต aria-label

            // Toggle Tailwind dark class - เปลี่ยนคลาส dark ของ Tailwind
            if (theme.value === 'dark') { // ถ้าเป็นโหมดมืด
                document.documentElement.classList.add('dark') // เพิ่มคลาส dark
            } else { // ถ้าเป็นโหมดสว่าง
                document.documentElement.classList.remove('dark') // ลบคลาส dark
            }
        }

        // ออบเจ็กต์เก็บค่าธีม
        const theme = {
            value: getColorPreference(), // ค่าธีมปัจจุบัน
        }

        // เริ่มต้นธีมทันทีเมื่อสคริปต์โหลด
        initializeTheme() // เริ่มต้นธีมจากระบบปฏิบัติการ

        // เมื่อหน้าเว็บโหลดเสร็จ
        window.onload = () => {
            setRandomVideo() // ตั้งค่าวิดีโอสุ่มตอนเริ่มต้น
            reflectPreference() // อัปเดตหน้าเว็บให้สอดคล้องกับธีมที่ตั้งค่าไว้แล้ว
            document.querySelector('#theme-toggle').addEventListener('click', onClick) // เพิ่ม event listener ให้ปุ่ม
        }

        // เมื่อการตั้งค่าระบบเปลี่ยน
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
            theme.value = isDark ? 'dark' : 'light' // อัปเดตค่าธีม
            setPreference() // บันทึกค่าใหม่
        })

        // Mobile Menu Toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button')
        const mobileMenu = document.getElementById('mobile-menu')

        // เมื่อคลิกปุ่มเมนูมือถือ
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden') // สลับการซ่อน/แสดงเมนู
        })

        // Smooth Navigation - การนำทางแบบเรียบ
        function setupSmoothNavigation() {
            // ดึงลิงก์ทั้งหมดที่มี href ขึ้นต้นด้วย #
            const navLinks = document.querySelectorAll('a[href^="#"]')

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault() // หยุดการทำงานปกติของลิงก์

                    const targetId = link.getAttribute('href').substring(1) // ตัด # ออก
                    const targetSection = document.getElementById(targetId)

                    if (targetSection) {
                        // ปิดเมนูมือถือถ้าเปิดอยู่
                        if (!mobileMenu.classList.contains('hidden')) {
                            mobileMenu.classList.add('hidden')
                        }

                        // เลื่อนไปยังส่วนที่ต้องการ
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        })

                        // อัปเดต URL โดยไม่เลื่อนหน้า
                        window.history.pushState(null, null, `#${targetId}`)
                    }
                })
            })
        }

        // เริ่มต้นการทำงานเมื่อหน้าเว็บโหลดเสร็จ
        setupSmoothNavigation()

        // Video Carousel - คาร์รูเซลวิดีโอ
        let currentVideo = 0 // วิดีโอปัจจุบัน
        const videoCarousel = document.getElementById('videoCarousel') // คอนเทนเนอร์คาร์รูเซล
        const prevBtn = document.getElementById('prevVideo') // ปุ่มย้อนกลับ
        const nextBtn = document.getElementById('nextVideo') // ปุ่มถัดไป
        const maxVideos = 4 // จำนวนวิดีโอทั้งหมด
        let autoPlayInterval // ตัวแปรเก็บ interval สำหรับเล่นอัตโนมัติ
        let isUserInteracting = false // สถานะการโต้ตอบของผู้ใช้
        let autoPlayPermanentlyStopped = false // แฟล็กหยุดเล่นอัตโนมัติถาวร

        // ฟังก์ชั่นอัปเดตตำแหน่งคาร์รูเซล
        function updateCarousel() {
            const translateX = currentVideo * -476 // คำนวณระยะเลื่อน (29.75rem = 476px) คำนวนจาก https://nekocalc.com/px-to-rem-converter
            videoCarousel.style.transform = `translateX(${translateX}px)` // เลื่อนคาร์รูเซล
        }

        // ฟังก์ชั่นเริ่มเล่นอัตโนมัติ
        function startAutoPlay() {
            // ไม่เริ่มเล่นอัตโนมัติถ้าถูกหยุดถาวรแล้ว
            if (autoPlayPermanentlyStopped) {
                return
            }

            // ตั้งเวลาเล่นอัตโนมัติทุก 10 วินาที
            autoPlayInterval = setInterval(() => {
                if (!isUserInteracting && !autoPlayPermanentlyStopped) { // ถ้าผู้ใช้ไม่ได้โต้ตอบและไม่ได้หยุดถาวร
                    currentVideo = (currentVideo + 1) % maxVideos // ไปวิดีโอถัดไป
                    updateCarousel() // อัปเดตคาร์รูเซล
                }
            }, 10000)
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval)
            }
        }

        function permanentlyStopAutoPlay() {
            autoPlayPermanentlyStopped = true
            stopAutoPlay()
        }

        // Manual navigation controls
        prevBtn.addEventListener('click', () => {
            currentVideo = currentVideo === 0 ? maxVideos - 1 : currentVideo - 1
            updateCarousel()
            // Reset auto-play timer when user manually navigates
            stopAutoPlay()
            setTimeout(startAutoPlay, 1800000) // เริ่ม auto-play ใหม่หลังจาก 30 นาที
        })

        nextBtn.addEventListener('click', () => {
            currentVideo = currentVideo === maxVideos - 1 ? 0 : currentVideo + 1
            updateCarousel()
            // Reset auto-play timer when user manually navigates
            stopAutoPlay()
            setTimeout(startAutoPlay, 1800000) // เริ่ม auto-play ใหม่หลังจาก 30 นาที
        })

        // Detect when user is interacting with YouTube videos
        const videoContainers = document.querySelectorAll('.video-item')
        videoContainers.forEach(container => {
            const iframe = container.querySelector('iframe')

            // หยุด auto-play เมื่อ user นำ cursor ไปชี้ที่ video
            container.addEventListener('mouseenter', () => {
                isUserInteracting = true
            })

            // Resume auto-play when user leaves video area (only if not permanently stopped)
            container.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    isUserInteracting = false
                }, 2000) // Wait 2 seconds before resuming
            })

            // Permanently stop auto-play when user clicks on video area
            container.addEventListener('click', () => {
                permanentlyStopAutoPlay() // Stop permanently instead of temporarily
            })
        })

        // Listen for YouTube player events using postMessage API
        window.addEventListener('message', function (event) {
            // Check if message is from YouTube
            if (event.origin !== 'https://www.youtube.com') {
                return
            }

            try {
                const data = JSON.parse(event.data)

                // YouTube player state changed
                if (data.event === 'video-progress' || data.event === 'onStateChange') {
                    // Player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
                    if (data.info && data.info.playerState !== undefined) {
                        const playerState = data.info.playerState

                        if (playerState === 1) { // Video is playing
                            permanentlyStopAutoPlay() // Stop auto-play permanently when user plays video
                        }
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }
        })

        // Enable YouTube iframe API for all videos
        const iframes = document.querySelectorAll('.video-item iframe')
        iframes.forEach(iframe => {
            const src = iframe.src
            // Add enablejsapi parameter if not already present
            if (src && !src.includes('enablejsapi=1')) {
                const separator = src.includes('?') ? '&' : '?'
                iframe.src = src + separator + 'enablejsapi=1&origin=' + encodeURIComponent(window.location.origin)
            }
        })

        // Start auto-play initially
        startAutoPlay()

        // Product Cards Animation (Static Grid Layout)
        // Add smooth hover animations and interactions for product cards
        const productCards = document.querySelectorAll('#products .group')
        productCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.opacity = '0'
            card.style.transform = 'translateY(20px)'

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out'
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
            }, 200 * (index + 1))

            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)'
            })

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)'
            })
        })

        // Intersection Observer for product cards animation on scroll
        const productObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-fade-in')
                    }, 100 * index)
                }
            })
        }, { threshold: 0.1 })

        // Observe product cards
        productCards.forEach(card => {
            productObserver.observe(card)
        })

        // Smooth animations for hero section
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.getElementById('hero-title').style.opacity = '1'
                document.getElementById('hero-title').style.transform = 'translateY(0)'
            }, 500)

            setTimeout(() => {
                document.getElementById('hero-subtitle').style.opacity = '1'
                document.getElementById('hero-subtitle').style.transform = 'translateY(0)'
            }, 1000)

            setTimeout(() => {
                document.getElementById('hero-cta').style.opacity = '1'
                document.getElementById('hero-cta').style.transform = 'translateY(0)'
            }, 1500)
        })

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in')
                }
            })
        }, observerOptions)

        // Observe all feature sections
        document.querySelectorAll('#features > div > div').forEach(el => {
            observer.observe(el)
        })