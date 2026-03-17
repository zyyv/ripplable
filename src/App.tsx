import { useEffect, useRef, useState } from 'react'

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

// 26 cards: 16 unique + 10 repeating
const cards = Array.from({ length: 26 }, (_, i) => ({
  index: i,
  image: images[i % 16],
}))

export default function App() {
  const scrollOffset = useRef(0)
  const targetOffset = useRef(0)
  const rafId = useRef(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetOffset.current += e.deltaY * 0.5
    }

    const animate = () => {
      scrollOffset.current += (targetOffset.current - scrollOffset.current) * 0.08
      setOffset(scrollOffset.current)
      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black touch-none overflow-hidden">
      {/* Title */}
      <div className="absolute top-8 left-8 z-10 text-white" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1 }}>
          HERITAGE FW25/26
        </h1>
        <p className="mt-2 text-lg tracking-wide">
          COLLECTION<sup className="text-sm">(16)</sup>
        </p>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 z-10 text-white text-xs font-mono uppercase tracking-widest opacity-60">
        scroll to surf
      </div>

      {/* 3D Scene */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '2000px', perspectiveOrigin: '10% 10%' }}
      >
        <div style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
          {cards.map((card, i) => {
            const scrollScale = offset / 240
            const pos = i - 13 + scrollScale
            const x = pos * 240
            const y = pos * -84
            const z = pos * -288
            const dist = Math.abs(pos)
            const brightness = Math.max(0.15, 1 - dist * 0.08)

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: 320,
                  height: 384,
                  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(-50deg)`,
                  filter: `brightness(${brightness})`,
                  transformStyle: 'preserve-3d',
                  left: -160,
                  top: -192,
                }}
              >
                <span className="text-white text-xs font-mono absolute -top-5 left-0 opacity-60">
                  {String(i).padStart(2, '0')}
                </span>
                <img
                  src={card.image}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
