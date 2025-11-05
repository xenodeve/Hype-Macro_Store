const videoUrls: string[] = [
  'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20Bg/ik-video.mp4?updatedAt=1756063825420',
  'https://ik.imagekit.io/xenodev/Mini%20Project/Home%20bg%202/ik-video.mp4?updatedAt=1756064429930',
]

export function setRandomVideo(): void {
  const randomIndex: number = Math.floor(Math.random() * videoUrls.length)
  const videoSource = document.getElementById('video-source') as HTMLSourceElement | null
  const heroVideo = document.getElementById('hero-video') as HTMLVideoElement | null

  if (videoSource && heroVideo) {
    videoSource.src = videoUrls[randomIndex]
    heroVideo.load()
  }
}
