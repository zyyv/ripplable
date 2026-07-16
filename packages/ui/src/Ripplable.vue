<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import {
  clampRipplableAutoplaySpeed,
  createRipplableConfig,
  formatRipplableLabel,
  normalizeRipplableItem,
  normalizeRipplableAutoplay,
  type RipplableAutoplay,
  type ResolvedRipplableItem,
  type RipplableConfig,
  type RipplableImageEvent,
  type RipplableListItem,
} from './ripplable'

interface RenderSlotState {
  slotIndex: number
  slotId: string
  item: ResolvedRipplableItem | null
  label: string
  listIndex: number
}

interface SlotRuntimeState {
  logicalIndex: number
  currentListIndex: number
  pendingListIndex: number
  swapRequestId: number
  isHidden: boolean
  opacity: number
  shadeOpacity: number
}

const CARD_WIDTH = 320
const CARD_HEIGHT = 384
const SELECTION_TRANSITION_MS = 420
const SELECTION_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const AUTOPLAY_RESUME_MS = 650

const props = withDefaults(defineProps<{
  /**
   * Source data for the card lane.
   * Each item can be a string URL or an object with `src`/`alt` metadata.
   *
   * 可设置值:
   * - `string[]`: image URL list
   * - `{ src: string, alt?: string, id?: string | number }[]`
   *
   * 卡片流的数据源。
   * 每一项可以是图片地址字符串，也可以是包含 `src` / `alt` 等元数据的对象。
   *
   * 可设置值:
   * - `string[]`: 图片地址列表
   * - `{ src: string, alt?: string, id?: string | number }[]`
   *
   * @example
   * ```vue
   * <Ripplable :list="['/images/1.png', '/images/2.png']" />
   * ```
   */
  list: RipplableListItem[]

  /**
   * Whether to show the FPS monitor overlay.
   * 可设置值: `true | false`
   *
   * 是否显示 FPS 监控覆盖层。
   * 可设置值: `true | false`
   *
   * @example
   * ```vue
   * <Ripplable :fps="true" />
   * ```
   */
  fps?: boolean

  /**
   * Controls autoplay.
   * 可设置值: `true | false | number`
   * - `true`: enable autoplay
   * - `false`: disable autoplay
   * - `number`: enable autoplay with a speed value; negative values play in reverse
   *
   * 控制是否自动播放。
   * 可设置值: `true | false | number`
   * - `true`: 开启自动播放
   * - `false`: 关闭自动播放
   * - `number`: 开启自动播放并指定速度；负数表示反向播放
   *
   * @example
   * ```vue
   * <Ripplable :autoplay="true" />
   * <Ripplable :autoplay="6" />
   * <Ripplable :autoplay="-6" />
   * ```
   */
  autoplay?: RipplableAutoplay

  /**
   * Partial motion config overrides for the lane.
   * 可设置值: `Partial<RipplableConfig>`
   * Example keys include `wheelInputScale`, `touchInputScale`, `spacingX`, `waveFrequency`, etc.
   *
   * 对卡片流运动配置的部分覆盖。
   * 可设置值: `Partial<RipplableConfig>`
   * 常见字段包含 `wheelInputScale`、`touchInputScale`、`spacingX`、`waveFrequency` 等。
   *
   * @example
   * ```ts
   * const config = {
   *   wheelInputScale: 0.6,
   *   spacingX: 260,
   *   maxWaveAmplitude: 160,
   * }
   * ```
   */
  config?: Partial<RipplableConfig>

  /**
   * Number of visible card slots rendered in the scene.
   * 可设置值: `number` (recommended to keep it greater than `0`)
   *
   * 当前场景中同时渲染的卡片槽位数量。
   * 可设置值: `number`（通常建议大于 `0`）
   *
   * @example
   * ```vue
   * <Ripplable :visible-count="24" />
   * ```
   */
  visibleCount?: number

  /**
   * Perspective distance used by the 3D stage.
   * 可设置值: CSS perspective string such as `'2000px'`, `'1500px'`
   *
   * 3D 场景使用的透视距离。
   * 可设置值: CSS perspective 字符串，如 `'2000px'`、`'1500px'`
   *
   * @example
   * ```vue
   * <Ripplable perspective="2000px" />
   * ```
   */
  perspective?: string

  /**
   * Perspective origin for the 3D stage.
   * 可设置值: CSS position string such as `'10% 10%'`, `'50% 50%'`
   *
   * 3D 场景透视中心点的位置。
   * 可设置值: CSS position 字符串，如 `'10% 10%'`、`'50% 50%'`
   *
   * @example
   * ```vue
   * <Ripplable perspective-origin="10% 10%" />
   * ```
   */
  perspectiveOrigin?: string

  /**
   * Transform applied to the lane container for layout tuning.
   * 可设置值: CSS transform string such as `'translateY(100px)'`, `'translateY(0px)'`
   *
   * 应用于 lane 容器的变换，用于进行布局微调。
   * 可设置值: CSS transform 字符串，如 `'translateY(100px)'`、`'translateY(0px)'`
   *
   * @example
   * ```vue
   * <Ripplable lane-transform="translateY(120px)" />
   * ```
   */
  laneTransform?: string

  /**
   * Selects a card in place and pauses motion when it is activated.
   * 点击卡片时是否暂停运动并在原位置突出显示图片。
   */
  focusOnClick?: boolean

  /**
   * Reduces the brightness and saturation of inactive cards while one is selected.
   * Applies to both the default card and custom content rendered through the `card` slot.
   *
   * 选中卡片时是否降低其他卡片的亮度和饱和度。
   * 默认卡片和通过 `card` 插槽渲染的自定义卡片都会生效。
   */
  dimInactiveCards?: boolean
}>(), {
  fps: false,
  autoplay: false,
  config: () => ({}),
  visibleCount: 18,
  perspective: '2000px',
  perspectiveOrigin: '10% 10%',
  laneTransform: 'translateY(100px)',
  focusOnClick: true,
  dimInactiveCards: true,
})

