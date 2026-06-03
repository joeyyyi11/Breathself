<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <h2>{{ isEdit ? '编辑分类' : '新建分类' }}</h2>

      <div class="field">
        <label class="label" for="col-name">分类名</label>
        <input
          id="col-name"
          v-model="form.name"
          class="input"
          type="text"
          maxlength="20"
          placeholder="例如：日常练习"
          autofocus
        />
      </div>

      <div class="field">
        <label class="label">主色调</label>
        <div class="swatches">
          <button
            v-for="c in colors"
            :key="c.value"
            type="button"
            class="swatch"
            :class="{ 'is-active': form.color === c.value }"
            :style="{ background: c.value }"
            :title="c.name"
            @click="form.color = c.value"
          >
            <svg v-if="form.color === c.value" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button v-if="isEdit && canDelete" type="button" class="btn btn-danger" @click="$emit('delete')">
          删除分类
        </button>
        <div class="spacer" />
        <button type="button" class="btn btn-ghost" @click="$emit('close')">取消</button>
        <button type="button" class="btn btn-primary" :disabled="!form.name.trim()" @click="onSave">
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  column: { type: Object, default: null },
  canDelete: { type: Boolean, default: true }
})
const emit = defineEmits(['close', 'save', 'delete'])

const isEdit = computed(() => !!props.column)

const colors = [
  { name: 'Starbucks Green', value: '#006241' },
  { name: 'Green Accent', value: '#00754A' },
  { name: 'House Green', value: '#1E3932' },
  { name: 'Green Uplift', value: '#2b5148' },
  { name: '焦虑橙', value: '#D2691E' },
  { name: 'Gold', value: '#cba258' }
]

const form = reactive({
  name: '',
  color: '#00754A'
})

watch(
  () => props.column,
  (c) => {
    if (c) {
      form.name = c.name
      form.color = c.color
    } else {
      form.name = ''
      form.color = '#00754A'
    }
  },
  { immediate: true }
)

const onSave = () => {
  if (!form.name.trim()) return
  emit('save', { name: form.name.trim(), color: form.color })
}
</script>

<style scoped>
.field { margin-bottom: var(--space-3); }

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-fast) ease, border-color var(--duration-fast) ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
}
.swatch:hover { transform: translateY(-2px); }
.swatch.is-active {
  border-color: var(--color-text);
}

.modal-actions .spacer { flex: 1; }
</style>
