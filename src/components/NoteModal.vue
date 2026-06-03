<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal note-modal" role="dialog" aria-modal="true">
      <h2>{{ isEdit ? '编辑笔记' : '新建笔记' }}</h2>

      <div class="field">
        <label class="label" for="note-title">提要</label>
        <input
          id="note-title"
          v-model="form.title"
          class="input"
          type="text"
          maxlength="60"
          placeholder="给这一刻起个名字…"
          autofocus
        />
      </div>

      <div class="field">
        <label class="label" for="note-body">正文</label>
        <textarea
          id="note-body"
          v-model="form.body"
          class="textarea"
          rows="5"
          placeholder="写下你此刻的想法，越具体越能看见自己…"
          maxlength="1000"
        ></textarea>
        <div class="char-count">{{ form.body.length }} / 1000</div>
      </div>

      <div class="field">
        <label class="label" for="note-col">所属分类</label>
        <select id="note-col" v-model="form.columnId" class="select">
          <option v-for="c in columns" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="label">情绪标签</label>
        <div class="chips">
          <button
            v-for="e in emotions"
            :key="e.id"
            type="button"
            class="emotion-chip"
            :class="{ 'is-active': form.emotion === e.id }"
            :style="form.emotion === e.id ? { background: e.color, borderColor: e.color } : { borderColor: e.color }"
            @click="form.emotion = e.id"
          >
            <span class="dot" :style="{ background: form.emotion === e.id ? 'rgba(255,255,255,0.85)' : e.color }" />
            {{ e.name }}
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">
          情绪强度
          <span class="opacity-val">{{ form.opacity }}%</span>
        </label>
        <input
          v-model.number="form.opacity"
          type="range"
          min="10"
          max="100"
          step="5"
          class="slider"
        />
        <div class="opacity-hint">
          <span>轻</span>
          <span>强烈</span>
        </div>
      </div>

      <div class="field">
        <label class="label">实时预览</label>
        <div class="preview-wrap">
          <NoteCard :note="previewNote" :is-bottom="true" @click="() => {}" />
        </div>
      </div>

      <div class="modal-actions">
        <button v-if="isEdit" type="button" class="btn btn-danger" @click="$emit('delete')">
          删除
        </button>
        <div class="spacer" />
        <button type="button" class="btn btn-ghost" @click="$emit('close')">取消</button>
        <button type="button" class="btn btn-primary" @click="onSave">
          {{ isEdit ? '保存修改' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import NoteCard from './NoteCard.vue'
import { EMOTIONS } from '@/stores/notes'

const props = defineProps({
  columns: { type: Array, required: true },
  defaultColumnId: { type: String, default: '' },
  note: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save', 'delete'])

const emotions = EMOTIONS
const isEdit = computed(() => !!props.note)

const form = reactive({
  title: '',
  body: '',
  emotion: 'awareness',
  opacity: 50,
  columnId: props.defaultColumnId || props.columns[0]?.id || ''
})

// 初始化
watch(
  () => props.note,
  (n) => {
    if (n) {
      form.title = n.title || ''
      form.body = n.body || ''
      form.emotion = n.emotion || 'awareness'
      form.opacity = n.opacity ?? 50
      form.columnId = n._columnId || form.columnId
    }
  },
  { immediate: true }
)

watch(
  () => props.defaultColumnId,
  (id) => {
    if (id && !props.note) form.columnId = id
  }
)

const previewNote = computed(() => ({
  id: 'preview',
  title: form.title || '预览标题',
  body: form.body || '这里会展示你写下的内容，颜色和透明度会随你的选择实时变化。',
  emotion: form.emotion,
  opacity: form.opacity,
  createdAt: props.note?.createdAt || Date.now()
}))

const onSave = () => {
  if (!form.columnId) return
  emit('save', {
    title: form.title.trim() || '无标题',
    body: form.body.trim(),
    emotion: form.emotion,
    opacity: form.opacity,
    columnId: form.columnId
  })
}
</script>

<style scoped>
.note-modal {
  max-width: 600px;
}

.field {
  margin-bottom: var(--space-3);
}

.label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opacity-val {
  font-size: 1.3rem;
  color: var(--color-green-accent);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.opacity-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 1.1rem;
  color: var(--color-text-soft);
}

.char-count {
  text-align: right;
  font-size: 1.1rem;
  color: var(--color-text-faint);
  margin-top: 4px;
}

.preview-wrap {
  background: var(--color-neutral-warm);
  border-radius: var(--radius-card);
  padding: var(--space-3);
}

.modal-actions .spacer {
  flex: 1;
}
</style>
