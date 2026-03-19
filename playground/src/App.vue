<script setup lang="ts">
import {
  Ripplable,
  RipplableConfigPanel,
  defaultRipplableConfig,
} from '@ripplable/ui'

const imageSources = [
  '/images/11d2f7cd-e5b9-482d-8066-a009687161bc.png',
  '/images/2224e403-9848-4b10-bb28-e88d6ee322e3.png',
  '/images/0390a926-86f7-4ad3-98b2-272d7ad76c9a.png',
  '/images/7dfe5bad-3d26-4af9-8493-b4f3c851a07a.png',
  '/images/579bd461-499c-4dca-8fc2-52ffd7e50612.png',
  '/images/2ed47c65-b6dc-4eb7-a330-98b4b931757a.png',
  '/images/4f052a9a-216b-45d4-813a-644000eec8cc.png',
  '/images/8e3c62cd-b8ad-44df-af64-f2cc6a0f3fee.png',
  '/images/30779d00-8cbc-4ced-bf81-7dd8249c7673.png',
  '/images/735b7d4f-edca-46f7-bc2f-b3a3e71f33f0.jpg',
  '/images/e5d8c9a0-ce43-44fc-b3fa-a36cacb5d3ed.png',
  '/images/17582619-ea38-4aa1-aee4-0ea41adc4356.png',
  '/images/aa85152c-3882-45e6-9d79-cba90e9adaca.png',
  '/images/f0e49ca9-baf4-4b1e-8517-a2356bfd454a.png',
  '/images/aff00f59-fcd1-4b4f-afbd-4b2446d6eabc.png',
  '/images/f67ff078-008a-461c-9863-7693edc89761.png',
]

const initialConfig = { ...defaultRipplableConfig }
</script>

<template>
  <Ripplable :autoplay="true" :config="initialConfig" :fps="true" :list="imageSources">
    <RipplableConfigPanel />

    <template #card="{ src, label, index }">
      <div class="demo-card">
        <img :src="src" alt="" class="demo-card__image">
        <div class="demo-card__shade" />
        <div class="demo-card__meta">
          <span class="demo-card__eyebrow">Frame {{ label }}</span>
          <strong class="demo-card__title">Visual {{ index + 1 }}</strong>
        </div>
      </div>
    </template>
  </Ripplable>
</template>

<style scoped>
.demo-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 28px;
  background: #020617;
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.demo-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.demo-card__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(1, 4, 9, 0.08), rgba(1, 4, 9, 0.72)),
    linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0.22));
}

.demo-card__meta {
  position: absolute;
  right: 1rem;
  top: 1rem;
  left: 1rem;
  display: grid;
  gap: 0.15rem;
}

.demo-card__eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.demo-card__title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.1;
}
</style>
