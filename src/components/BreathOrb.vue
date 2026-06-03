<template>
  <div class="orb-wrap" :style="{ '--orb-scale': scale }">
    <!-- 外圈光晕 -->
    <div class="orb-glow" />
    <!-- 主圆 -->
    <div class="orb" :class="{ 'is-running': running }">
      <span class="orb-phase">{{ phaseLabel }}</span>
      <span class="orb-hint">{{ hint }}</span>
    </div>
    <!-- 静态外圈环 -->
    <svg class="orb-ring" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(0, 117, 74, 0.10)" stroke-width="1" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0, 117, 74, 0.06)" stroke-width="1" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scale: { type: Number, default: 0.55 },
  phaseLabel: { type: String, default: '准备好了吗' },
  running: { type: Boolean, default: false }
})

const hint = computed(() => {
  if (!props.running) return '点击开始'
  switch (props.phaseLabel) {
    case '吸气': return '深深地，吸入'
    case '呼气': return '慢慢地，呼出'
    case '屏息': return '安住此刻'
    default: return ''
  }
})
</script>

<style scoped>
.orb-wrap {
  position: relative;
  width: min(70vmin, 360px);
  height: min(70vmin, 360px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.orb-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(0, 117, 74, 0.22) 0%,
    rgba(0, 117, 74, 0.08) 40%,
    transparent 70%
  );
  transform: scale(calc(var(--orb-scale, 0.55) * 1.4));
  transition: transform 0.18s linear;
}

.orb {
  position: relative;
  width: 78%;
  height: 78%;
  border-radius: 50%;
  background: var(--color-green-accent);
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 12px 32px rgba(0, 98, 65, 0.30), inset 0 -4px 14px rgba(0, 0, 0, 0.18);
  transform: scale(var(--orb-scale, 0.55));
  transition: transform 0.18s linear;
}

.orb-phase {
  font-size: 2.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.orb-hint {
  font-size: 1.3rem;
  font-weight: 400;
  opacity: 0.85;
}

@media (max-width: 480px) {
  .orb-phase { font-size: 2.0rem; }
  .orb-hint { font-size: 1.2rem; }
}
</style>
