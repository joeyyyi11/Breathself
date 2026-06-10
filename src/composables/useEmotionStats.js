import { computed } from 'vue'
import { EMOTIONS } from '@/stores/notes'

/**
 * 汇总全部笔记的情绪分布与强度，供洞察浮窗可视化使用
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

      return {
        ...emo,
        count,
        percent: total ? Math.round((count / total) * 1000) / 10 : 0,
        avgOpacity
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

    const maxCount = withNotes.reduce((max, e) => Math.max(max, e.count), 0) || 1

    return {
      total,
      byEmotion,
      withNotes,
      dominant,
      overallAvg,
      donutBackground,
      maxCount
    }
  })

  return { analysis }
}
