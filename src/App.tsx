import { useEffect, useRef, useCallback, useState } from 'react'

import { RotateCcw, SlidersHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

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
const imageItems = imageSources.map((src) => ({ id: getImageId(src), src }))
const TOTAL = imageItems.length
const VISIBLE_COUNT = 36
const CENTER = Math.floor(VISIBLE_COUNT / 2)
const CARD_WIDTH = 320
const CARD_HEIGHT = 384

type MotionConfig = {
  wheelInputScale: number
  touchInputScale: number
  baseScrollFollow: number
  maxScrollFollow: number
  followVelocityInfluence: number
  inputVelocityGain: number
  inputVelocityDecay: number
  waveScrollGain: number
  maxWaveAmplitude: number
  waveFrequency: number
  waveResponseBase: number
  waveResponseGain: number
  maxWaveResponse: number
  waveTiltXGain: number
  maxWaveTiltX: number
  spacingX: number
  spacingY: number
  spacingZ: number
}

type MotionControlDefinition = {
  key: keyof MotionConfig
  label: string
  min: number
  max: number
  step: number
}

const defaultMotionConfig: MotionConfig = {
  wheelInputScale: 0.5,
  touchInputScale: 0.75,
  baseScrollFollow: 0.085,
  maxScrollFollow: 0.28,
  followVelocityInfluence: 0.004,
  inputVelocityGain: 0.18,
  inputVelocityDecay: 0.82,
  waveScrollGain: 4.8,
  maxWaveAmplitude: 180,
  waveFrequency: 1.05,
  waveResponseBase: 0.06,
  waveResponseGain: 0.008,
  maxWaveResponse: 0.2,
  waveTiltXGain: 0.04,
  maxWaveTiltX: 12,
  spacingX: 240,
  spacingY: -84,
  spacingZ: -288,
}

const motionControlSections: Array<{
  title: string
  description: string
  controls: MotionControlDefinition[]
}> = [
  {
    title: 'Input',
    description: 'How aggressively wheel and touch drive the strip.',
    controls: [
      { key: 'wheelInputScale', label: 'Wheel Scale', min: 0.1, max: 1.2, step: 0.01 },
      { key: 'touchInputScale', label: 'Touch Scale', min: 0.1, max: 1.6, step: 0.01 },
      { key: 'inputVelocityGain', label: 'Input Gain', min: 0.02, max: 0.6, step: 0.01 },
      { key: 'inputVelocityDecay', label: 'Input Decay', min: 0.5, max: 0.98, step: 0.01 },
    ],
  },
  {
    title: 'Follow',
    description: 'How fast the rendered strip catches the target scroll.',
    controls: [
      { key: 'baseScrollFollow', label: 'Base Follow', min: 0.02, max: 0.3, step: 0.005 },
      { key: 'maxScrollFollow', label: 'Max Follow', min: 0.08, max: 0.6, step: 0.01 },
      { key: 'followVelocityInfluence', label: 'Velocity Influence', min: 0.001, max: 0.02, step: 0.001 },
    ],
  },
  {
    title: 'Wave',
    description: 'Speed controls how strong and how fast the wave reacts.',
    controls: [
      { key: 'waveScrollGain', label: 'Wave Gain', min: 0.5, max: 12, step: 0.1 },
      { key: 'maxWaveAmplitude', label: 'Wave Max', min: 20, max: 320, step: 1 },
      { key: 'waveFrequency', label: 'Wave Frequency', min: 0.2, max: 2.4, step: 0.01 },
      { key: 'waveResponseBase', label: 'Response Base', min: 0.01, max: 0.18, step: 0.005 },
      { key: 'waveResponseGain', label: 'Response Gain', min: 0.001, max: 0.03, step: 0.001 },
      { key: 'maxWaveResponse', label: 'Response Max', min: 0.05, max: 0.45, step: 0.01 },
      { key: 'waveTiltXGain', label: 'Tilt Gain', min: 0, max: 0.12, step: 0.002 },
      { key: 'maxWaveTiltX', label: 'Tilt Max', min: 0, max: 24, step: 0.5 },
    ],
  },
  {
    title: 'Path',
    description: 'Layout spacing for the infinite card lane.',
    controls: [
      { key: 'spacingX', label: 'Spacing X', min: 120, max: 380, step: 1 },
      { key: 'spacingY', label: 'Spacing Y', min: -180, max: 40, step: 1 },
      { key: 'spacingZ', label: 'Spacing Z', min: -420, max: -80, step: 1 },
    ],
  },
]

const mod = (n: number, m: number) => ((n % m) + m) % m

const formatControlValue = (value: number, step: number) => {
  if (Math.abs(value) >= 100 || step >= 1) return value.toFixed(0)
  if (step >= 0.1) return value.toFixed(1)
  if (step >= 0.01) return value.toFixed(2)
  return value.toFixed(3)
}

function MotionControlRow({
  control,
  value,
  onChange,
}: {
  control: MotionControlDefinition
  value: number
  onChange: (key: keyof MotionConfig, value: number) => void
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium tracking-[0.18em] text-white/72 uppercase">{control.label}</span>
        <Badge variant="outline" className="border-white/12 bg-white/6 text-[11px] text-white/88">
          {formatControlValue(value, control.step)}
        </Badge>
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={(event) => onChange(control.key, Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/14 accent-white"
      />
    </label>
  )
}

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
    }))
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
    if (cached) return cached

    const promise = new Promise<void>((resolve) => {
      const image = new window.Image()
      let settled = false

      const finish = () => {
        if (settled) return
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
    if (el) cardsRef.current[i] = el
  }, [])

  const setLabelRef = useCallback((i: number) => (el: HTMLSpanElement | null) => {
    if (el) labelsRef.current[i] = el
  }, [])

  const setImageRef = useCallback((i: number) => (el: HTMLImageElement | null) => {
    if (el) imagesRef.current[i] = el
  }, [])

  const setShadeLayerRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el) shadeLayersRef.current[i] = el
  }, [])

  useEffect(() => {
    motionConfigRef.current = motionConfig
  }, [motionConfig])

  const updateMotionConfig = useCallback((key: keyof MotionConfig, value: number) => {
    setMotionConfig((current) => ({
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
    for (const { src } of imageItems) {
      void ensureImageDecoded(src)
    }

    if (showFps && fpsRef.current) {
      fpsRef.current.textContent = 'FPS --\nFRAME -- ms\nDROP --'
    }

    const isInsideSidebar = (target: EventTarget | null) =>
      target instanceof Node && Boolean(controlsPanelRef.current?.contains(target))

    const onWheel = (e: WheelEvent) => {
      if (isInsideSidebar(e.target)) return
      e.preventDefault()
      registerScrollInput(e.deltaY, 'wheel')
    }

    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      if (isInsideSidebar(e.target)) return
      touchY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (isInsideSidebar(e.target)) return
      e.preventDefault()
      const dy = touchY - e.touches[0].clientY
      touchY = e.touches[0].clientY
      registerScrollInput(dy, 'touch')
    }

    const animate = (time: number) => {
      const config = motionConfigRef.current
      const frameDelta = timeRef.current ? time - timeRef.current : 16.667
      const dt = frameDelta / 16.667
      timeRef.current = time
      inputVelocity.current *= Math.pow(config.inputVelocityDecay, dt)

      const fpsStats = fpsStatsRef.current
      if (!fpsStats.lastSampleTime) {
        fpsStats.lastSampleTime = time
      }

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
        config.baseScrollFollow + Math.abs(inputVelocity.current) * config.followVelocityInfluence
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
        if (!card || !img || !slotState) continue

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
        } else if (!isHidden && slotState.pendingImageId !== nextImage.id) {
          const requestId = slotState.swapRequestId + 1
          slotState.pendingImageId = nextImage.id
          slotState.swapRequestId = requestId

          void ensureImageDecoded(nextImage.src).then(() => {
            const currentSlotState = slotStatesRef.current[i]
            const currentImg = imagesRef.current[i]
            if (!currentSlotState || !currentImg) return
            if (currentSlotState.swapRequestId !== requestId) return
            if (currentSlotState.pendingImageId !== nextImage.id) return

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
    <div className="fixed inset-0 bg-black touch-none overflow-hidden select-none">
      {showFps && (
        <div
          ref={fpsRef}
          className="absolute left-4 top-4 z-50 pointer-events-none font-mono text-[11px] leading-4 text-white"
          style={{
            whiteSpace: 'pre',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.55)',
            letterSpacing: '0.04em',
          }}
        >
          FPS --
          {'\n'}
          FRAME -- ms
          {'\n'}
          DROP --
        </div>
      )}

      <div className="absolute right-4 top-4 z-50 touch-auto pointer-events-auto">
        <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen((open) => !open)} className="border-white/12 bg-black/50 text-white hover:bg-white/10">
          <SlidersHorizontal />
          {isSidebarOpen ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>

      <div
        ref={controlsPanelRef}
        data-motion-sidebar
        className={`absolute right-4 top-16 bottom-4 z-50 w-[min(360px,calc(100vw-2rem))] touch-auto pointer-events-auto transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}`}
        style={{ touchAction: 'auto' }}
      >
        <Card className="flex h-full flex-col gap-0 overflow-hidden border border-white/10 bg-black/72 text-white ring-0 backdrop-blur-xl">
          <CardHeader className="gap-3 border-b border-white/10 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="border-white/12 bg-white/6 text-white/80">
                  Motion Config
                </Badge>
                <div>
                  <CardTitle className="text-white">Sidebar Controls</CardTitle>
                  <CardDescription className="text-white/58">
                    Tune scroll follow, wave behavior, and lane spacing live.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={resetMotionConfig}
                className="border-white/12 bg-white/6 text-white hover:bg-white/12"
                aria-label="Reset motion settings"
              >
                <RotateCcw />
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/6 px-3 py-2">
              <div>
                <div className="text-[11px] font-medium tracking-[0.18em] text-white/72 uppercase">FPS Monitor</div>
                <div className="text-xs text-white/52">Toggle the live frame counter overlay.</div>
              </div>
              <Switch checked={showFps} onCheckedChange={setShowFps} />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {motionControlSections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-4">
                    <div className="text-[11px] font-medium tracking-[0.2em] text-white/74 uppercase">{section.title}</div>
                    <p className="mt-1 text-xs leading-5 text-white/48">{section.description}</p>
                  </div>
                  <div className="space-y-4">
                    {section.controls.map((control) => (
                      <MotionControlRow
                        key={control.key}
                        control={control}
                        value={motionConfig[control.key]}
                        onChange={updateMotionConfig}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 2000, perspectiveOrigin: '10% 10%' }}>
        <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'translateY(100px)' }}>
          {visibleSlots.map(({ slotIndex, slotId, initialImage, initialLabel }) => (
            <div
              key={slotId}
              ref={setCardRef(slotIndex)}
              className="absolute w-80 h-96 flex items-center justify-center text-white text-5xl font-bold shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                zIndex: 1,
                transition: 'opacity 0.18s ease',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                contain: 'layout paint style',
              }}
            >
              <div className="absolute inset-0 overflow-hidden bg-black">
                <img
                  ref={setImageRef(slotIndex)}
                  src={initialImage.src}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)', willChange: 'transform' }}
                />
                <div
                  ref={setShadeLayerRef(slotIndex)}
                  className="absolute inset-0 pointer-events-none bg-black"
                  style={{ opacity: 0, willChange: 'opacity' }}
                />
              </div>
              <span
                ref={setLabelRef(slotIndex)}
                className="absolute font-sans text-white"
                style={{ top: -24, left: 0, fontSize: 10, letterSpacing: '0.05em' }}
              >
                {initialLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