defineSlots<{
  default?: () => unknown
  card?: (props: {
    item: RipplableListItem | null
    resolvedItem: ResolvedRipplableItem | null
    src: string
    alt: string
    label: string
    index: number
    slotIndex: number
  }) => unknown
}>()

const emit = defineEmits<{
  (event: 'update:config', value: RipplableConfig): void
  (event: 'config-change', value: RipplableConfig): void
  (event: 'update:fps', value: boolean): void
  (event: 'fps-change', value: boolean): void
  (event: 'update:autoplay', value: RipplableAutoplay): void
  (event: 'autoplay-change', value: RipplableAutoplay): void
  (event: 'image-click', value: RipplableImageEvent): void
  (event: 'selection-change', value: RipplableImageEvent | null): void
  (event: 'image-close', value: RipplableImageEvent): void
}>()

const rootRef = ref<HTMLDivElement | null>(null)
const fpsRef = ref<HTMLDivElement | null>(null)
const cardsRef = ref<Array<HTMLDivElement | null>>([])

const decodedImageCache = new Map<string, Promise<void>>()
const fpsStats = {
  lastSampleTime: 0,
  framesSinceSample: 0,
  frameTimeTotal: 0,
  droppedFramesSinceSample: 0,
}

const renderSlots = ref<RenderSlotState[]>([])
const slotStates = shallowRef<SlotRuntimeState[]>([])
const selection = shallowRef<RipplableImageEvent | null>(null)
const selectedSlotIndex = shallowRef<number | null>(null)
const isSelectionRestoring = shallowRef(false)
const motionConfig = reactive(createRipplableConfig(props.config))
const fpsEnabled = ref(props.fps)
const initialAutoplay = normalizeRipplableAutoplay(props.autoplay)
const autoplayEnabled = ref(initialAutoplay.enabled)
const autoplaySpeed = ref(initialAutoplay.speed)
const autoplay = computed<RipplableAutoplay>(() => (autoplayEnabled.value ? autoplaySpeed.value : false))

let scrollTarget = 0
let scrollCurrent = 0
let inputVelocity = 0
let velocity = 0
let waveAmplitude = 0
let rafId = 0
let timeRef = 0
let sceneVersion = 0
let imageWarmupId = 0
let selectionFrameId = 0
let selectionCloseTimer = 0
let selectedCardElement: HTMLDivElement | null = null
let selectedCardBaseTransform = ''
let isSelectionClosing = false
let autoplayResumeStartTime = 0
let autoplayResumeWaveAmplitude = 0

const center = computed(() => Math.floor(props.visibleCount / 2))
const normalizedList = computed(() => props.list.map((item, index) => normalizeRipplableItem(item, index)))

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function buildConfigSnapshot(): RipplableConfig {
  return { ...motionConfig }
}

