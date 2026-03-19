import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface RipplableConfig {
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

export interface RipplableControlDefinition {
  key: keyof RipplableConfig
  label: string
  min: number
  max: number
  step: number
}

export interface RipplableControlSection {
  title: string
  description: string
  controls: RipplableControlDefinition[]
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

export interface RipplableContext {
  config: RipplableConfig
  fps: Ref<boolean>
  autoplay: Ref<RipplableAutoplay>
  autoplayEnabled: Ref<boolean>
  autoplaySpeed: Ref<number>
  defaultConfig: Readonly<RipplableConfig>
  defaultAutoplaySpeed: number
  updateConfig: (key: keyof RipplableConfig, value: number) => void
  replaceConfig: (value?: Partial<RipplableConfig>) => void
  resetConfig: () => void
  setFps: (value: boolean) => void
  setAutoplay: (value: RipplableAutoplay) => void
  setAutoplaySpeed: (value: number) => void
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

export const ripplableControlSections: RipplableControlSection[] = [
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

export const ripplableContextKey: InjectionKey<RipplableContext> = Symbol('ripplable-context')

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

export function formatRipplableControlValue(value: number, step: number) {
  if (Math.abs(value) >= 100 || step >= 1)
    return value.toFixed(0)
  if (step >= 0.1)
    return value.toFixed(1)
  if (step >= 0.01)
    return value.toFixed(2)
  return value.toFixed(3)
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

export function useRipplableContext() {
  const context = inject(ripplableContextKey, null)
  if (!context)
    throw new Error('Ripplable context is unavailable. Use this component inside <Ripplable>.')

  return context
}

function getRipplableAssetId(src: string) {
  return src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? src
}
