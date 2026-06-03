<template>
  <section class="column" :class="{ 'is-collapsed': collapsed }">
    <header class="col-head">
      <div class="col-title">
        <span class="col-dot" :style="{ background: column.color }" />
        <span class="col-name" :title="column.name">{{ column.name }}</span>
        <span class="col-count">{{ column.notes.length }}</span>
      </div>
      <div class="col-actions">
        <button
          class="icon-btn"
          @click="$emit('add', column)"
          title="在该分类下新建笔记"
          aria-label="新建笔记"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button class="icon-btn" @click="collapsed = !collapsed" :title="collapsed ? '展开' : '折叠'">
          <svg v-if="!collapsed" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button class="icon-btn" @click="$emit('edit', column)" title="编辑分类">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="!collapsed" class="stack-wrap">
      <div v-if="column.notes.length === 0" class="empty">
        <p>这里还很空 ✨</p>
        <button class="btn btn-outline btn-sm" @click="$emit('add', column)">
          写下第一条
        </button>
      </div>
      <div v-else class="stack">
        <div
          v-for="(note, idx) in column.notes"
          :key="note.id"
          class="stack-item"
          :style="{
            marginTop: idx === 0 ? '0' : `-${stackOverlap}px`,
            zIndex: idx + 1
          }"
        >
          <NoteCard
            :note="note"
            :is-bottom="idx === column.notes.length - 1"
            @click="$emit('open', { note, column })"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import NoteCard from './NoteCard.vue'

defineProps({
  column: { type: Object, required: true }
})
defineEmits(['add', 'edit', 'open'])

const collapsed = ref(false)
// 每张卡向上叠多少 px：卡片总高约 140px，露出 64px → 重叠 ~76px
const stackOverlap = 76
</script>

<style scoped>
.column {
  flex: 0 0 320px;
  background: var(--color-ceramic);
  border-radius: var(--radius-card);
  padding: 14px 12px 16px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 130px);
  min-height: 200px;
  transition: flex-basis var(--duration-base) var(--ease-soft);
}

.column.is-collapsed {
  flex: 0 0 220px;
  min-height: 0;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 4px 4px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.col-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: var(--letter-spacing-normal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-count {
  font-size: 1.1rem;
  color: var(--color-text-soft);
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  padding: 1px 8px;
  flex-shrink: 0;
}

.col-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.55;
  transition: opacity var(--duration-fast) ease;
}

.column:hover .col-actions {
  opacity: 1;
}

.icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-soft);
  transition: background var(--duration-fast) ease, color var(--duration-fast) ease;
}
.icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text);
}
.icon-btn:active {
  transform: scale(0.95);
}

.stack-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 4px 24px;
  margin: -4px -4px 0;
}
.stack-wrap::-webkit-scrollbar {
  width: 6px;
}
.stack-wrap::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.10);
  border-radius: 3px;
}

.stack {
  display: flex;
  flex-direction: column;
}

.stack-item {
  position: relative;
  transition: transform var(--duration-fast) var(--ease-soft), z-index 0s;
}

/* hover 时整张卡片上浮、其下方的卡跟着错开，并把当前卡 z-index 抬上去 */
.stack-item:hover {
  z-index: 999 !important;
  transform: translateY(-6px);
}

.btn-sm {
  font-size: 1.25rem;
  padding: 5px 12px;
  min-height: 30px;
}

.empty {
  padding: 30px 12px;
  text-align: center;
  color: var(--color-text-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}
.empty p {
  font-size: 1.35rem;
}
</style>
