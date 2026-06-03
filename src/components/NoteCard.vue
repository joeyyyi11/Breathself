<template>
  <article
    class="note-card"
    :style="cardStyle"
    :class="{ 'is-bottom': isBottom }"
    @click="$emit('click', note)"
    role="button"
    tabindex="0"
    @keyup.enter="$emit('click', note)"
  >
    <header class="note-head">
      <h3 class="note-title">{{ note.title || '无标题' }}</h3>
      <span class="note-tag" :style="{ color: textOnBg }">{{ note.opacity }}%</span>
    </header>
    <p v-if="note.body" class="note-body" :style="{ color: bodyColor }">
      {{ note.body }}
    </p>
    <footer class="note-foot" :style="{ color: subtleColor }">
      <span class="emo-dot" :style="{ background: emotion.color }" />
      <span>{{ emotion.name }}</span>
      <span class="dot-sep">·</span>
      <span>{{ timeText }}</span>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { getEmotion } from '@/stores/notes'

const props = defineProps({
  note: { type: Object, required: true },
  isBottom: { type: Boolean, default: false }
})
defineEmits(['click'])

const emotion = computed(() => getEmotion(props.note.emotion))

// 把 hex 解析成 rgb
const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const v =
    h.length === 3
      ? h.split('').map((c) => c + c).join('')
      : h
  const num = parseInt(v, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

// 用情绪色 + 透明度生成背景，叠在白色卡上
const cardStyle = computed(() => {
  const { r, g, b } = hexToRgb(emotion.value.color)
  const alpha = Math.max(0.08, Math.min(1, props.note.opacity / 100))
  // 顶部颜色稍重一些，营造层次
  const bg = `linear-gradient(180deg, rgba(${r},${g},${b},${alpha}) 0%, rgba(${r},${g},${b},${(alpha * 0.85).toFixed(3)}) 100%), #ffffff`
  return {
    background: bg,
    borderLeft: `3px solid ${emotion.value.color}`
  }
})

// 当透明度较高时，自动让文字变白以保证对比
const isDarkBg = computed(() => {
  const { r, g, b } = hexToRgb(emotion.value.color)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 // 0~1
  return props.note.opacity >= 55 && lum < 0.55
})

const textOnBg = computed(() =>
  isDarkBg.value ? 'rgba(255,255,255,0.92)' : 'var(--color-text)'
)
const bodyColor = computed(() =>
  isDarkBg.value ? 'rgba(255,255,255,0.82)' : 'var(--color-text)'
)
const subtleColor = computed(() =>
  isDarkBg.value ? 'rgba(255,255,255,0.70)' : 'var(--color-text-soft)'
)

const timeText = computed(() => {
  const d = new Date(props.note.createdAt)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
})
</script>

<style scoped>
.note-card {
  position: relative;
  width: 100%;
  border-radius: var(--radius-card);
  padding: 12px 14px 14px;
  box-shadow: var(--shadow-card);
  transition:
    transform var(--duration-fast) var(--ease-soft),
    box-shadow var(--duration-fast) var(--ease-soft);
  outline: none;
  cursor: pointer;
  /* 默认状态：上面只露一小条 (约 64px) — 通过列容器的 margin 实现堆叠 */
}

.note-card:hover,
.note-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.note-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.note-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: var(--letter-spacing-normal);
  line-height: 1.3;
  color: var(--color-text);
  flex: 1;
  /* 限制 1 行 */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.is-bottom .note-title,
.note-card:hover .note-title {
  -webkit-line-clamp: 2;
}

.note-tag {
  font-size: 1.1rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.50);
  white-space: nowrap;
}

.note-body {
  font-size: 1.35rem;
  line-height: 1.55;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.note-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.15rem;
}

.dot-sep {
  opacity: 0.6;
}

.emo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
}
</style>
