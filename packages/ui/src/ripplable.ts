export interface RipplableConfig {
  /**
   * Wheel input sensitivity. Higher values make the lane react more aggressively to mouse wheel scrolling.
   *
   * 滚轮输入灵敏度。值越大，滚轮滚动对卡片流的响应越强。
   */
  wheelInputScale: number

  /**
   * Touch input sensitivity. Higher values make touch dragging move the lane more strongly.
   *
   * 触摸输入灵敏度。值越大，触摸拖拽带动卡片流的幅度越大。
   */
  touchInputScale: number

  /**
   * Base follow strength. Sets the baseline amount of interpolation toward the target scroll position.
   *
   * 基础跟随强度。控制卡片流向目标滚动位置回拉时的基础插值强度。
   */
  baseScrollFollow: number

  /**
   * Maximum follow strength. Caps how quickly the lane can catch up to the target scroll.
   *
   * 最大跟随强度。限制卡片流对目标滚动位置的最大追赶速度。
   */
  maxScrollFollow: number

  /**
   * Velocity influence on follow strength. Faster input makes the follow behavior stronger.
   *
   * 速度对跟随强度的影响。输入速度越快，跟随行为越强。
   */
  followVelocityInfluence: number

  /**
   * Input velocity gain. Controls how strongly input movement boosts current motion velocity.
   *
   * 输入速度增益。控制输入运动对当前运动速度的放大程度。
   */
  inputVelocityGain: number

  /**
   * Input velocity decay. Decays the motion velocity over time to avoid runaway motion.
   *
   * 输入速度衰减。随着时间推移衰减当前输入速度，避免运动失控。
   */
  inputVelocityDecay: number

  /**
   * Wave gain response to scroll speed. Larger values make the wave motion more pronounced.
   *
   * 波浪随滚动速度放大的幅度。值越大，波浪运动越明显。
   */
  waveScrollGain: number

  /**
   * Maximum wave amplitude. Caps the vertical displacement created by the wave effect.
   *
   * 波浪最大振幅。限制波浪效果造成的最大上下偏移量。
   */
  maxWaveAmplitude: number

  /**
   * Wave frequency. Controls how quickly the wave oscillates along the lane.
   *
   * 波浪频率。控制波浪沿卡片流往复变化的快慢。
   */
  waveFrequency: number

  /**
   * Base wave response. The minimum speed-driven wave response used as a baseline.
   *
   * 波浪基准响应值。作为波浪响应的基础最低值。
   */
  waveResponseBase: number

  /**
   * Wave response gain. Increases the wave response as the speed rises.
   *
   * 波浪响应增益。随着速度增加，波浪响应会更快放大。
   */
  waveResponseGain: number

  /**
   * Maximum wave response. Caps the overall responsiveness of the wave effect.
   *
   * 波浪最大响应值。限制波浪效果的整体响应上限。
   */
  maxWaveResponse: number

  /**
   * Tilt gain for the wave effect on the X axis. Higher values create stronger card tilt.
   *
   * 波浪引起的 X 轴倾斜增益。值越大，卡片的倾斜越明显。
   */
  waveTiltXGain: number

  /**
   * Maximum tilt allowed by the wave effect on the X axis.
   *
   * 波浪导致的 X 轴最大倾斜角度。
   */
  maxWaveTiltX: number

  /**
   * Horizontal spacing between cards in the lane.
   *
   * 卡片沿 X 轴方向的间距。
   */
  spacingX: number

  /**
   * Vertical offset between cards in the lane.
   *
   * 卡片沿 Y 轴方向的偏移量。
   */
  spacingY: number

  /**
   * Depth spacing between cards in the lane, affecting their z-order and perspective layering.
   *
   * 卡片沿 Z 轴方向的层级深度间距，会影响透视下的前后层次。
   */
  spacingZ: number
}

export type RipplableAutoplay = boolean | number

export type RipplableListItem
  = | string
    | {
      id?: string | number
      src: string
      alt?: string
      [key: string]: unknown
    }

export interface ResolvedRipplableItem<T = RipplableListItem> {
  id: string
  key: string
  src: string
  alt: string
  listIndex: number
  raw: T
}

export interface RipplableImageEvent<T = RipplableListItem> {
  /** Original list item supplied by the consumer. */
  item: T
  /** Normalized item data used internally by Ripplable. */
  resolvedItem: ResolvedRipplableItem<T>
  /** Zero-based position in the source list. */
  index: number
  src: string
  alt: string
}

export const defaultRipplableConfig: RipplableConfig = {
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

export const defaultRipplableAutoplaySpeed = 6
export const maxRipplableAutoplaySpeed = 24

export function createRipplableConfig(config: Partial<RipplableConfig> = {}): RipplableConfig {
  return {
    ...defaultRipplableConfig,
    ...config,
  }
}

export function clampRipplableAutoplaySpeed(value: number) {
  if (!Number.isFinite(value))
    return defaultRipplableAutoplaySpeed

  if (value === 0)
    return 0

  const direction = value > 0 ? 1 : -1
  const magnitude = Math.min(maxRipplableAutoplaySpeed, Math.max(0.5, Math.abs(value)))

  return magnitude * direction
}

export function normalizeRipplableAutoplay(value: RipplableAutoplay | undefined) {
  if (typeof value === 'number') {
    return {
      enabled: true,
      speed: clampRipplableAutoplaySpeed(value),
    }
  }

  return {
    enabled: value === true,
    speed: defaultRipplableAutoplaySpeed,
  }
}

export function formatRipplableLabel(index: number) {
  return String(index).padStart(2, '0')
}

export function normalizeRipplableItem<T extends RipplableListItem>(item: T, index: number): ResolvedRipplableItem<T> {
  if (typeof item === 'string') {
    const id = getRipplableAssetId(item)

    return {
      id,
      key: `${id}-${index}`,
      src: item,
      alt: '',
      listIndex: index,
      raw: item,
    }
  }

  const id = item.id ? String(item.id) : getRipplableAssetId(item.src)

  return {
    id,
    key: `${id}-${index}`,
    src: item.src,
    alt: item.alt ?? '',
    listIndex: index,
    raw: item,
  }
}

function getRipplableAssetId(src: string) {
  return src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? src
}
