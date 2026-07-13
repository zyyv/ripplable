# Ripplable

一个面向 Vue 3 的无限循环 3D 卡片流组件。它使用 `requestAnimationFrame` 驱动动画，支持滚轮、触摸拖拽、自动播放、自定义卡片和运行时运动参数覆盖。

[English](./README.md) · [npm](https://www.npmjs.com/package/ripplable)

## 特性

- 无限循环复用固定数量的卡片槽位，不会随着滚动持续增加 DOM
- 支持鼠标滚轮与触摸拖拽
- 支持正向、反向自动播放，速度限制在 `0.5`～`24`
- 根据滚动速度动态计算跟随强度、波浪振幅与卡片倾斜
- 图片切换前预解码，减少快速滚动时的闪烁
- 支持字符串图片地址或自定义对象数据
- 支持 `card` 插槽完全自定义卡片内容
- 可选 FPS、平均帧耗时和丢帧统计覆盖层
- 完整 TypeScript 类型导出

## 安装

```bash
pnpm add ripplable
# npm install ripplable
# yarn add ripplable
```

## 快速开始

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

`Ripplable` 会填满父容器，因此父容器必须具有可计算的宽度和高度。

## 自定义卡片

对象数据会原样通过 `item` 暴露给插槽，因此可以附加任意业务字段：

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

使用自定义 `card` 插槽时，组件不会再添加默认卡片容器、阴影和标签；尺寸、图片裁切及视觉样式由使用方负责。

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

字符串会被直接用作图片地址。对象会保留为插槽中的 `item`，并被规范化为：

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

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | `RipplableListItem[]` | — | 必填。卡片数据源；空数组会渲染空场景。 |
| `fps` | `boolean` | `false` | 显示 FPS、平均帧耗时和估算丢帧数。 |
| `autoplay` | `boolean \| number` | `false` | `true` 使用默认速度 `6`；数字指定速度；负数反向播放；`0` 保持启用但不推进。 |
| `config` | `Partial<RipplableConfig>` | `{}` | 覆盖默认运动与空间参数。 |
| `visibleCount` | `number` | `36` | 同时复用的卡片槽位数量。小于 `1` 时不渲染卡片。 |
| `perspective` | `string` | `'2000px'` | 3D 场景的 CSS `perspective`。 |
| `perspectiveOrigin` | `string` | `'10% 10%'` | 3D 场景的 CSS `perspective-origin`。 |
| `laneTransform` | `string` | `'translateY(100px)'` | 应用于卡片通道容器的 CSS transform。 |

### Autoplay 规则

- `true`：以默认速度 `6` 播放
- `false`：停止自动播放
- 正数：正向播放
- 负数：反向播放
- 非零数值的绝对值会被限制在 `0.5`～`24`
- 非有限数值会回退到默认速度 `6`

### Slots

#### 默认插槽

渲染在卡片场景上方，适合标题、按钮和其他覆盖层。覆盖层默认设置 `pointer-events: none`；交互元素需要自行恢复：

```css
.controls {
  pointer-events: auto;
}
```

为避免按钮、输入框等元素的滚轮或触摸操作驱动卡片流，请给元素或其祖先添加 `data-ripplable-interactive`：

```vue
<button class="controls" data-ripplable-interactive>
  Pause
</button>
```

#### `card` 插槽

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `item` | `RipplableListItem \| null` | 原始数据项。 |
| `resolvedItem` | `ResolvedRipplableItem \| null` | 规范化后的数据项。 |
| `src` | `string` | 图片地址。 |
| `alt` | `string` | 图片替代文本。 |
| `label` | `string` | 从 `00` 开始补零的当前数据索引。 |
| `index` | `number` | 当前数据项索引。 |
| `slotIndex` | `number` | 当前复用槽位索引。 |

### Events

组件在内部状态发生主动变更时同时发送 Vue `update:*` 事件和对应的语义事件：

| Event | Payload |
| --- | --- |
| `update:config` / `config-change` | `RipplableConfig` |
| `update:fps` / `fps-change` | `boolean` |
| `update:autoplay` / `autoplay-change` | `boolean \| number` |

当前公开界面没有内置控制器，因此这些事件主要为自定义控制层和后续扩展保留。父级直接更新 Prop 时不会重复发送事件。

## 运动参数

可从 `defaultRipplableConfig` 创建配置，也可以只传入需要覆盖的字段：

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

| 字段 | 默认值 | 作用 |
| --- | ---: | --- |
| `wheelInputScale` | `0.5` | 滚轮输入缩放。 |
| `touchInputScale` | `0.75` | 触摸位移缩放。 |
| `baseScrollFollow` | `0.085` | 向目标位置插值的基础强度。 |
| `maxScrollFollow` | `0.28` | 跟随强度上限。 |
| `followVelocityInfluence` | `0.004` | 输入速度对跟随强度的影响。 |
| `inputVelocityGain` | `0.18` | 输入增量转为速度的增益。 |
| `inputVelocityDecay` | `0.82` | 每帧输入速度衰减。 |
| `waveScrollGain` | `4.8` | 滚动速度转为波浪振幅的增益。 |
| `maxWaveAmplitude` | `180` | 波浪位移上限。 |
| `waveFrequency` | `1.05` | 相邻卡片间波浪相位频率。 |
| `waveResponseBase` | `0.06` | 波浪响应基础值。 |
| `waveResponseGain` | `0.008` | 速度对波浪响应的增益。 |
| `maxWaveResponse` | `0.2` | 波浪响应上限。 |
| `waveTiltXGain` | `0.04` | 波浪振幅转为 X 轴倾斜的增益。 |
| `maxWaveTiltX` | `12` | X 轴倾斜角度上限。 |
| `spacingX` | `240` | 相邻卡片的 X 轴间距，也是滚动索引步长。 |
| `spacingY` | `-84` | 相邻卡片的 Y 轴偏移。 |
| `spacingZ` | `-288` | 相邻卡片的 Z 轴深度。 |

## 导出内容

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
