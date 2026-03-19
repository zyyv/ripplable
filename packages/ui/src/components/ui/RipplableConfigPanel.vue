<script setup lang="ts">
import { ref } from 'vue'

import {
  clampRipplableAutoplaySpeed,
  formatRipplableControlValue,
  ripplableControlSections,
  useRipplableContext,
  type RipplableAutoplay,
  type RipplableConfig,
} from '../../lib/ripplable'
import Badge from './Badge.vue'
import Button from './Button.vue'
import Card from './Card.vue'
import Switch from './Switch.vue'

const props = withDefaults(defineProps<{
  defaultOpen?: boolean
}>(), {
  defaultOpen: true,
})

defineSlots<{
  default?: (props: {
    autoplay: RipplableAutoplay
    autoplayEnabled: boolean
    autoplaySpeed: number
    config: RipplableConfig
    fps: boolean
    setAutoplay: (value: RipplableAutoplay) => void
    setAutoplaySpeed: (value: number) => void
    updateConfig: (key: keyof RipplableConfig, value: number) => void
    replaceConfig: (value?: Partial<RipplableConfig>) => void
    resetConfig: () => void
    setFps: (value: boolean) => void
  }) => unknown
}>()

const isOpen = ref(props.defaultOpen)
const {
  autoplay,
  autoplayEnabled,
  autoplaySpeed,
  config,
  fps,
  replaceConfig,
  resetConfig,
  setAutoplay,
  setAutoplaySpeed,
  setFps,
  updateConfig,
} = useRipplableContext()

function updateControl(key: keyof RipplableConfig, event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target)
    return

  updateConfig(key, Number(target.value))
}

function updateAutoplaySpeed(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target)
    return

  setAutoplaySpeed(clampRipplableAutoplaySpeed(Number(target.value)))
}
</script>

<template>
  <div class="ripplable-config-panel__toggle-wrap" data-ripplable-interactive style="touch-action: auto;">
    <Button
      class="ripplable-config-panel__toggle"
      size="sm"
      variant="outline"
      @click="isOpen = !isOpen"
    >
      <span aria-hidden="true" class="ripplable-config-panel__toggle-glyph" />
      {{ isOpen ? 'Hide Controls' : 'Show Controls' }}
    </Button>
  </div>

  <div
    :class="['ripplable-config-panel', isOpen && 'is-open']"
    data-ripplable-interactive
    style="touch-action: auto;"
  >
    <Card class="ripplable-config-panel__surface">
      <div class="ripplable-config-panel__header">
        <div class="ripplable-config-panel__header-top">
          <div class="ripplable-config-panel__heading">
            <Badge class="ripplable-config-panel__chip" variant="outline">
              Motion Config
            </Badge>
            <div>
              <div class="ripplable-config-panel__title">
                Sidebar Controls
              </div>
              <div class="ripplable-config-panel__description">
                Tune scroll follow, wave behavior, and lane spacing live.
              </div>
            </div>
          </div>

          <Button
            aria-label="Reset motion settings"
            class="ripplable-config-panel__reset"
            size="icon-sm"
            variant="outline"
            @click="resetConfig()"
          >
            <span aria-hidden="true" class="ripplable-config-panel__reset-symbol">
              ↺
            </span>
          </Button>
        </div>

        <div class="ripplable-config-panel__fps-row">
          <div>
            <div class="ripplable-config-panel__fps-label">
              FPS Monitor
            </div>
            <div class="ripplable-config-panel__fps-copy">
              Toggle the live frame counter overlay.
            </div>
          </div>
          <Switch
            :checked="fps"
            @update:checked="setFps($event)"
          />
        </div>

        <div class="ripplable-config-panel__autoplay-row">
          <div>
            <div class="ripplable-config-panel__fps-label">
              Auto Play
            </div>
            <div class="ripplable-config-panel__fps-copy">
              Keep the lane moving automatically. Negative speed runs backward.
            </div>
          </div>
          <Switch
            :checked="autoplayEnabled"
            @update:checked="setAutoplay($event)"
          />
        </div>

        <label
          :class="['ripplable-config-panel__autoplay-speed', !autoplayEnabled && 'is-disabled']"
        >
          <div class="ripplable-config-panel__control-head">
            <span class="ripplable-config-panel__control-label">Play Speed</span>
            <Badge class="ripplable-config-panel__control-value" variant="outline">
              {{ formatRipplableControlValue(autoplaySpeed, 0.1) }}
            </Badge>
          </div>
          <input
            class="ripplable-config-panel__control-slider"
            :value="autoplaySpeed"
            :disabled="!autoplayEnabled"
            :max="24"
            :min="-24"
            :step="0.1"
            type="range"
            @input="updateAutoplaySpeed"
          >
        </label>
      </div>

      <div class="ripplable-config-panel__content">
        <div class="ripplable-config-panel__sections">
          <section
            v-for="section in ripplableControlSections"
            :key="section.title"
            class="ripplable-config-panel__section"
          >
            <div class="ripplable-config-panel__section-header">
              <div class="ripplable-config-panel__section-title">
                {{ section.title }}
              </div>
              <p class="ripplable-config-panel__section-description">
                {{ section.description }}
              </p>
            </div>

            <div class="ripplable-config-panel__section-body">
              <label
                v-for="control in section.controls"
                :key="control.key"
                class="ripplable-config-panel__control-row"
              >
                <div class="ripplable-config-panel__control-head">
                  <span class="ripplable-config-panel__control-label">{{ control.label }}</span>
                  <Badge class="ripplable-config-panel__control-value" variant="outline">
                    {{ formatRipplableControlValue(config[control.key], control.step) }}
                  </Badge>
                </div>
                <input
                  class="ripplable-config-panel__control-slider"
                  :max="control.max"
                  :min="control.min"
                  :step="control.step"
                  :value="config[control.key]"
                  type="range"
                  @input="updateControl(control.key, $event)"
                >
              </label>
            </div>
          </section>
        </div>

        <slot
          :autoplay="autoplay"
          :autoplay-enabled="autoplayEnabled"
          :autoplay-speed="autoplaySpeed"
          :config="config"
          :fps="fps"
          :set-autoplay="setAutoplay"
          :set-autoplay-speed="setAutoplaySpeed"
          :replace-config="replaceConfig"
          :reset-config="resetConfig"
          :set-fps="setFps"
          :update-config="updateConfig"
        />
      </div>
    </Card>
  </div>
</template>
