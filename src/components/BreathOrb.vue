<template>
  <div
    class="orb-wrap"
    :class="{ 'is-clickable': clickable, 'is-running': running }"
    :style="{ '--orb-scale': scale }"
    @click="$emit('click')"
  >
    <!-- 呼吸涟漪：随圆球缩放扩散的透明圈 -->
    <div class="breath-aura" aria-hidden="true">
      <div
        v-for="i in 4"
        :key="`ring-${i}`"
        class="aura-ring"
        :style="{ '--ring-i': i - 1 }"
      />
    </div>

    <!-- 外圈光晕 -->
    <div class="orb-glow" />

    <!-- 漂浮泡泡 -->
    <div class="breath-bubbles" aria-hidden="true">
      <div
        v-for="i in 8"
        :key="`bubble-${i}`"
        class="bubble"
        :class="{ 'is-hollow': i % 2 === 0 }"
        :style="{ '--bubble-i': i - 1 }"
      />
    </div>

    <!-- 主圆 -->
    <div class="orb" :class="{ 'is-running': running }">
      <span class="orb-phase">{{ phaseLabel }}</span>
      <span class="orb-hint">{{ hint }}</span>
    </div>
    <!-- 静态外圈环 -->
    <svg class="orb-ring" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(0, 117, 74, 0.22)" stroke-width="1.5" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0, 117, 74, 0.14)" stroke-width="1.5" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['click'])

const props = defineProps({
  scale: { type: Number, default: 0.55 },
  phaseLabel: { type: String, default: '开始呼吸' },
  running: { type: Boolean, default: false },
  clickable: { type: Boolean, default: false }
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
  --breath-strength: calc((var(--orb-scale, 0.55) - 0.55) / 0.45);
  position: relative;
  width: min(70vmin, 360px);
  height: min(70vmin, 360px);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 呼吸进行中：装饰层溢出时不拦截下方按钮点击 */
.orb-wrap.is-running {
  pointer-events: none;
}

/* ---- 涟漪圈 ---- */
.breath-aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.aura-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(0, 117, 74, 0.38);
  box-shadow:
    0 0 12px rgba(0, 117, 74, calc(0.08 + var(--breath-strength) * 0.22)),
    inset 0 0 18px rgba(0, 117, 74, calc(0.04 + var(--breath-strength) * 0.1));
  transform: scale(calc(var(--orb-scale, 0.55) * (1.1 + var(--ring-i) * 0.14) + 0.1));
  opacity: calc(0.18 + var(--breath-strength) * (0.72 - var(--ring-i) * 0.12));
  will-change: transform, opacity;
}

.orb-wrap:not(.is-running) .aura-ring {
  border-color: rgba(0, 117, 74, 0.16);
  box-shadow: 0 0 10px rgba(0, 117, 74, 0.05);
  animation: aura-idle 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  animation-delay: calc(var(--ring-i) * 0.12s);
}

.orb-wrap:not(.is-running) .aura-ring:nth-child(n + 3) {
  animation: none;
  opacity: 0.06;
  transform: scale(calc(0.72 + var(--ring-i) * 0.03));
}

@keyframes aura-idle {
  0%, 100% {
    transform: scale(calc(0.66 + var(--ring-i) * 0.04));
    opacity: calc(0.12 - var(--ring-i) * 0.02);
  }
  50% {
    transform: scale(calc(0.74 + var(--ring-i) * 0.05));
    opacity: calc(0.2 - var(--ring-i) * 0.03);
  }
}

/* ---- 光晕 ---- */
.orb-glow {
  position: absolute;
  inset: -8%;
  border-radius: 50%;
  pointer-events: none;   /*直接关闭其可点，防止覆盖跳过键*/
  background: radial-gradient(
    circle at center,
    rgba(0, 117, 74, calc(0.32 + var(--breath-strength) * 0.28)) 0%,
    rgba(0, 117, 74, calc(0.16 + var(--breath-strength) * 0.16)) 38%,
    rgba(0, 117, 74, calc(0.06 + var(--breath-strength) * 0.08)) 58%,
    transparent 78%
  );
  filter: blur(calc(2px + var(--breath-strength) * 6px));
  transform: scale(calc(var(--orb-scale, 0.55) * 1.55 + 0.12));
  will-change: transform, filter;
}

.orb-glow::after {
  content: '';
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(212, 233, 226, calc(0.35 + var(--breath-strength) * 0.35)) 0%,
    rgba(0, 117, 74, calc(0.12 + var(--breath-strength) * 0.18)) 50%,
    transparent 72%
  );
  filter: blur(8px);
}

