# Ripplable

> 双语说明：中文版在前，英文版在后。

## 中文说明

`Ripplable` 是一个基于 Vue 3 的可滚动卡片流组件，适合展示一组图片、视觉素材或产品卡片，并通过滚轮、触摸拖拽以及自动播放的方式，让卡片沿着三维空间的“lane”缓慢流动。组件内部会对输入速度、跟随强度、波浪形态和层级间距做统一控制，适合做图像展示、作品集、产品展示、创意海报类界面。

### 安装

```bash
pnpm add @ripplable/ui
```

项目需要使用 Vue 3，并在应用入口或使用组件的样式文件中引入 Ripplable 样式：

```ts
import '@ripplable/ui/styles.css'
```

### 组件功能

`Ripplable` 的核心能力包括：

- 以一组图片或数据项构成无限循环的横向/纵向卡片通道
- 支持鼠标滚轮和触摸拖拽输入
- 支持自动播放（可设置速度，支持负速反向播放）
- 支持查看当前 FPS 和帧率统计信息
- 支持通过 `config` 调整滚动跟随、波浪幅度、空间间距与倾斜强度
- 支持通过 `card` 插槽自定义每个卡片的内容结构

### 使用案例：作品集画廊

下面的示例使用对象数组提供图片和标题，通过 `card` 插槽创建一组可自动播放、可滚轮或触摸操作的作品卡片。

```vue
<script setup lang="ts">
import {
  Ripplable,
  type RipplableListItem,
} from '@ripplable/ui'
import '@ripplable/ui/styles.css'

const projects: RipplableListItem[] = [
  { id: 'aurora', src: '/images/aurora.jpg', alt: 'Aurora identity', title: 'Aurora' },
  { id: 'terrain', src: '/images/terrain.jpg', alt: 'Terrain campaign', title: 'Terrain' },
  { id: 'mono', src: '/images/mono.jpg', alt: 'Mono editorial', title: 'Mono' },
]
</script>

<template>
  <main class="portfolio-gallery">
    <Ripplable :autoplay="5" :list="projects" :visible-count="24">
      <template #card="{ alt, item, label, src }">
        <article class="project-card">
          <img :alt="alt" :src="src" class="project-card__image">
          <div class="project-card__meta">
            <span class="project-card__index">{{ label }}</span>
            <strong class="project-card__title">
              {{ typeof item === 'string' ? label : item?.title }}
            </strong>
          </div>
        </article>
      </template>
    </Ripplable>
  </main>
</template>

<style scoped>
.portfolio-gallery {
  height: 100vh;
  overflow: hidden;
  background: #050505;
}

.project-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 28px;
  background: #111111;
}

.project-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card__meta {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  color: #ffffff;
}

.project-card__index {
  font-size: 0.75rem;
  opacity: 0.7;
}

.project-card__title {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
```

将 `autoplay` 设置为 `true` 会使用默认速度；传入数字可以指定速度，负数表示反向播放。不需要自定义卡片时，可以省略 `card` 插槽，组件会直接渲染图片。

### `list` 数据项说明

`list` 接受一个数组，元素可以是：

1. 字符串：直接作为图片地址
2. 对象：形如：

```ts
interface RipplableItem {
  id?: string | number
  src: string
  alt?: string
  [key: string]: unknown
}
```

组件内部会自动把每个数据项规范化为标准化结构，生成 `src`、`alt`、`id` 和 `key` 等信息。

### Props 说明

#### `list`

- 类型：`RipplableListItem[]`
- 必填：是
- 说明：组件要渲染的图片/卡片数据源。

#### `fps`

- 类型：`boolean`
- 默认值：`false`
- 说明：是否启用 FPS 监视器覆盖层。

#### `autoplay`

- 类型：`boolean | number`
- 默认值：`false`
- 说明：是否自动滚动。传入 `true` 表示开启，传入数字表示开启并指定速度；数值可以为负数，表示反向播放。

#### `config`

- 类型：`Partial<RipplableConfig>`
- 默认值：`{}`
- 说明：用于覆盖组件内部默认的节奏与布局参数。配置项通常来自 `defaultRipplableConfig`。

#### `visibleCount`

- 类型：`number`
- 默认值：`36`
- 说明：当前场景中同时渲染的卡片数量。数值越大，视觉层级越丰富，但也会带来更多渲染成本。

#### `perspective`

- 类型：`string`
- 默认值：`'2000px'`
- 说明：三维场景的透视距离。

#### `perspectiveOrigin`

- 类型：`string`
- 默认值：`'10% 10%'`
- 说明：透视中心点位置。

#### `laneTransform`

- 类型：`string`
- 默认值：`'translateY(100px)'`
- 说明：用于调节整个 lane 在场景中的平移位置，常用于做视觉微调。

### `config` 内部可调参数

`config` 中的参数会直接影响组件的滚动跟随、波浪效果、位置间距与视角表现。常见字段如下：

