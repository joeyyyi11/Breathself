import { computed } from 'vue'
import { EMOTIONS } from '@/stores/notes'

/** 统计时间范围选项 */
export const TIME_RANGE_OPTIONS = [
  { id: 'week', label: '一周内', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: 'month', label: '一个月内', ms: 30 * 24 * 60 * 60 * 1000 },
  { id: 'year', label: '一年内', ms: 365 * 24 * 60 * 60 * 1000 },
  { id: 'all', label: '全部数据', ms: null }
]

export const getTimeRangeLabel = (rangeId) =>
  TIME_RANGE_OPTIONS.find((r) => r.id === rangeId)?.label ?? '全部数据'

/** 按 createdAt 过滤笔记；无时间戳的笔记仅在「全部数据」中出现 */
export function filterNotesByRange(notes, rangeId) {
  const range = TIME_RANGE_OPTIONS.find((r) => r.id === rangeId)
  if (!range || range.ms == null) return notes

  const cutoff = Date.now() - range.ms
  return notes.filter((n) => {
    const ts = Number(n.createdAt)
    return ts > 0 && ts >= cutoff
  })
}

/** 占比 + 条数，如 30%（4条） */
export const formatPercentWithCount = (percent, count) =>
  `${percent}%（${count}条）`

/**
 * 汇总笔记的情绪分布与强度，供洞察浮窗可视化使用
 */
export function useEmotionStats(notesSource) {
  const analysis = computed(() => {
    const notes =
      typeof notesSource === 'function'
        ? notesSource()
        : notesSource?.value ?? notesSource ?? []

    const total = notes.length

    const byEmotion = EMOTIONS.map((emo) => {
      const matched = notes.filter((n) => (n.emotion || 'awareness') === emo.id)
      const count = matched.length
      const avgOpacity = count
        ? Math.round(
            matched.reduce((sum, n) => sum + (Number(n.opacity) || 50), 0) / count
          )
        : 0

      const percent = total ? Math.round((count / total) * 1000) / 10 : 0

      return {
        ...emo,
        count,
        percent,
        avgOpacity,
        label: formatPercentWithCount(percent, count)
      }
    })

    const withNotes = byEmotion.filter((e) => e.count > 0)
    const dominant = [...withNotes].sort((a, b) => b.count - a.count)[0] ?? null
    const overallAvg = total
      ? Math.round(
          notes.reduce((sum, n) => sum + (Number(n.opacity) || 50), 0) / total
        )
      : 0

    let acc = 0
    const donutStops = withNotes.map((e) => {
      const slice = (e.count / total) * 100
      const start = acc
      acc += slice
      return `${e.color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`
    })

    const donutBackground =
      withNotes.length > 0
        ? `conic-gradient(${donutStops.join(', ')})`
        : 'conic-gradient(var(--color-ceramic) 0% 100%)'

    return {
      total,
      byEmotion,
      withNotes,
      dominant,
      overallAvg,
      donutBackground
    }
  })

  return { analysis }
}
