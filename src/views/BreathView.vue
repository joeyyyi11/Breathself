<template>
  <main class="breath-page">
    <div class="breath-inner">
      <!-- 顶部标题 -->
      <header class="breath-header">
        <div class="brand-mark-sm">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="13" fill="#00754A" />
            <circle cx="16" cy="16" r="6" fill="#f2f0eb" />
          </svg>
        </div>
        <h1>breathe to connect yourself</h1>
        <p class="subtitle">每一次呼吸，都是贴近自己的邀请</p>
      </header>

      <!-- 模式选择：动画开始前 -->
      <div v-if="!sessionStarted" class="setup-panel">
        <p class="setup-label">选择呼吸时长</p>
        <div class="duration-btns">
          <button
            v-for="d in presetDurations"
            :key="d.value"
            class="btn btn-outline"
            :class="{ 'is-active': selectedDuration === d.value }"
            @click="selectedDuration = d.value"
          >
            {{ d.label }}
          </button>
        </div>
        <div class="custom-row">
          <input
            v-model.number="customSec"
            type="number"
            min="30"
            max="600"
            step="10"
            class="input custom-input"
            placeholder="30"
          />
          <span class="custom-unit">秒</span>
          <button class="btn btn-ghost btn-sm" @click="applyCustom">使用自定义</button>
        </div>
      </div>

      <!-- 呼吸圆球：未开始时点击圆球直接开始 -->
      <div class="orb-area" :class="{ 'has-started': sessionStarted }">
        <BreathOrb
          :scale="orbScale"
          :phase-label="displayPhaseLabel"
          :running="breathRunning"
          :clickable="!sessionStarted"
          @click="handleOrbClick"
        />
      </div>

      <!-- 进度条 -->
      <div v-if="sessionStarted" class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress * 100}%` }" />
        </div>
        <div class="progress-meta">
          <span class="remaining">{{ remaining }} 秒</span>
          <!-- <span class="breath-count">{{ breathCount }} 个呼吸循环</span> -->
        </div>
      </div>

      <!-- 结束语 -->
      <transition name="fade-up">
        <div v-if="finished" class="finish-msg">
          <p class="finish-title">开始整理你的思绪</p>
          <p class="finish-sub">即将跳转到笔记面板…</p>
          <div class="finish-dots">
            <span v-for="i in 3" :key="i" class="dot-pulse" :style="{ animationDelay: `${(i - 1) * 0.2}s` }" />
          </div>
        </div>
      </transition>

      <!-- 操作按钮 -->
      <div class="action-row">
        <!-- 跳过：未开始 / 进行中均可直接进入笔记面板 -->
        <button
          v-if="!finished"
          class="btn btn-ghost"
          @click="skipToBoard"
        >
          跳过 →
        </button>

        <!-- 重新开始（结束后） -->
        <button
          v-if="finished"
          class="btn btn-outline"
          @click="handleRestart"
        >
          再来一次
        </button>
        <button
          v-if="finished"
          class="btn btn-primary"
          @click="skipToBoard"
        >
          去写笔记 →
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBreath } from '@/composables/useBreath'
import BreathOrb from '@/components/BreathOrb.vue'
import { useNotesStore } from '@/stores/notes'

const router = useRouter()
const store = useNotesStore()

// 预设时长
const presetDurations = [
  { label: '1 分钟', value: 60 },
  { label: '3 分钟', value: 180 },
  { label: '5 分钟', value: 300 }
]
const selectedDuration = ref(store.settings.breathDuration || 60)
const customSec = ref(120)

const applyCustom = () => {
  const v = Math.max(30, Math.min(600, customSec.value || 60))
  selectedDuration.value = v
}

const sessionStarted = ref(false)
const breathCount = ref(0)
let prevPhaseId = null

const {
  remaining,
  progress,
  running: breathRunning,
  finished,
  phaseLabel,
  orbScale,
  start: breathStart,
  reset: breathReset
} = useBreath()

// 计数呼吸循环
watch(phaseLabel, (label, prev) => {
  if (!sessionStarted.value) return
  if (prev === '屏息' && label === '吸气') {
    breathCount.value++
  }
})

// 结束 → 自动跳转
watch(finished, (isFin) => {
  if (isFin) {
    // 3 秒后跳转
    setTimeout(() => {
      router.push('/board')
    }, 3000)
  }
})

const displayPhaseLabel = computed(() =>
  sessionStarted.value ? phaseLabel.value : '开始深呼吸'
)

const handleStart = () => {
  sessionStarted.value = true
  breathStart(selectedDuration.value)
}

const handleOrbClick = () => {
  if (!sessionStarted.value) handleStart()
}

const handleRestart = () => {
  breathReset()
  breathCount.value = 0
  sessionStarted.value = false
}

const skipToBoard = () => {
  router.push('/board')
}

onUnmounted(() => {
  // 记录上次访问
  store.updateSettings({ lastSeen: Date.now() })
})
</script>

<style scoped>
.breath-page {
  min-height: 100vh;
  background: var(--color-neutral-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-3);
}

.breath-inner {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.breath-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.brand-mark-sm {
  margin-bottom: 4px;
}

h1 {
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--color-starbucks-green);
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.5rem;
  color: var(--color-text-soft);
  max-width: 340px;
}

/* Setup panel */
.setup-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.setup-label {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.duration-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.duration-btns .btn {
  min-width: 96px;
}

.duration-btns .btn.is-active {
  background: var(--color-green-accent);
  color: var(--color-white);
  border-color: var(--color-green-accent);
}

.custom-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-input {
  width: 80px;
  text-align: center;
}

.custom-unit {
  font-size: 1.4rem;
  color: var(--color-text-soft);
}

.btn-sm {
  font-size: 1.2rem;
  padding: 4px 10px;
  min-height: 28px;
}

/* Orb area */
.orb-area {
  position: relative;
  z-index: 0; /* 圆球区域置于底层，配合 action-row 的 z-index 避免遮挡按钮 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--duration-base) ease;
}

.orb-area:not(.has-started) :deep(.orb-wrap.is-clickable) {
  cursor: pointer;
}

/* Progress */
.progress-section {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.10);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-green-accent);
  border-radius: 999px;
  transition: width 0.2s linear;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  color: var(--color-text-soft);
}

/* Finish message */
.finish-msg {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.finish-title {
  font-size: 2.0rem;
  font-weight: 600;
  color: var(--color-starbucks-green);
}

.finish-sub {
  font-size: 1.4rem;
  color: var(--color-text-soft);
}

.finish-dots {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-green-accent);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

/* Action row */
.action-row {
  position: relative;
  z-index: 2;  /* 最最外面，以及注意 */
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 48px;
}

/* Transitions */
.fade-up-enter-active { transition: all 0.5s ease; }
.fade-up-enter-from { opacity: 0; transform: translateY(16px); }
</style>
