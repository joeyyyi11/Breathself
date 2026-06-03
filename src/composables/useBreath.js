import { ref, computed, onUnmounted } from 'vue'

/**
 * 4-4-4-4 呼吸节奏：吸气 → 屏息 → 呼气 → 屏息（每段默认 4 秒）
 * 提供：phase / phaseLabel / remaining / progress / start / pause / reset
 */
export function useBreath() {
  const PHASES = [
    { id: 'inhale',  label: '吸气', duration: 4 },
    { id: 'hold1',   label: '屏息', duration: 4 },
    { id: 'exhale',  label: '呼气', duration: 4 },
    { id: 'hold2',   label: '屏息', duration: 4 }
  ]
  const CYCLE = PHASES.reduce((s, p) => s + p.duration, 0) // 16s

  const totalDuration = ref(60)   // 总时长（秒）
  const elapsed = ref(0)          // 已经过去的时间（秒，可含小数）
  const running = ref(false)
  const finished = ref(false)

  let rafId = null
  let lastTs = 0

  const remaining = computed(() =>
    Math.max(0, Math.ceil(totalDuration.value - elapsed.value))
  )

  const progress = computed(() => {
    if (totalDuration.value <= 0) return 0
    return Math.min(1, elapsed.value / totalDuration.value)
  })

  // 在当前 cycle 中的位置（秒）
  const cycleElapsed = computed(() => elapsed.value % CYCLE)

  // 当前阶段
  const currentPhase = computed(() => {
    let acc = 0
    for (const p of PHASES) {
      acc += p.duration
      if (cycleElapsed.value < acc) return p
    }
    return PHASES[PHASES.length - 1]
  })

  // 当前阶段进度（0~1）
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

  // 圆形缩放比例：吸气 0.55 → 1.0，呼气 1.0 → 0.55，屏息保持
  const orbScale = computed(() => {
    const phase = currentPhase.value
    const p = phaseProgress.value
    const min = 0.55
    const max = 1.0
    switch (phase.id) {
      case 'inhale':  return min + (max - min) * p
      case 'hold1':   return max
      case 'exhale':  return max - (max - min) * p
      case 'hold2':   return min
      default:        return min
    }
  })

  const phaseLabel = computed(() => currentPhase.value.label)

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