function emitConfigChange() {
  const nextConfig = buildConfigSnapshot()
  emit('update:config', nextConfig)
  emit('config-change', nextConfig)
}

function replaceConfig(nextConfig: Partial<RipplableConfig> = {}, shouldEmit = true) {
  Object.assign(motionConfig, createRipplableConfig(nextConfig))

  if (shouldEmit)
    emitConfigChange()
}

function emitAutoplayChange() {
  emit('update:autoplay', autoplay.value)
  emit('autoplay-change', autoplay.value)
}

function setAutoplay(nextValue: RipplableAutoplay, shouldEmit = true) {
  if (typeof nextValue === 'number') {
    autoplaySpeed.value = clampRipplableAutoplaySpeed(nextValue)
    autoplayEnabled.value = true
  }
  else {
    autoplayEnabled.value = nextValue
  }

  if (shouldEmit)
    emitAutoplayChange()
}

function setFps(nextValue: boolean, shouldEmit = true) {
  if (fpsEnabled.value === nextValue)
    return

  fpsEnabled.value = nextValue
  if (nextValue)
    resetFpsOverlay()

  if (shouldEmit) {
    emit('update:fps', nextValue)
    emit('fps-change', nextValue)
  }
}

function ensureImageDecoded(src: string) {
  const cached = decodedImageCache.get(src)
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

    if (typeof image.decode === 'function')
      void image.decode().then(finish).catch(finish)
  })

  decodedImageCache.set(src, promise)
  return promise
}

function scheduleImageWarmup(items: ResolvedRipplableItem[]) {
  cancelImageWarmup()

  const queue = [...new Map(items.map(item => [item.src, item])).values()]
  let index = 0

  const scheduleNext = () => {
    if (index >= queue.length)
      return

    if ('requestIdleCallback' in window) {
      imageWarmupId = window.requestIdleCallback(() => runNext(), { timeout: 500 })
    }
    else {
      imageWarmupId = globalThis.setTimeout(runNext, 32)
    }
  }

  const runNext = () => {
    const item = queue[index++]
    if (!item)
      return

    void ensureImageDecoded(item.src).finally(scheduleNext)
  }

  scheduleNext()
}

function cancelImageWarmup() {
  if (!imageWarmupId)
    return

  if ('cancelIdleCallback' in window)
    window.cancelIdleCallback(imageWarmupId)
  else
    globalThis.clearTimeout(imageWarmupId)

  imageWarmupId = 0
}

function syncRenderSlots(items = normalizedList.value) {
  sceneVersion += 1

  if (!items.length || props.visibleCount < 1) {
    renderSlots.value = []
    slotStates.value = []
    cardsRef.value = []
    return
  }

  const scrollPos = scrollCurrent / motionConfig.spacingX
  const baseIndex = Math.floor(scrollPos)
  const nextRenderSlots: RenderSlotState[] = []
  const nextSlotStates: SlotRuntimeState[] = []

  for (let slotIndex = 0; slotIndex < props.visibleCount; slotIndex++) {
    const logicalIndex = baseIndex + slotIndex - center.value
    const listIndex = mod(logicalIndex, items.length)
    const item = items[listIndex]

    nextRenderSlots.push({
      slotIndex,
      slotId: `ripplable-slot-${slotIndex - center.value}`,
      item,
      label: formatRipplableLabel(listIndex),
      listIndex,
    })

    nextSlotStates.push({
      logicalIndex,
      currentListIndex: listIndex,
      pendingListIndex: -1,
      swapRequestId: 0,
      isHidden: false,
      opacity: -1,
      shadeOpacity: -1,
    })
  }

  renderSlots.value = nextRenderSlots
  slotStates.value = nextSlotStates
  cardsRef.value = Array.from({ length: nextRenderSlots.length }, (_, index) => cardsRef.value[index] ?? null)
}

function setCardRef(index: number, element: Element | ComponentPublicInstance | null) {
  cardsRef.value[index] = element as HTMLDivElement | null
}

function getCardSlotProps(slot: RenderSlotState) {
  return {
    item: slot.item?.raw ?? null,
    resolvedItem: slot.item,
    src: slot.item?.src ?? '',
    alt: slot.item?.alt ?? '',
    label: slot.label,
    index: slot.listIndex,
    slotIndex: slot.slotIndex,
  }
}