- `wheelInputScale`：滚轮输入灵敏度
- `touchInputScale`：触摸输入灵敏度
- `baseScrollFollow`：基础跟随强度
- `maxScrollFollow`：最大跟随强度
- `followVelocityInfluence`：速度对跟随强度的影响
- `inputVelocityGain`：输入速度增益
- `inputVelocityDecay`：输入速度衰减
- `waveScrollGain`：波浪随滚动速度放大的幅度
- `maxWaveAmplitude`：波浪最大振幅
- `waveFrequency`：波浪频率
- `waveResponseBase`：波浪基准响应值
- `waveResponseGain`：波浪响应增益
- `maxWaveResponse`：波浪最大响应值
- `waveTiltXGain`：横向倾斜增益
- `maxWaveTiltX`：横向倾斜最大值
- `spacingX`：卡片沿 X 轴间距
- `spacingY`：卡片沿 Y 轴位置偏移
- `spacingZ`：卡片沿 Z 轴层级深度

### 插槽说明

#### 默认插槽

默认插槽会被渲染到卡片层的上方，一般用于放置额外的交互元素、覆盖信息、标题、说明文案等。

#### `card` 插槽

通过 `card` 插槽可以自定义每张卡片的视觉内容。插槽参数包括：

- `item`: 原始数据项
- `resolvedItem`: 归一化后的数据项
- `src`: 图片地址
- `alt`: 图片替代文案
- `label`: 当前卡片标签
- `index`: 当前数据索引
- `slotIndex`: 当前渲染槽位编号

---

## English Description

`Ripplable` is a Vue 3 component for rendering a flowing card lane composed of images or media items. It is designed for immersive visual showcases such as image galleries, portfolios, creative landing pages, and product highlight sections.

### Installation

```bash
pnpm add @ripplable/ui
```

Import the component stylesheet once in your application entry:

```ts
import '@ripplable/ui/styles.css'
```

### What the component does

`Ripplable` provides:

- an infinite looping lane of cards built from a `list` source
- wheel and touch-driven motion input
- autoplay support with configurable speed
- an optional FPS overlay
- runtime tuning for motion follow, wave response, and spatial layout
- a `card` slot for fully custom card markup

### Basic usage

```vue
<script setup lang="ts">
import {
  Ripplable,
  defaultRipplableConfig,
} from '@ripplable/ui'
import '@ripplable/ui/styles.css'

const images = ['/images/1.png', '/images/2.png', '/images/3.png']
const config = { ...defaultRipplableConfig }
</script>

<template>
  <Ripplable :list="images" :autoplay="true" :fps="true" :config="config">
    <template #card="{ src, label, index }">
      <div class="demo-card">
        <img :src="src" :alt="`Visual ${index + 1}`" class="demo-card__image">
        <div class="demo-card__meta">
          <span>{{ label }}</span>
        </div>
      </div>
    </template>
  </Ripplable>
</template>
```

### Props

#### `list`

- Type: `RipplableListItem[]`
- Required: yes
- Description: The data source for the lane. Each item can be either a string URL or an object with `src`, `alt`, and optional `id`.

#### `fps`

- Type: `boolean`
- Default: `false`
- Description: Enables the FPS monitor overlay.

#### `autoplay`

- Type: `boolean | number`
- Default: `false`
- Description: Controls whether the lane auto-plays. `true` enables autoplay, and a number sets the playback speed. Negative values play in reverse.

#### `config`

- Type: `Partial<RipplableConfig>`
- Default: `{}`
- Description: Partial override of the internal motion layout settings. Use `defaultRipplableConfig` as the baseline and then override the fields you need.

#### `visibleCount`

- Type: `number`
- Default: `36`
- Description: Number of rendered card slots in the scene. More cards lead to richer depth but more DOM and rendering cost.

#### `perspective`

- Type: `string`
- Default: `'2000px'`
- Description: Perspective distance for the 3D scene.

#### `perspectiveOrigin`

- Type: `string`
- Default: `'10% 10%'`
- Description: Coordinates of the perspective origin.

#### `laneTransform`

- Type: `string`
- Default: `'translateY(100px)'`
- Description: Optional transform applied to the lane container for fine-tuning its placement.

### Motion config parameters

The component uses a `RipplableConfig` object to control the motion behavior. Common fields are:

- `wheelInputScale`
- `touchInputScale`
- `baseScrollFollow`
- `maxScrollFollow`
- `followVelocityInfluence`
- `inputVelocityGain`
- `inputVelocityDecay`
- `waveScrollGain`
- `maxWaveAmplitude`
- `waveFrequency`
- `waveResponseBase`
- `waveResponseGain`
- `maxWaveResponse`
- `waveTiltXGain`
- `maxWaveTiltX`
- `spacingX`
- `spacingY`
- `spacingZ`

### Slots

#### Default slot

The default slot renders above the card lane and is suitable for overlays, controls, or decorative UI.

#### `card` slot

Use the `card` slot to completely customize each card's markup. The slot receives:

- `item`
- `resolvedItem`
- `src`
- `alt`
- `label`
- `index`
- `slotIndex`
