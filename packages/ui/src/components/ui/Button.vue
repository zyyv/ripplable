<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
}>(), {
  variant: 'default',
  size: 'default',
})

const attrs = useAttrs()

const buttonType = computed<'button' | 'submit' | 'reset'>(() => {
  const attrType = attrs.type
  if (attrType === 'submit' || attrType === 'reset')
    return attrType
  return 'button'
})

const classes = computed(() => [
  'ui-button',
  `ui-button--${props.variant}`,
  props.size === 'default' ? 'ui-button--default-size' : `ui-button--${props.size}`,
])
</script>

<template>
  <button v-bind="attrs" :type="buttonType" :class="classes">
    <slot />
  </button>
</template>
