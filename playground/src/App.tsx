import { useCallback, useEffect, useRef, useState } from 'react'

import { MotionControlsSidebar } from '@/components/motion-controls-sidebar'
import { type MotionConfig, defaultMotionConfig } from '@/lib/motion-config'

const imageSources = [
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

const getImageId = (src: string) => src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? src
const imageItems = imageSources.map(src => ({ id: getImageId(src), src }))
const TOTAL = imageItems.length
const VISIBLE_COUNT = 36
const CENTER = Math.floor(VISIBLE_COUNT / 2)
const CARD_WIDTH = 320
const CARD_HEIGHT = 384

const mod = (n: number, m: number) => ((n % m) + m) % m

const visibleSlots = Array.from({ length: VISIBLE_COUNT }, (_, slotIndex) => {
  const initialImageIndex = mod(slotIndex, TOTAL)

  return {
    slotIndex,
    slotId: `image-slot-${slotIndex - CENTER}`,
    initialImage: imageItems[initialImageIndex],
    initialLabel: String(initialImageIndex).padStart(2, '0'),
  }
})

export default function App() {
  const cardsRef = useRef<HTMLDivElement[]>([])
  const labelsRef = useRef<HTMLSpanElement[]>([])
  const imagesRef = useRef<HTMLImageElement[]>([])
  const shadeLayersRef = useRef<HTMLDivElement[]>([])
  const controlsPanelRef = useRef<HTMLDivElement | null>(null)
  const fpsRef = useRef<HTMLDivElement | null>(null)
  const decodedImageCache = useRef<Map<string, Promise<void>>>(new Map())
  const motionConfigRef = useRef(defaultMotionConfig)
  const fpsStatsRef = useRef({
    lastSampleTime: 0,
    framesSinceSample: 0,
    frameTimeTotal: 0,
    droppedFramesSinceSample: 0,
  })
  const slotStatesRef = useRef(
    visibleSlots.map(({ initialImage, initialLabel }) => ({
      currentImageId: initialImage.id,
      currentLabel: initialLabel,
      pendingImageId: '',
      swapRequestId: 0,
      isHidden: false,
      shadeOpacity: -1,
    })),
  )

  const [motionConfig, setMotionConfig] = useState(defaultMotionConfig)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showFps, setShowFps] = useState(true)

  const scrollTarget = useRef(0)
  const scrollCurrent = useRef(0)
  const inputVelocity = useRef(0)
  const velocity = useRef(0)
  const waveAmplitude = useRef(0)
  const rafId = useRef(0)
  const timeRef = useRef(0)

  const ensureImageDecoded = useCallback((src: string) => {
    const cached = decodedImageCache.current.get(src)
    if (cached)
      return cached

    const promise = new Promise<void>((resolve) => {
      const image = new window.Image()
      let settled = false

      const finish = () => {
        if (settled)
          return
        settled = true
        resolve()
      }

      image.onload = finish
      image.onerror = finish
      image.src = src

      if (image.complete) {
        finish()
        return
      }

      if (typeof image.decode === 'function') {
        void image.decode().then(finish).catch(finish)
      }
    })

    decodedImageCache.current.set(src, promise)
    return promise
  }, [])

  const setCardRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el)
      cardsRef.current[i] = el
  }, [])

  const setLabelRef = useCallback((i: number) => (el: HTMLSpanElement | null) => {
    if (el)
      labelsRef.current[i] = el
  }, [])

  const setImageRef = useCallback((i: number) => (el: HTMLImageElement | null) => {
    if (el)
      imagesRef.current[i] = el
  }, [])

  const setShadeLayerRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el)
      shadeLayersRef.current[i] = el
  }, [])

  useEffect(() => {
    motionConfigRef.current = motionConfig
  }, [motionConfig])

  const updateMotionConfig = useCallback((key: keyof MotionConfig, value: number) => {
    setMotionConfig(current => ({
      ...current,
      [key]: value,
    }))
  }, [])

  const resetMotionConfig = useCallback(() => {
    setMotionConfig(defaultMotionConfig)
  }, [])

  const registerScrollInput = useCallback((delta: number, inputType: 'wheel' | 'touch') => {
    const config = motionConfigRef.current
    const inputScale = inputType === 'touch' ? config.touchInputScale : config.wheelInputScale

    scrollTarget.current += delta * inputScale
    inputVelocity.current = inputVelocity.current * 0.45 + delta * config.inputVelocityGain
  }, [])

  useEffect(() => {
    for (const { src } of imageItems)
      void ensureImageDecoded(src)

    if (showFps && fpsRef.current) {
      fpsRef.current.textContent = 'FPS --\nFRAME -- ms\nDROP --'
    }

    const isInsideSidebar = (target: EventTarget | null) =>
      target instanceof Node && Boolean(controlsPanelRef.current?.contains(target))

    const onWheel = (event: WheelEvent) => {
      if (isInsideSidebar(event.target))
        return
      event.preventDefault()
      registerScrollInput(event.deltaY, 'wheel')
    }

    let touchY = 0

    const onTouchStart = (event: TouchEvent) => {
      if (isInsideSidebar(event.target))
        return
      touchY = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (isInsideSidebar(event.target))
        return
      event.preventDefault()
      const dy = touchY - event.touches[0].clientY
      touchY = event.touches[0].clientY
      registerScrollInput(dy, 'touch')
    }

    const animate = (time: number) => {
      const config = motionConfigRef.current
      const frameDelta = timeRef.current ? time - timeRef.current : 16.667
      const dt = frameDelta / 16.667
      timeRef.current = time
      inputVelocity.current *= config.inputVelocityDecay ** dt

      const fpsStats = fpsStatsRef.current
      if (!fpsStats.lastSampleTime)
        fpsStats.lastSampleTime = time

      fpsStats.framesSinceSample += 1
      fpsStats.frameTimeTotal += frameDelta
      fpsStats.droppedFramesSinceSample += Math.max(0, Math.round(frameDelta / 16.667) - 1)

      if (time - fpsStats.lastSampleTime >= 250) {
        const elapsed = time - fpsStats.lastSampleTime
        const fps = (fpsStats.framesSinceSample * 1000) / elapsed
        const avgFrame = fpsStats.frameTimeTotal / fpsStats.framesSinceSample
        const fpsColor = fps >= 55 ? '#dcfce7' : fps >= 45 ? '#fde68a' : '#fecaca'

        if (showFps && fpsRef.current) {
          fpsRef.current.textContent = `FPS ${fps.toFixed(0)}\nFRAME ${avgFrame.toFixed(1)} ms\nDROP ${fpsStats.droppedFramesSinceSample}`
          fpsRef.current.style.color = fpsColor
        }

        fpsStats.lastSampleTime = time
        fpsStats.framesSinceSample = 0
        fpsStats.frameTimeTotal = 0
        fpsStats.droppedFramesSinceSample = 0
      }

      const prev = scrollCurrent.current
      const followStrength = Math.min(
        config.maxScrollFollow,
        config.baseScrollFollow + Math.abs(inputVelocity.current) * config.followVelocityInfluence,
      )
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * followStrength * Math.min(dt, 3)
      velocity.current = (scrollCurrent.current - prev) / Math.max(dt, 0.5)

      const speed = Math.abs(velocity.current)
      const targetWave = Math.min(config.maxWaveAmplitude, speed * config.waveScrollGain)
      const waveResponse = Math.min(config.maxWaveResponse, config.waveResponseBase + speed * config.waveResponseGain)
      waveAmplitude.current += (targetWave - waveAmplitude.current) * waveResponse

      const scrollPos = scrollCurrent.current / config.spacingX
      const baseIndex = Math.floor(scrollPos)
      const wave = waveAmplitude.current

      for (let i = 0; i < VISIBLE_COUNT; i++) {
        const card = cardsRef.current[i]
        const img = imagesRef.current[i]
        const slotState = slotStatesRef.current[i]
        if (!card || !img || !slotState)
          continue

        const logicalIndex = baseIndex + i - CENTER
        const pos = logicalIndex - scrollPos

        const x = pos * config.spacingX
        const y = pos * config.spacingY
        const z = pos * config.spacingZ
        const centeredX = x - CARD_WIDTH / 2
        const centeredY = y - CARD_HEIGHT / 2

        const waveShape = Math.sin(pos * config.waveFrequency)
        const waveOffset = waveShape * wave
        const tiltX = waveShape * Math.min(config.maxWaveTiltX, wave * config.waveTiltXGain)
        const dist = Math.abs(pos)
        const isHidden = dist > CENTER - 1
        const opacity = isHidden ? 0 : 1
        const shadeOpacity = Math.min(0.86, dist * 0.085)

        card.style.transform = `translate3d(${centeredX}px, ${centeredY + waveOffset}px, ${z}px) rotateY(-50deg) rotateX(${tiltX}deg)`
        card.style.opacity = String(opacity)
        if (slotState.isHidden !== isHidden) {
          card.style.visibility = isHidden ? 'hidden' : 'visible'
          slotState.isHidden = isHidden
        }

        const shadeLayer = shadeLayersRef.current[i]
        if (shadeLayer && Math.abs(slotState.shadeOpacity - shadeOpacity) > 0.015) {
          shadeLayer.style.opacity = String(shadeOpacity)
          slotState.shadeOpacity = shadeOpacity
        }

        const imgIdx = mod(logicalIndex, TOTAL)
        const nextImage = imageItems[imgIdx]
        if (slotState.currentImageId === nextImage.id) {
          if (slotState.pendingImageId) {
            slotState.pendingImageId = ''
            slotState.swapRequestId += 1
          }
        }
        else if (!isHidden && slotState.pendingImageId !== nextImage.id) {
          const requestId = slotState.swapRequestId + 1
          slotState.pendingImageId = nextImage.id
          slotState.swapRequestId = requestId

          void ensureImageDecoded(nextImage.src).then(() => {
            const currentSlotState = slotStatesRef.current[i]
            const currentImg = imagesRef.current[i]
            if (!currentSlotState || !currentImg)
              return
            if (currentSlotState.swapRequestId !== requestId)
              return
            if (currentSlotState.pendingImageId !== nextImage.id)
              return

            currentImg.src = nextImage.src
            currentSlotState.currentImageId = nextImage.id
            currentSlotState.pendingImageId = ''
          })
        }

        const label = labelsRef.current[i]
        const nextLabel = String(imgIdx).padStart(2, '0')
        if (label && slotState.currentLabel !== nextLabel) {
          label.textContent = nextLabel
          slotState.currentLabel = nextLabel
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
  }, [ensureImageDecoded, registerScrollInput, showFps])

  return (
    <div className="app-shell">
      {showFps && (
        <div ref={fpsRef} className="fps-overlay">
          FPS --
          {'\n'}
          FRAME -- ms
          {'\n'}
          DROP --
        </div>
      )}

      <MotionControlsSidebar
        isOpen={isSidebarOpen}
        motionConfig={motionConfig}
        panelRef={controlsPanelRef}
        showFps={showFps}
        onMotionConfigChange={updateMotionConfig}
        onOpenChange={setIsSidebarOpen}
        onReset={resetMotionConfig}
        onShowFpsChange={setShowFps}
      />

      <div className="scene-root">
        <div className="scene-stage" style={{ perspective: 2000, perspectiveOrigin: '10% 10%' }}>
          <div className="scene-lane" style={{ transform: 'translateY(100px)' }}>
            {visibleSlots.map(({ slotIndex, slotId, initialImage, initialLabel }) => (
              <div
                key={slotId}
                ref={setCardRef(slotIndex)}
                className="scene-card"
                style={{
                  zIndex: 1,
                  transition: 'opacity 0.18s ease',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                  contain: 'layout paint style',
                }}
              >
                <div className="scene-card-media">
                  <img
                    ref={setImageRef(slotIndex)}
                    alt=""
                    className="scene-card-image"
                    decoding="async"
                    draggable={false}
                    loading="eager"
                    src={initialImage.src}
                    style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                  />
                  <div ref={setShadeLayerRef(slotIndex)} className="scene-card-shade" style={{ opacity: 0, willChange: 'opacity' }} />
                </div>

                <span ref={setLabelRef(slotIndex)} className="scene-card-label">
                  {initialLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
