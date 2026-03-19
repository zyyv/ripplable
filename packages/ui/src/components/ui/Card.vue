<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'default' | 'sm'
}>(), {
  size: 'default',
})

const classes = computed(() => ['ui-card', props.size === 'sm' && 'ui-card--sm'])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
