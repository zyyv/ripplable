# Ripplable

An infinite, flowing 3D card lane component for Vue 3. It uses `requestAnimationFrame` to drive animations and supports wheel input, touch dragging, autoplay, custom cards, and runtime motion configuration overrides.

## Features

- Reuses a fixed number of card slots for infinite looping, preventing the DOM from growing as you scroll
- Supports mouse wheel and touch drag input
- Supports forward and reverse autoplay, with speed limited to `0.5`–`24`
- Dynamically calculates follow strength, wave amplitude, and card tilt based on scroll velocity
- Decodes images before switching to reduce flicker during fast scrolling
- Accepts image URL strings or custom object data
- Provides a `card` slot for fully custom card content
- Offers an optional overlay with FPS, average frame time, and dropped-frame estimates
- Includes complete TypeScript type exports

## Installation

```bash
pnpm add ripplable
# npm install ripplable
# yarn add ripplable
```

## Quick Start

```vue
<script setup lang="ts">
import { Ripplable, type RipplableListItem } from 'ripplable'
import 'ripplable/styles.css'

const images: RipplableListItem[] = [
  { id: 'aurora', src: '/images/aurora.jpg', alt: 'Aurora' },
  { id: 'terrain', src: '/images/terrain.jpg', alt: 'Terrain' },
  { id: 'mono', src: '/images/mono.jpg', alt: 'Mono' },
]
</script>

<template>
  <div class="gallery">
    <Ripplable :list="images" :autoplay="6" />
  </div>
</template>

<style scoped>
.gallery {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
```

`Ripplable` fills its parent container, so the parent must have a computable width and height.

## Custom Cards

Object data is exposed unchanged through the slot's `item` property, so you can attach any application-specific fields:

```vue
<script setup lang="ts">
import { Ripplable } from 'ripplable'
import 'ripplable/styles.css'

const projects = [
  { id: 1, src: '/images/one.jpg', alt: 'Project One', title: 'Project One' },
  { id: 2, src: '/images/two.jpg', alt: 'Project Two', title: 'Project Two' },
]
</script>

<template>
  <Ripplable :list="projects" :autoplay="-4" :visible-count="24">
    <template #card="{ item, src, alt, label }">
      <article class="project-card">
        <img :src="src" :alt="alt">
        <span>{{ label }}</span>
        <strong>{{ typeof item === 'string' ? label : item?.title }}</strong>
      </article>
    </template>
  </Ripplable>
</template>
```

When you use the custom `card` slot, the component no longer adds its default card container, shadow, or label. The consumer is responsible for sizing, image cropping, and visual styling.

## API

### `list`

```ts
export type RipplableListItem
  = | string
    | {
      id?: string | number
      src: string
      alt?: string
      [key: string]: unknown
    }
```

Strings are used directly as image URLs. Objects remain available as `item` in the slot and are normalized to:

```ts
export interface ResolvedRipplableItem<T = RipplableListItem> {
  id: string
  key: string
  src: string
  alt: string
  listIndex: number
  raw: T
}
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `RipplableListItem[]` | — | Required. Card data source; an empty array renders an empty scene. |
| `fps` | `boolean` | `false` | Displays FPS, average frame time, and estimated dropped frames. |
| `autoplay` | `boolean \| number` | `false` | `true` uses the default speed of `6`; a number sets the speed; negative values play in reverse; `0` remains enabled without advancing. |
| `config` | `Partial<RipplableConfig>` | `{}` | Overrides the default motion and spatial parameters. |
| `visibleCount` | `number` | `36` | Number of card slots reused at once. Values below `1` render no cards. |
| `perspective` | `string` | `'2000px'` | CSS `perspective` for the 3D scene. |
| `perspectiveOrigin` | `string` | `'10% 10%'` | CSS `perspective-origin` for the 3D scene. |
| `laneTransform` | `string` | `'translateY(100px)'` | CSS transform applied to the card lane container. |

### Autoplay Rules

- `true`: plays at the default speed of `6`
- `false`: stops autoplay
- Positive number: plays forward
- Negative number: plays in reverse
- The absolute value of a non-zero speed is clamped to `0.5`–`24`
- Non-finite numbers fall back to the default speed of `6`

### Slots

#### Default Slot

Rendered above the card scene, making it suitable for titles, buttons, and other overlays. The overlay uses `pointer-events: none` by default; interactive elements must restore pointer events explicitly:

```css
.controls {
  pointer-events: auto;
}
```

To prevent wheel or touch interactions on buttons, inputs, or other controls from driving the card lane, add `data-ripplable-interactive` to the element or one of its ancestors:

```vue
<button class="controls" data-ripplable-interactive>
  Pause
