<template>
  <div class="board-page">
    <AppNav @new-column="openNewColumn" />

    <div class="board-header">
      <div class="header-inner">
        <div>
          <h1 class="board-title">我的觉察面板</h1>
          <p class="board-sub">
            共 {{ store.totalNotes }} 条笔记 · {{ store.columns.length }} 个分类
          </p>
        </div>
      </div>
    </div>

    <div class="board-scroll scroll-x">
      <div class="board-columns">
        <NoteColumn
          v-for="col in store.columns"
          :key="col.id"
          :column="col"
          @add="openNewNote"
          @edit="openEditColumn"
          @open="openEditNote"
        />
        <!-- 添加分类占位 -->
        <button class="add-col-tile" @click="openNewColumn" title="新建分类">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>新建分类</span>
        </button>
      </div>
    </div>

    <FrapButton @click="openNewNote()" />

    <!-- 笔记弹窗 -->
    <NoteModal
      v-if="noteModalOpen"
      :columns="store.columns"
      :default-column-id="defaultColumnId"
      :note="editingNote"
      @close="closeNoteModal"
      @save="onSaveNote"
      @delete="onDeleteNote"
    />

    <!-- 分类弹窗 -->
    <ColumnModal
      v-if="columnModalOpen"
      :column="editingColumn"
      :can-delete="store.columns.length > 1"
      @close="closeColumnModal"
      @save="onSaveColumn"
      @delete="onDeleteColumn"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotesStore } from '@/stores/notes'
import AppNav from '@/components/AppNav.vue'
import NoteColumn from '@/components/NoteColumn.vue'
import NoteModal from '@/components/NoteModal.vue'
import ColumnModal from '@/components/ColumnModal.vue'
import FrapButton from '@/components/FrapButton.vue'

const store = useNotesStore()

// ----- 笔记弹窗 -----
const noteModalOpen = ref(false)
const defaultColumnId = ref('')
const editingNote = ref(null)        // 含 _columnId 字段表示编辑模式

const openNewNote = (col = null) => {
  defaultColumnId.value = col?.id || store.columns[0]?.id || ''
  editingNote.value = null
  noteModalOpen.value = true
}

const openEditNote = ({ note, column }) => {
  defaultColumnId.value = column.id
  editingNote.value = { ...note, _columnId: column.id }
  noteModalOpen.value = true
}

const closeNoteModal = () => {
  noteModalOpen.value = false
  editingNote.value = null
}

const onSaveNote = (payload) => {
  if (editingNote.value) {
    const oldCol = editingNote.value._columnId
    const noteId = editingNote.value.id
    // 如果分类被改了 → 先 move
    if (payload.columnId !== oldCol) {
      store.moveNote(oldCol, noteId, payload.columnId)
    }
    store.updateNote(payload.columnId, noteId, {
      title: payload.title,
      body: payload.body,
      emotion: payload.emotion,
      opacity: payload.opacity
    })
  } else {
    store.addNote(payload.columnId, payload)
  }
  closeNoteModal()
}

const onDeleteNote = () => {
  if (!editingNote.value) return
  if (!confirm('确定删除这条笔记吗？')) return
  store.deleteNote(editingNote.value._columnId, editingNote.value.id)
  closeNoteModal()
}

// ----- 分类弹窗 -----
const columnModalOpen = ref(false)
const editingColumn = ref(null)

const openNewColumn = () => {
  editingColumn.value = null
  columnModalOpen.value = true
}

const openEditColumn = (col) => {
  editingColumn.value = col
  columnModalOpen.value = true
}

const closeColumnModal = () => {
  columnModalOpen.value = false
  editingColumn.value = null
}

const onSaveColumn = (payload) => {
  if (editingColumn.value) {
    store.updateColumn(editingColumn.value.id, payload)
  } else {
    store.addColumn(payload)
  }
  closeColumnModal()
}

const onDeleteColumn = () => {
  if (!editingColumn.value) return
  const col = editingColumn.value
  const msg = col.notes.length
    ? `分类「${col.name}」下还有 ${col.notes.length} 条笔记，确定一起删除吗？`
    : `确定删除分类「${col.name}」吗？`
  if (!confirm(msg)) return
  store.deleteColumn(col.id)
  closeColumnModal()
}
</script>

<style scoped>
.board-page {
  min-height: 100vh;
  background: var(--color-neutral-warm);
  display: flex;
  flex-direction: column;
}

.board-header {
  padding: 20px var(--outer-gutter) 8px;
}
@media (min-width: 768px) {
  .board-header { padding: 24px var(--outer-gutter-md) 8px; }
}
@media (min-width: 1024px) {
  .board-header { padding: 28px var(--outer-gutter-lg) 8px; }
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
}

.board-title {
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-starbucks-green);
  letter-spacing: var(--letter-spacing-normal);
}

.board-sub {
  margin-top: 4px;
  font-size: 1.35rem;
  color: var(--color-text-soft);
}

.board-scroll {
  flex: 1;
  padding: 14px var(--outer-gutter) 100px;
  overflow-x: auto;
}
@media (min-width: 768px) {
  .board-scroll { padding: 16px var(--outer-gutter-md) 100px; }
}
@media (min-width: 1024px) {
  .board-scroll { padding: 18px var(--outer-gutter-lg) 100px; }
}

.board-columns {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  min-height: 60vh;
  width: max-content;
  padding-right: 80px;
}

.add-col-tile {
  flex: 0 0 220px;
  height: 120px;
  border-radius: var(--radius-card);
  border: 1.5px dashed rgba(0, 0, 0, 0.16);
  background: transparent;
  color: var(--color-text-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.35rem;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
}
.add-col-tile:hover {
  border-color: var(--color-green-accent);
  color: var(--color-green-accent);
  background: rgba(0, 117, 74, 0.04);
}
.add-col-tile:active { transform: scale(0.98); }
</style>