.orb-wrap:not(.is-running) .orb-glow {
  animation: glow-idle 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  filter: blur(4px);
}

@keyframes glow-idle {
  0%, 100% { transform: scale(0.88); opacity: 0.65; }
  50% { transform: scale(0.94); opacity: 0.78; }
}

/* ---- 泡泡 ---- */
.breath-bubbles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bubble {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(9px + var(--bubble-i) * 0.8px);
  height: calc(9px + var(--bubble-i) * 0.8px);
  margin-top: calc(-4.5px - var(--bubble-i) * 0.4px);
  margin-left: calc(-4.5px - var(--bubble-i) * 0.4px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(180, 220, 205, 0.55) 30%,
    rgba(0, 117, 74, 0.38) 55%,
    rgba(0, 117, 74, 0.12) 100%
  );
  box-shadow: 0 0 10px rgba(0, 117, 74, calc(0.15 + var(--breath-strength) * 0.25));
  --angle: calc(var(--bubble-i) * 45deg);
  --orbit: calc(38% + var(--breath-strength) * 22%);
  transform:
    rotate(var(--angle))
    translateY(calc(-1 * var(--orbit)))
    scale(calc(0.55 + var(--breath-strength) * 1));
  opacity: calc(0.28 + var(--breath-strength) * 0.62);
  will-change: transform, opacity;
}

.bubble.is-hollow {
  background: transparent;
  border: 1.5px solid rgba(0, 117, 74, 0.45);
  box-shadow:
    0 0 12px rgba(0, 117, 74, calc(0.12 + var(--breath-strength) * 0.2)),
    inset 0 0 8px rgba(212, 233, 226, 0.35);
}

.orb-wrap:not(.is-running) .breath-bubbles {
  opacity: 0;
  visibility: hidden;
}

.orb-wrap.is-running .bubble {
  transition: opacity 0.12s linear;
}

.orb-wrap:not(.is-running) .bubble {
  animation: none;
}

@keyframes bubble-idle {
  0%, 100% {
    transform: rotate(var(--angle)) translateY(-36%) scale(0.58);
    opacity: 0.32;
  }
  50% {
    transform: rotate(var(--angle)) translateY(-46%) scale(0.85);
    opacity: 0.58;
  }
}

.orb-wrap:not(.is-running) .orb-ring {
  opacity: 0.45;
  transition: opacity 0.6s ease;
}

.orb-wrap:not(.is-running) .orb {
  animation: orb-idle 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  transition: none;
  box-shadow:
    0 0 16px rgba(0, 117, 74, 0.18),
    0 12px 28px rgba(0, 98, 65, 0.16),
    inset 0 -4px 14px rgba(0, 0, 0, 0.16),
    inset 0 6px 14px rgba(255, 255, 255, 0.06);
}

@keyframes orb-idle {
  0%, 100% { transform: scale(0.54); }
  50% { transform: scale(0.58); }
}

/* ---- 主圆 & 装饰 ---- */
.orb-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.orb {
  position: relative;
  z-index: 1;
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
  box-shadow:
    0 0 24px rgba(0, 117, 74, calc(0.28 + var(--breath-strength) * 0.32)),
    0 16px 40px rgba(0, 98, 65, calc(0.28 + var(--breath-strength) * 0.2)),
    inset 0 -4px 14px rgba(0, 0, 0, 0.18),
    inset 0 8px 20px rgba(255, 255, 255, calc(0.08 + var(--breath-strength) * 0.12));
  transform: scale(var(--orb-scale, 0.55));
  transition: transform 0.18s linear, box-shadow 0.18s linear;
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

@media (prefers-reduced-motion: reduce) {
  .aura-ring,
  .orb-glow,
  .bubble,
  .orb-wrap:not(.is-running) .orb {
    animation: none !important;
  }
}
</style>