</button>
```

#### `card` Slot

| Property | Type | Description |
| --- | --- | --- |
| `item` | `RipplableListItem \| null` | Original data item. |
| `resolvedItem` | `ResolvedRipplableItem \| null` | Normalized data item. |
| `src` | `string` | Image URL. |
| `alt` | `string` | Image alternative text. |
| `label` | `string` | Current data index, zero-padded from `00`. |
| `index` | `number` | Current data item index. |
| `slotIndex` | `number` | Current reused slot index. |

### Events

When its internal state changes actively, the component emits both Vue `update:*` events and their corresponding semantic events:

| Event | Payload |
| --- | --- |
| `update:config` / `config-change` | `RipplableConfig` |
| `update:fps` / `fps-change` | `boolean` |
| `update:autoplay` / `autoplay-change` | `boolean \| number` |

The current public interface does not include built-in controls, so these events are primarily reserved for custom control layers and future extensions. Updating a prop directly from the parent does not emit the event again.

## Motion Configuration

Create a configuration from `defaultRipplableConfig`, or pass only the fields you want to override:

```ts
import type { RipplableConfig } from 'ripplable'

import { defaultRipplableConfig } from 'ripplable'

const config: Partial<RipplableConfig> = {
  ...defaultRipplableConfig,
  wheelInputScale: 0.35,
  maxWaveAmplitude: 140,
  spacingX: 260,
}
```

| Field | Default | Description |
| --- | ---: | --- |
| `wheelInputScale` | `0.5` | Scales wheel input. |
| `touchInputScale` | `0.75` | Scales touch movement. |
| `baseScrollFollow` | `0.085` | Base interpolation strength toward the target position. |
| `maxScrollFollow` | `0.28` | Maximum follow strength. |
| `followVelocityInfluence` | `0.004` | Influence of input velocity on follow strength. |
| `inputVelocityGain` | `0.18` | Gain applied when converting input delta to velocity. |
| `inputVelocityDecay` | `0.82` | Per-frame input velocity decay. |
| `waveScrollGain` | `4.8` | Gain applied when converting scroll velocity to wave amplitude. |
| `maxWaveAmplitude` | `180` | Maximum wave displacement. |
| `waveFrequency` | `1.05` | Wave phase frequency between adjacent cards. |
| `waveResponseBase` | `0.06` | Base wave response. |
| `waveResponseGain` | `0.008` | Influence of velocity on wave response. |
| `maxWaveResponse` | `0.2` | Maximum wave response. |
| `waveTiltXGain` | `0.04` | Gain applied when converting wave amplitude to X-axis tilt. |
| `maxWaveTiltX` | `12` | Maximum X-axis tilt angle. |
| `spacingX` | `240` | X-axis spacing between adjacent cards and the scroll index step. |
| `spacingY` | `-84` | Y-axis offset between adjacent cards. |
| `spacingZ` | `-288` | Z-axis depth between adjacent cards. |

## Exports

```ts
import type {
  ResolvedRipplableItem,
  RipplableAutoplay,
  RipplableConfig,
  RipplableListItem,
} from 'ripplable'

import {
  clampRipplableAutoplaySpeed,
  createRipplableConfig,
  defaultRipplableAutoplaySpeed,
  defaultRipplableConfig,
  formatRipplableLabel,
  maxRipplableAutoplaySpeed,
  normalizeRipplableAutoplay,
  normalizeRipplableItem,
  Ripplable,
} from 'ripplable'
```

## License

[MIT](https://github.com/zyyv/ripplable/blob/main/packages/ui/LICENSE)
