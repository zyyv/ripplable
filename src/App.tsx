import { useEffect, useRef, useCallback } from 'react'

const images = [
  '/images/11d2f7cd-e5b9-482d-8066-a009687161bc.png',
  '/images/2224e403-9848-4b10-bb28-e88d6ee322e3.png',
  '/images/0390a926-86f7-4ad3-98b2-272d7ad76c9a.png',
  '/images/7dfe5bad-3d26-4af9-8493-b4f3c851a07a.png',
  '/images/579bd461-499c-4dca-8fc2-52ffd7e50612.png',
  '/images/2ed47c65-b6dc-4eb7-a330-98b4b931757a.png',
  '/images/4f052a9a-216b-45d4-813a-644000eec8cc.png',
  '/images/8e3c62cd-b8ad-44df-af64-f2cc6a0f3fee.png',
  '/images/30779d00-8cbc-4ced-bf81-7dd8249c7673.png',
  '/images/735b7d4f-edca-46f7-bc2f-b3a3e71f33f0.jpg',
  '/images/e5d8c9a0-ce43-44fc-b3fa-a36cacb5d3ed.png',
  '/images/17582619-ea38-4aa1-aee4-0ea41adc4356.png',
  '/images/aa85152c-3882-45e6-9d79-cba90e9adaca.png',
  '/images/f0e49ca9-baf4-4b1e-8517-a2356bfd454a.png',
  '/images/aff00f59-fcd1-4b4f-afbd-4b2446d6eabc.png',
  '/images/f67ff078-008a-461c-9863-7693edc89761.png',
]

const TOTAL = 16
const VISIBLE_COUNT = 36
const CENTER = Math.floor(VISIBLE_COUNT / 2)
const SPACING_X = 240
const SPACING_Y = -84
const SPACING_Z = -288

const mod = (n: number, m: number) => ((n % m) + m) % m

export default function App() {
  const cardsRef = useRef<HTMLDivElement[]>([])
  const labelsRef = useRef<HTMLSpanElement[]>([])
  const imagesRef = useRef<HTMLImageElement[]>([])

  const scrollTarget = useRef(0)
  const scrollCurrent = useRef(0)
  const velocity = useRef(0)
  const waveAmplitude = useRef(0)
  const rafId = useRef(0)
  const timeRef = useRef(0)

  const setCardRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el
  }, [])

  const setLabelRef = useCallback((i: number) => (el: HTMLSpanElement | null) => {
    if (el) labelsRef.current[i] = el
  }, [])

  const setImageRef = useCallback((i: number) => (el: HTMLImageElement | null) => {
    if (el) imagesRef.current[i] = el
  }, [])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollTarget.current += e.deltaY * 0.5
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const dy = touchY - e.touches[0].clientY
      touchY = e.touches[0].clientY
      scrollTarget.current += dy * 1.5
    }

    const animate = (time: number) => {
      const dt = timeRef.current ? (time - timeRef.current) / 16.667 : 1
      timeRef.current = time

      const prev = scrollCurrent.current
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.085 * Math.min(dt, 3)
      velocity.current = (scrollCurrent.current - prev) / Math.max(dt, 0.5)

      const speed = Math.abs(velocity.current)
      const targetWave = Math.min(speed * 2.8, 120)
      waveAmplitude.current += (targetWave - waveAmplitude.current) * 0.07

      const scrollPos = scrollCurrent.current / SPACING_X
      const baseIndex = Math.floor(scrollPos)
      const wave = waveAmplitude.current

      for (let i = 0; i < VISIBLE_COUNT; i++) {
        const card = cardsRef.current[i]
        const img = imagesRef.current[i]
        if (!card || !img) continue

        const logicalIndex = baseIndex + i - CENTER
        const pos = logicalIndex - scrollPos

        const x = pos * SPACING_X
        const y = pos * SPACING_Y
        const z = pos * SPACING_Z

        const wavePhase = logicalIndex * 0.55 + time * 0.0035
        const waveOffset = Math.sin(wavePhase) * wave
        const dist = Math.abs(pos)
        const brightness = Math.max(0.14, 1 - dist * 0.085)
        const opacity = dist > CENTER - 1 ? 0 : 1

        card.style.transform = `translate3d(${x}px, ${y + waveOffset}px, ${z}px) rotateY(-50deg)`
        card.style.filter = `brightness(${brightness})`
        card.style.opacity = String(opacity)

        const imgIdx = mod(logicalIndex, TOTAL)
        if (img.dataset.idx !== String(imgIdx)) {
          img.src = images[imgIdx]
          img.dataset.idx = String(imgIdx)
        }

        const label = labelsRef.current[i]
        if (label) {
          label.textContent = String(imgIdx).padStart(2, '0')
        }
      }

      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black touch-none overflow-hidden select-none">
      <div className="absolute z-50" style={{ top: '3vw', left: '3vw', fontWeight: 600, letterSpacing: '-0.02em' }}>
        <div className="text-white leading-none tracking-tight" style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 0.9, marginLeft: '4vw' }}>
          HERITAGE FW25/26
        </div>
        <div className="text-white leading-none tracking-tight" style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 0.9 }}>
          COLLECTION<sup className="tabular-nums font-semibold tracking-normal" style={{ fontSize: 'clamp(10px, 0.4em, 0.4em)', marginLeft: 4, position: 'relative', top: '0.65em', verticalAlign: 'top' as const }}>(16)</sup>
        </div>
      </div>

      <div className="absolute z-50 flex items-center font-mono uppercase" style={{ bottom: '3vw', right: '3vw', fontSize: 10, letterSpacing: '0.05em', color: 'white' }}>
        scroll to surf
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 2000, perspectiveOrigin: '10% 10%' }}>
        <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'translateY(100px)' }}>
          {Array.from({ length: VISIBLE_COUNT }, (_, i) => (
            <div
              key={i}
              ref={setCardRef(i)}
              className="absolute w-80 h-96 flex items-center justify-center text-white text-5xl font-bold shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                zIndex: 1,
                transition: 'filter 0.18s ease, opacity 0.18s ease',
                willChange: 'transform, filter, opacity',
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="absolute inset-0 overflow-hidden bg-black">
                <img
                  ref={setImageRef(i)}
                  src={images[i % TOTAL]}
                  data-idx={String(i % TOTAL)}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <span
                ref={setLabelRef(i)}
                className="absolute font-sans text-white"
                style={{ top: -24, left: 0, fontSize: 10, letterSpacing: '0.05em' }}
              >
                {String(i % TOTAL).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
