<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  size?: 'sm' | 'default'
}>(), {
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  size: 'default',
})

const emit = defineEmits<{
  (event: 'update:checked', value: boolean): void
  (event: 'checked-change', value: boolean): void
}>()

const attrs = useAttrs()
const internalChecked = ref(props.defaultChecked)

watch(() => props.defaultChecked, (value) => {
  if (props.checked === undefined) {
    internalChecked.value = value
  }
})

const currentChecked = computed(() => (props.checked === undefined ? internalChecked.value : props.checked))

const classes = computed(() => [
  'ui-switch',
  props.size === 'sm' ? 'ui-switch--sm' : 'ui-switch--default',
  currentChecked.value && 'is-checked',
  props.disabled && 'is-disabled',
])

function toggle() {
  if (props.disabled)
    return

  const nextChecked = !currentChecked.value
  if (props.checked === undefined) {
    internalChecked.value = nextChecked
  }
  emit('update:checked', nextChecked)
  emit('checked-change', nextChecked)
}
</script>

<template>
  <button
    v-bind="attrs"
    :aria-checked="currentChecked"
    :class="classes"
    :disabled="disabled"
    role="switch"
    type="button"
    @click="toggle"
  >
    <span class="ui-switch__thumb" />
  </button>
</template>