function registerScrollInput(delta: number, inputType: 'wheel' | 'touch') {
  const inputScale = inputType === 'touch' ? motionConfig.touchInputScale : motionConfig.wheelInputScale

  if (selection.value)
    return

  scrollTarget += delta * inputScale
  inputVelocity = inputVelocity * 0.45 + delta * motionConfig.inputVelocityGain
}

function createImageEvent(slot: RenderSlotState): RipplableImageEvent | null {
  if (!slot.item)
    return null

  return {
    item: slot.item.raw,
    resolvedItem: slot.item,
    index: slot.listIndex,
    src: slot.item.src,
    alt: slot.item.alt,
  }
}

function getSelectionTransitionDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : SELECTION_TRANSITION_MS
}

function getSelectedCardTransform(baseTransform: string) {
  const position = baseTransform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
  if (!position)
    return baseTransform

  return `translate3d(${position[1]}, ${position[2]}, ${position[3]}) rotateY(0deg) rotateX(0deg) scale(1.04)`
}

function getAutoplayResumeState(time: number) {
  if (!autoplayResumeStartTime)
    return { progress: 1, scale: 1 }

  const progress = Math.min(1, Math.max(0, (time - autoplayResumeStartTime) / AUTOPLAY_RESUME_MS))
  if (progress >= 1) {
    autoplayResumeStartTime = 0
    return { progress: 1, scale: 1 }
  }

  return {
    progress,
    scale: progress * progress * (3 - 2 * progress),
  }
}

function cancelSelectionTransition() {
  if (selectionFrameId) {
    cancelAnimationFrame(selectionFrameId)
    selectionFrameId = 0
  }

  if (selectionCloseTimer) {
    window.clearTimeout(selectionCloseTimer)
    selectionCloseTimer = 0
  }

  isSelectionClosing = false
}

function restoreSelectedCard() {
  const card = selectedCardElement
  if (!card)
    return

  card.style.transform = selectedCardBaseTransform
}

function animateCardToFront(slot: RenderSlotState) {
  const card = cardsRef.value[slot.slotIndex]
  if (!card)
    return

  selectedCardElement = card
  selectedCardBaseTransform = card.style.transform

  const duration = getSelectionTransitionDuration()
  card.style.transition = duration
    ? `transform ${duration}ms ${SELECTION_TRANSITION_EASING}`
    : 'none'

  if (!duration) {
    card.style.transform = getSelectedCardTransform(selectedCardBaseTransform)
    return
  }

  selectionFrameId = requestAnimationFrame(() => {
    selectionFrameId = 0
    if (selectedCardElement === card)
      card.style.transform = getSelectedCardTransform(selectedCardBaseTransform)
  })
}

function finishClosingSelection(previousSelection: RipplableImageEvent, card: HTMLDivElement | null) {
  if (card)
    card.style.transition = ''

  selectedCardElement = null
  selectedCardBaseTransform = ''
  selectedSlotIndex.value = null
  selection.value = null
  isSelectionRestoring.value = false
  isSelectionClosing = false
  selectionCloseTimer = 0
  autoplayResumeStartTime = autoplayEnabled.value ? performance.now() : 0
  emit('selection-change', null)
  emit('image-close', previousSelection)
}

function selectImage(slot: RenderSlotState) {
  if (!props.focusOnClick)
    return

  if (selectedSlotIndex.value === slot.slotIndex) {
    closeSelection()
    return
  }

  const nextSelection = createImageEvent(slot)
  if (!nextSelection)
    return

  cancelSelectionTransition()
  isSelectionRestoring.value = false

  const previousCard = selectedCardElement
  if (previousCard) {
    restoreSelectedCard()
    const duration = getSelectionTransitionDuration()
    window.setTimeout(() => {
      if (previousCard !== selectedCardElement)
        previousCard.style.transition = ''
    }, duration)
  }

  scrollTarget = scrollCurrent
  inputVelocity = 0
  velocity = 0
  autoplayResumeWaveAmplitude = waveAmplitude
  autoplayResumeStartTime = 0
  selectedSlotIndex.value = slot.slotIndex
  selection.value = nextSelection
  animateCardToFront(slot)
  emit('image-click', nextSelection)
  emit('selection-change', nextSelection)
}

