// รายการ URL วิดีโอสำหรับพื้นหลังแบบสุ่ม
const videoUrls: string[] = [
    'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20Bg/ik-video.mp4?updatedAt=1756063825420',
    'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20bg%202/ik-video.mp4?updatedAt=1756064429930'
];

// ฟังก์ชั่นสุ่มเลือกวิดีโอ
export function setRandomVideo(): void {
    const randomIndex: number = Math.floor(Math.random() * videoUrls.length); // สุ่มเลือกวิดีโอ
    const videoSource = document.getElementById('video-source') as HTMLSourceElement; // หาองค์ประกอบ video source
    const heroVideo = document.getElementById('hero-video') as HTMLVideoElement; // หาองค์ประกอบ video

    if (videoSource && heroVideo) {
        videoSource.src = videoUrls[randomIndex]; // ตั้งค่า URL ของวิดีโอ
        heroVideo.load(); // โหลดวิดีโอใหม่
    }
}
