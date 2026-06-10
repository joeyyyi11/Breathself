<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal insights-modal" role="dialog" aria-modal="true" aria-labelledby="insights-title">
      <header class="insights-head">
        <div>
          <h2 id="insights-title">情绪洞察</h2>
          <p class="insights-sub">基于面板全部 {{ analysis.total }} 条笔记的可视化分析</p>
        </div>
        <button type="button" class="close-btn" aria-label="关闭" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div v-if="analysis.total === 0" class="empty-state">
        <div class="empty-icon">☕</div>
        <p class="empty-title">还没有可分析的数据</p>
        <p class="empty-desc">先写几条带情绪标签的笔记，再来查看你的觉察趋势。</p>
      </div>

      <template v-else>
        <!-- 概览 -->
        <div class="summary-grid">
          <div class="summary-card">
            <span class="summary-label">笔记总数</span>
            <strong class="summary-value">{{ analysis.total }}</strong>
            <span class="summary-hint">条觉察记录</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">主要情绪</span>
            <strong class="summary-value emo-name" :style="{ color: analysis.dominant?.color }">
              {{ analysis.dominant?.name ?? '—' }}
            </strong>
            <span class="summary-hint">
              {{ analysis.dominant ? `${analysis.dominant.percent}% 占比` : '暂无' }}
            </span>
          </div>
          <div class="summary-card">
            <span class="summary-label">平均强度</span>
            <strong class="summary-value">{{ analysis.overallAvg }}%</strong>
            <span class="summary-hint">全部笔记均值</span>
          </div>
        </div>

        <!-- 环形分布 -->
        <section class="panel-section">
          <h3>情绪占比</h3>
          <div class="donut-layout">
            <div class="donut-wrap">
              <div class="donut" :style="{ background: analysis.donutBackground }">
                <div class="donut-hole">
                  <span class="donut-num">{{ analysis.total }}</span>
                  <span class="donut-cap">条笔记</span>
                </div>
              </div>
            </div>
            <ul class="legend">
              <li v-for="item in analysis.withNotes" :key="item.id">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-meta">{{ item.count }} 条 · {{ item.percent }}%</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- 数量分布 -->
        <section class="panel-section">
          <h3>数量分布</h3>
          <ul class="bar-list">
            <li v-for="item in analysis.byEmotion" :key="item.id">
              <div class="bar-row">
                <span class="bar-label">
                  <span class="bar-dot" :style="{ background: item.color }" />
                  {{ item.name }}
                </span>
                <span class="bar-count">{{ item.count }}</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${(item.count / analysis.maxCount) * 100}%`,
                    background: item.color
                  }"
                />
              </div>
            </li>
          </ul>
        </section>

        <!-- 强度分布 -->
        <section class="panel-section">
          <h3>平均强度</h3>
          <ul class="bar-list">
            <li v-for="item in analysis.byEmotion" :key="`${item.id}-intensity`">
              <div class="bar-row">
                <span class="bar-label">
                  <span class="bar-dot" :style="{ background: item.color }" />
                  {{ item.name }}
                </span>
                <span class="bar-count">{{ item.count ? `${item.avgOpacity}%` : '—' }}</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill bar-fill-soft"
                  :style="{
                    width: item.count ? `${item.avgOpacity}%` : '0%',
                    background: item.color
                  }"
                />
              </div>
            </li>
          </ul>
        </section>
      </template>

      <div class="modal-actions">
        <button type="button" class="btn btn-primary" @click="$emit('close')">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useEmotionStats } from '@/composables/useEmotionStats'

defineEmits(['close'])

const store = useNotesStore()

const allNotes = computed(() =>
  store.columns.flatMap((col) => col.notes)
)

const { analysis } = useEmotionStats(() => allNotes.value)
</script>

<style scoped>
.insights-modal {
  max-width: 640px;
  padding: var(--space-4) var(--space-4) var(--space-3);
}

.insights-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.insights-head h2 {
  margin-bottom: 4px;
}

.insights-sub {
  font-size: 1.3rem;
  color: var(--color-text-soft);
}

.close-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--color-neutral-cool);
  color: var(--color-text-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}

.close-btn:hover {
  color: var(--color-green-accent);
  border-color: var(--color-green-accent);
  background: rgba(0, 117, 74, 0.06);
}

.close-btn:active {
  transform: scale(0.95);
}

.empty-state {
  text-align: center;
  padding: var(--space-5) var(--space-3);
  background: var(--color-neutral-warm);
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);
}

.empty-icon {
  font-size: 3.2rem;
  margin-bottom: var(--space-2);
}

.empty-title {
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-starbucks-green);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 1.35rem;
  color: var(--color-text-soft);
  max-width: 320px;
  margin: 0 auto;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: var(--space-4);
}

@media (max-width: 520px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background: var(--color-neutral-cool);
  border-radius: var(--radius-card);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-card);
}

.summary-label {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-soft);
}

.summary-value {
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--color-starbucks-green);
  line-height: 1.2;
}

.summary-value.emo-name {
  font-size: 1.9rem;
}

.summary-hint {
  font-size: 1.2rem;
  color: var(--color-text-faint);
}

.panel-section {
  margin-bottom: var(--space-4);
}

.panel-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
}

.donut-layout {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  background: rgba(212, 233, 226, 0.35);
  border-radius: var(--radius-card);
  padding: var(--space-3);
}

.donut-wrap {
  flex: 0 0 auto;
}

.donut {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-card);
}

.donut-hole {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.donut-num {
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-starbucks-green);
  line-height: 1;
}

.donut-cap {
  font-size: 1.15rem;
  color: var(--color-text-soft);
  margin-top: 2px;
}

.legend {
  flex: 1;
  min-width: 180px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-weight: 600;
  color: var(--color-text);
  min-width: 2.4em;
}

.legend-meta {
  margin-left: auto;
  color: var(--color-text-soft);
  font-size: 1.2rem;
}

.bar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 1.3rem;
}

.bar-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--color-text);
}

.bar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.bar-count {
  font-weight: 600;
  color: var(--color-text-soft);
}

.bar-track {
  height: 8px;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.45s var(--ease-soft);
  min-width: 0;
}

.bar-fill-soft {
  opacity: 0.72;
}

.modal-actions {
  margin-top: var(--space-2);
}
</style>
