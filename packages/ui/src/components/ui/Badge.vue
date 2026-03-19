<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
}>(), {
  variant: 'default',
})

const classes = computed(() => ['ui-badge', `ui-badge--${props.variant}`])
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