function closeSelection() {
  const previousSelection = selection.value
  if (!previousSelection || isSelectionClosing)
    return

  cancelSelectionTransition()
  isSelectionClosing = true
  isSelectionRestoring.value = true

  const card = selectedCardElement
  const duration = getSelectionTransitionDuration()
  restoreSelectedCard()

  if (!duration) {
    finishClosingSelection(previousSelection, card)
    return
  }

  selectionCloseTimer = window.setTimeout(() => {
    if (selection.value === previousSelection)
      finishClosingSelection(previousSelection, card)
  }, duration)
}

let pointerStart: { x: number, y: number, slotIndex: number } | null = null

function handleCardPointerDown(event: PointerEvent, slot: RenderSlotState) {
  if (!props.focusOnClick || isInteractiveTarget(event.target))
    return

  pointerStart = { x: event.clientX, y: event.clientY, slotIndex: slot.slotIndex }
}

function handleCardPointerUp(event: PointerEvent, slot: RenderSlotState) {
  if (!pointerStart || pointerStart.slotIndex !== slot.slotIndex)
    return

  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
  pointerStart = null

  if (distance <= 8 && !isInteractiveTarget(event.target))
    selectImage(slot)
}

function handleCardKeydown(event: KeyboardEvent, slot: RenderSlotState) {
  if (event.key === 'Escape' && selection.value) {
    event.preventDefault()
    closeSelection()
    return
  }

  if (!props.focusOnClick || (event.key !== 'Enter' && event.key !== ' '))
    return

  event.preventDefault()
  selectImage(slot)
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('[data-ripplable-interactive]'))
}

function resetFpsOverlay() {
  if (fpsRef.value) {
    fpsRef.value.textContent = 'FPS --\nFRAME -- ms\nDROP --'
    fpsRef.value.style.color = '#ffffff'
  }
}

watch(() => props.config, nextConfig => replaceConfig(nextConfig ?? {}, false), { deep: true })
watch(() => props.fps, nextValue => setFps(nextValue, false))
watch(() => props.autoplay, nextValue => setAutoplay(nextValue, false))
watch(normalizedList, (items) => {
  syncRenderSlots(items)
  if (typeof window !== 'undefined')
    scheduleImageWarmup(items)
}, { deep: true, immediate: true })
watch(() => props.visibleCount, () => syncRenderSlots())
watch(fpsEnabled, (nextValue) => {
  if (nextValue)
    resetFpsOverlay()
})

let handleWheel: ((event: WheelEvent) => void) | null = null
let handleTouchStart: ((event: TouchEvent) => void) | null = null
let handleTouchMove: ((event: TouchEvent) => void) | null = null
let handleKeydown: ((event: KeyboardEvent) => void) | null = null
let eventSurface: HTMLDivElement | null = null

