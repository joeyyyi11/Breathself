import { ref, computed, onUnmounted } from 'vue'

/**
 * Apple Watch 原生呼吸：吸气4s → 呼气4.57s，单轮≈8.57s，一分钟7次，无屏息
 */
export function useBreath() {
  // 苹果原版呼吸分段：只有吸气、呼气，去掉hold屏息
  const PHASES = [
    { id: 'inhale', label: '吸气', duration: 4 },
    { id: 'exhale', label: '呼气', duration: 4.57 }
  ]
  const CYCLE = PHASES.reduce((s, p) => s + p.duration, 0) // 一轮周期 = 8.57s

  const totalDuration = ref(60)   // 默认总时长60s(1分钟)
  const elapsed = ref(0)
  const running = ref(false)
  const finished = ref(false)

  let rafId = null
  let lastTs = 0

  // 剩余总秒数
  const remaining = computed(() =>
    Math.max(0, Math.ceil(totalDuration.value - elapsed.value))
  )

  // 全局总进度 0~1
  const progress = computed(() => {
    if (totalDuration.value <= 0) return 0
    return Math.min(1, elapsed.value / totalDuration.value)
  })

  // 当前周期内已过时间
  const cycleElapsed = computed(() => elapsed.value % CYCLE)

  // 获取当前阶段（吸气/呼气）
  const currentPhase = computed(() => {
    let acc = 0
    for (const p of PHASES) {
      acc += p.duration
      if (cycleElapsed.value < acc) return p
    }
    return PHASES[PHASES.length - 1]
  })

  // 当前阶段内部进度 0~1
  const phaseProgress = computed(() => {
    let acc = 0
    for (const p of PHASES) {
      if (cycleElapsed.value < acc + p.duration) {
        return (cycleElapsed.value - acc) / p.duration
      }
      acc += p.duration
    }
    return 1
  })

  // 圆环缩放：吸气放大 0.55→1，呼气缩小1→0.55
  const orbScale = computed(() => {
    const phase = currentPhase.value
    const p = phaseProgress.value
    const min = 0.55
    const max = 1.0
    switch (phase.id) {
      case 'inhale':
        return min + (max - min) * p
      case 'exhale':
        return max - (max - min) * p
      default:
        return min
    }
  })

  const phaseLabel = computed(() => currentPhase.value.label)

  // 帧动画
  const tick = (ts) => {
    if (!running.value) return
    if (!lastTs) lastTs = ts
    const dt = (ts - lastTs) / 1000
    lastTs = ts
    elapsed.value = Math.min(totalDuration.value, elapsed.value + dt)
    if (elapsed.value >= totalDuration.value) {
      running.value = false
      finished.value = true
      cancelAnimationFrame(rafId)
      rafId = null
      return
    }
    rafId = requestAnimationFrame(tick)
  }

  // 开始，可自定义总时长
  const start = (durationSec) => {
    if (typeof durationSec === 'number' && durationSec > 0) {
      totalDuration.value = durationSec
    }
    if (running.value) return
    finished.value = false
    running.value = true
    lastTs = 0
    rafId = requestAnimationFrame(tick)
  }

  const pause = () => {
    running.value = false
    lastTs = 0
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  const reset = () => {
    pause()
    elapsed.value = 0
    finished.value = false
  }

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  return {
    totalDuration,
    elapsed,
    remaining,
    progress,
    running,
    finished,
    phaseLabel,
    currentPhase,
    phaseProgress,
    orbScale,
    start,
    pause,
    reset
  }
}