onMounted(() => {
  eventSurface = rootRef.value
  if (!eventSurface)
    return

  resetFpsOverlay()

  handleWheel = (event: WheelEvent) => {
    if (isInteractiveTarget(event.target))
      return

    event.preventDefault()
    registerScrollInput(event.deltaY, 'wheel')
  }

  let touchY = 0

  handleTouchStart = (event: TouchEvent) => {
    if (isInteractiveTarget(event.target))
      return

    touchY = event.touches[0].clientY
  }

  handleTouchMove = (event: TouchEvent) => {
    if (isInteractiveTarget(event.target))
      return

    event.preventDefault()
    const dy = touchY - event.touches[0].clientY
    touchY = event.touches[0].clientY
    registerScrollInput(dy, 'touch')
  }

  handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && selection.value)
      closeSelection()
  }

  const animate = (time: number) => {
    const frameDelta = timeRef ? time - timeRef : 16.667
    const dt = frameDelta / 16.667
    timeRef = time

    const resumeState = autoplayEnabled.value && !selection.value
      ? getAutoplayResumeState(time)
      : { progress: 1, scale: 1 }

    if (autoplayEnabled.value && !selection.value)
      scrollTarget += autoplaySpeed.value * resumeState.scale * Math.min(dt, 3)

    inputVelocity *= motionConfig.inputVelocityDecay ** dt

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

      if (fpsEnabled.value && fpsRef.value) {
        fpsRef.value.textContent = `FPS ${fps.toFixed(0)}\nFRAME ${avgFrame.toFixed(1)} ms\nDROP ${fpsStats.droppedFramesSinceSample}`
        fpsRef.value.style.color = fpsColor
      }

      fpsStats.lastSampleTime = time
      fpsStats.framesSinceSample = 0
      fpsStats.frameTimeTotal = 0
      fpsStats.droppedFramesSinceSample = 0
    }

    if (selection.value) {
      rafId = requestAnimationFrame(animate)
      return
    }

    const previousScroll = scrollCurrent
    const followStrength = Math.min(
      motionConfig.maxScrollFollow,
      motionConfig.baseScrollFollow + Math.abs(inputVelocity) * motionConfig.followVelocityInfluence,
    )
    scrollCurrent += (scrollTarget - scrollCurrent) * followStrength * Math.min(dt, 3)
    velocity = (scrollCurrent - previousScroll) / Math.max(dt, 0.5)

    const speed = Math.abs(velocity)
    const velocityWave = Math.min(motionConfig.maxWaveAmplitude, speed * motionConfig.waveScrollGain)
    const targetWave = resumeState.progress < 1
      ? autoplayResumeWaveAmplitude + (velocityWave - autoplayResumeWaveAmplitude) * resumeState.progress
      : velocityWave
    const waveResponse = Math.min(
      motionConfig.maxWaveResponse,
      motionConfig.waveResponseBase + speed * motionConfig.waveResponseGain,
    )
    waveAmplitude += (targetWave - waveAmplitude) * waveResponse

    const items = normalizedList.value
    const activeSlots = renderSlots.value
    const runtimeSlots = slotStates.value

    if (items.length && activeSlots.length) {
      const scrollPos = scrollCurrent / motionConfig.spacingX
      const wave = waveAmplitude
      const recycleBoundary = center.value
      const scrollDirection = Math.sign(scrollCurrent - previousScroll)

      for (let i = 0; i < activeSlots.length; i++) {
        const card = cardsRef.value[i]
        const renderSlot = activeSlots[i]
        const slotState = runtimeSlots[i]
        if (!card || !renderSlot || !slotState)
          continue

        let { logicalIndex } = slotState
        let pos = logicalIndex - scrollPos

        if (scrollDirection > 0) {
          while (pos < -recycleBoundary) {
            logicalIndex += activeSlots.length
            pos = logicalIndex - scrollPos
          }
        }
        else if (scrollDirection < 0) {
          while (pos > recycleBoundary) {
            logicalIndex -= activeSlots.length
            pos = logicalIndex - scrollPos
          }
        }

        slotState.logicalIndex = logicalIndex
        const x = pos * motionConfig.spacingX
        const y = pos * motionConfig.spacingY
        const z = pos * motionConfig.spacingZ
        const centeredX = x - CARD_WIDTH / 2
        const centeredY = y - CARD_HEIGHT / 2
        const waveShape = Math.sin(pos * motionConfig.waveFrequency)
        const waveOffset = waveShape * wave
        const tiltX = waveShape * Math.min(motionConfig.maxWaveTiltX, wave * motionConfig.waveTiltXGain)
        const dist = Math.abs(pos)
        const isHidden = dist > center.value - 1
        const opacity = isHidden ? 0 : 1
        const shadeOpacity = Math.min(0.86, dist * 0.085)

        card.style.transform = `translate3d(${centeredX}px, ${centeredY + waveOffset}px, ${z}px) rotateY(-50deg) rotateX(${tiltX}deg)`

        if (slotState.opacity !== opacity) {
          card.style.opacity = String(opacity)
          slotState.opacity = opacity
        }

        if (slotState.isHidden !== isHidden) {
          card.style.visibility = isHidden ? 'hidden' : 'visible'
          slotState.isHidden = isHidden
        }

        if (Math.abs(slotState.shadeOpacity - shadeOpacity) > 0.015) {
          card.style.setProperty('--ripplable-shade-opacity', shadeOpacity.toFixed(3))
          slotState.shadeOpacity = shadeOpacity
        }

        const nextListIndex = mod(logicalIndex, items.length)
        const nextItem = items[nextListIndex]
        const nextLabel = formatRipplableLabel(nextListIndex)

        if (slotState.currentListIndex === nextListIndex) {
          if (slotState.pendingListIndex !== -1) {
            slotState.pendingListIndex = -1
            slotState.swapRequestId += 1
          }

          if (renderSlot.listIndex !== nextListIndex || renderSlot.item?.key !== nextItem.key) {
            renderSlot.item = nextItem
            renderSlot.listIndex = nextListIndex
          }

          if (renderSlot.label !== nextLabel)
            renderSlot.label = nextLabel

          continue
        }

        if (slotState.pendingListIndex === nextListIndex)
          continue

        const requestId = slotState.swapRequestId + 1
        const currentSceneVersion = sceneVersion

        slotState.pendingListIndex = nextListIndex
        slotState.swapRequestId = requestId

        void ensureImageDecoded(nextItem.src).then(() => {
          const currentRenderSlot = renderSlots.value[i]
          const currentSlotState = slotStates.value[i]
          if (!currentRenderSlot || !currentSlotState)
            return
          if (sceneVersion !== currentSceneVersion)
            return
          if (currentSlotState.swapRequestId !== requestId)
            return
          if (currentSlotState.pendingListIndex !== nextListIndex)
            return

          currentRenderSlot.item = nextItem
          currentRenderSlot.listIndex = nextListIndex
          currentRenderSlot.label = nextLabel
          currentSlotState.currentListIndex = nextListIndex
          currentSlotState.pendingListIndex = -1
        })
      }
    }

    rafId = requestAnimationFrame(animate)
  }

  eventSurface.addEventListener('wheel', handleWheel, { passive: false })
  eventSurface.addEventListener('touchstart', handleTouchStart, { passive: true })
  eventSurface.addEventListener('touchmove', handleTouchMove, { passive: false })
  window.addEventListener('keydown', handleKeydown)
  rafId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (eventSurface && handleWheel)
    eventSurface.removeEventListener('wheel', handleWheel)
  if (eventSurface && handleTouchStart)
    eventSurface.removeEventListener('touchstart', handleTouchStart)
  if (eventSurface && handleTouchMove)
    eventSurface.removeEventListener('touchmove', handleTouchMove)
  if (handleKeydown)
    window.removeEventListener('keydown', handleKeydown)

  cancelImageWarmup()
  cancelSelectionTransition()
  restoreSelectedCard()
  if (selectedCardElement)
    selectedCardElement.style.transition = ''
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    ref="rootRef"
    class="ripplable"
    :class="{
      'ripplable--selected': selection && !isSelectionRestoring,
      'ripplable--dim-inactive-cards': dimInactiveCards,
    }"
  >
    <div v-show="fpsEnabled" ref="fpsRef" class="ripplable__fps">
      FPS --
      {{ '\n' }}
      FRAME -- ms
      {{ '\n' }}
      DROP --
    </div>

    <div class="ripplable__overlay-layer">
      <slot />
    </div>

    <div class="ripplable__scene-root">
      <div class="ripplable__scene-stage" :style="{ perspective, perspectiveOrigin }">
        <div class="ripplable__scene-lane" :style="{ transform: laneTransform }">
          <div
            v-for="slot in renderSlots"
            :key="slot.slotId"
            :ref="element => setCardRef(slot.slotIndex, element)"
            class="ripplable__card"
            :class="{
              'ripplable__card--interactive': focusOnClick,
              'ripplable__card--selected': selectedSlotIndex === slot.slotIndex,
              'ripplable__card--restoring': isSelectionRestoring && selectedSlotIndex === slot.slotIndex,
            }"
            :role="focusOnClick ? 'button' : undefined"
            :tabindex="focusOnClick ? 0 : undefined"
            :aria-label="focusOnClick ? (slot.item?.alt || `Open image ${slot.listIndex + 1}`) : undefined"
            @pointerdown="handleCardPointerDown($event, slot)"
            @pointerup="handleCardPointerUp($event, slot)"
            @pointercancel="pointerStart = null"
            @keydown="handleCardKeydown($event, slot)"
          >
            <div v-if="$slots.card" class="ripplable__card-slot">
              <slot name="card" v-bind="getCardSlotProps(slot)" />
            </div>

            <template v-else>
              <div class="ripplable__card-media">
                <img
                  v-if="slot.item"
                  :alt="slot.item.alt"
                  :src="slot.item.src"
                  class="ripplable__card-image"
                  decoding="async"
                  draggable="false"
                  loading="eager"
                >
                <div class="ripplable__card-shade" />
              </div>

              <span class="ripplable__card-label">
                {{ slot.label }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
