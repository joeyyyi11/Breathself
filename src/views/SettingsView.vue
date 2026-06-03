<template>
  <div class="settings-page">
    <AppNav :show-new-column="false" />

    <main class="settings-main container">
      <header class="page-head">
        <button class="back-btn" @click="$router.push('/board')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回面板
        </button>
        <h1>设置</h1>
        <p class="page-sub">所有数据都保存在你的浏览器本地，离线可用。</p>
      </header>

      <!-- 呼吸时长 -->
      <section class="card setting-card">
        <h2>默认呼吸时长</h2>
        <p class="card-desc">下次进入呼吸引导页时的默认时长。</p>
        <div class="duration-btns">
          <button
            v-for="d in presets"
            :key="d.value"
            class="btn btn-outline"
            :class="{ 'is-active': breathDuration === d.value }"
            @click="onSelectDuration(d.value)"
          >
            {{ d.label }}
          </button>
        </div>
        <div class="custom-row">
          <span class="label-inline">自定义</span>
          <input
            v-model.number="customSec"
            type="number"
            min="30"
            max="600"
            step="10"
            class="input custom-input"
          />
          <span class="custom-unit">秒</span>
          <button class="btn btn-ghost btn-sm" @click="applyCustom">应用</button>
        </div>
      </section>

      <!-- 主题 -->
      <section class="card setting-card">
        <h2>主题</h2>
        <p class="card-desc">当前主题：Starbucks 暖奶油 + 四级绿。</p>
        <div class="theme-row">
          <label class="theme-card is-active">
            <span class="theme-dot" style="background: #00754A" />
            <div>
              <strong>Starbucks 默认</strong>
              <span>暖奶油画布，四级绿系</span>
            </div>
          </label>
          <div class="theme-card is-locked">
            <span class="theme-dot" style="background: #d0d0d0" />
            <div>
              <strong>更多主题</strong>
              <span>敬请期待 ✨</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据备份 -->
      <section class="card setting-card">
        <h2>数据备份</h2>
        <p class="card-desc">导出当前所有笔记和设置为 JSON 文件；或从备份恢复。</p>
        <div class="btn-row">
          <button class="btn btn-primary" @click="onExport">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出 JSON
          </button>
          <label class="btn btn-outline">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导入 JSON
            <input
              type="file"
              accept="application/json"
              hidden
              @change="onImport"
            />
          </label>
        </div>
        <p v-if="msg" class="msg" :class="msgType">{{ msg }}</p>
      </section>

      <!-- 危险区 -->
      <section class="card setting-card danger">
        <h2>危险操作</h2>
        <p class="card-desc">清空将会移除你所有的分类和笔记，且无法恢复。</p>
        <div class="btn-row">
          <button class="btn btn-danger" @click="onClearAll">清空全部数据</button>
          <button class="btn btn-ghost" @click="onResetDemo">恢复示例数据</button>
        </div>
      </section>

      <footer class="meta">
        <p>Breathself v0.1 · 数据存储于 localStorage</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import AppNav from '@/components/AppNav.vue'

const router = useRouter()
const store = useNotesStore()

const presets = [
  { label: '1 分钟', value: 60 },
  { label: '3 分钟', value: 180 },
  { label: '5 分钟', value: 300 }
]

const breathDuration = computed(() => store.settings.breathDuration)
const customSec = ref(store.settings.breathDuration || 60)

const onSelectDuration = (sec) => {
  store.updateSettings({ breathDuration: sec })
  customSec.value = sec
  flashMsg('已保存默认时长', 'ok')
}

const applyCustom = () => {
  const v = Math.max(30, Math.min(600, customSec.value || 60))
  customSec.value = v
  store.updateSettings({ breathDuration: v })
  flashMsg(`已保存默认时长 ${v} 秒`, 'ok')
}

// ---- 数据 ----
const msg = ref('')
const msgType = ref('ok')
let msgTimer = null
const flashMsg = (text, type = 'ok') => {
  msg.value = text
  msgType.value = type
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { msg.value = '' }, 2400)
}

const onExport = () => {
  try {
    const json = store.exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const stamp = new Date().toISOString().slice(0, 10)
    a.download = `awareness-notes-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    flashMsg('已导出 JSON 文件', 'ok')
  } catch (e) {
    flashMsg('导出失败：' + e.message, 'err')
  }
}

const onImport = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!confirm('导入会覆盖当前所有数据，确定继续吗？')) {
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    try {
      store.importJSON(reader.result)
      flashMsg('导入成功 ✓', 'ok')
    } catch (err) {
      flashMsg('导入失败：' + err.message, 'err')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

const onClearAll = () => {
  if (!confirm('确定清空全部笔记（保留分类）吗？此操作不可撤销。')) return
  if (!confirm('再次确认：所有笔记将被永久删除。')) return
  store.clearAllNotes()
  flashMsg('已清空全部笔记', 'ok')
}

const onResetDemo = () => {
  if (!confirm('将恢复为初始示例数据，当前所有数据会被替换，确定吗？')) return
  store.resetAll()
  flashMsg('已恢复示例数据', 'ok')
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-neutral-warm);
}

.settings-main {
  padding-top: 32px;
  padding-bottom: 64px;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.page-head {
  margin-bottom: var(--space-2);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 1.3rem;
  color: var(--color-text-soft);
  margin-bottom: 12px;
  cursor: pointer;
  transition: color var(--duration-fast) ease;
}
.back-btn:hover { color: var(--color-green-accent); }

.page-head h1 {
  font-size: 2.6rem;
  color: var(--color-starbucks-green);
  font-weight: 600;
}

.page-sub {
  margin-top: 4px;
  color: var(--color-text-soft);
  font-size: 1.4rem;
}

.setting-card {
  padding: 20px 22px;
}

.setting-card h2 {
  font-size: 1.7rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 1.3rem;
  color: var(--color-text-soft);
  margin-bottom: 14px;
}

.duration-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.duration-btns .btn.is-active {
  background: var(--color-green-accent);
  color: var(--color-white);
  border-color: var(--color-green-accent);
}

.custom-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.label-inline {
  font-size: 1.3rem;
  color: var(--color-text-soft);
}
.custom-input {
  width: 86px;
  text-align: center;
}
.custom-unit {
  font-size: 1.3rem;
  color: var(--color-text-soft);
}
.btn-sm {
  font-size: 1.2rem;
  padding: 4px 12px;
  min-height: 28px;
}

.theme-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 520px) {
  .theme-row { grid-template-columns: 1fr; }
}
.theme-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  background: var(--color-neutral-cool);
  border: 1.5px solid transparent;
  cursor: pointer;
}
.theme-card.is-active {
  border-color: var(--color-green-accent);
  background: rgba(0, 117, 74, 0.06);
}
.theme-card.is-locked {
  opacity: 0.6;
  cursor: not-allowed;
}
.theme-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
.theme-card div { display: flex; flex-direction: column; }
.theme-card strong { font-size: 1.4rem; font-weight: 600; }
.theme-card span { font-size: 1.2rem; color: var(--color-text-soft); }

.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.msg {
  margin-top: 10px;
  font-size: 1.25rem;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
}
.msg.ok {
  background: rgba(0, 117, 74, 0.1);
  color: var(--color-green-accent);
}
.msg.err {
  background: rgba(200, 32, 20, 0.08);
  color: var(--color-red);
}

.danger h2 { color: var(--color-red); }

.meta {
  text-align: center;
  color: var(--color-text-faint);
  font-size: 1.2rem;
  padding: 24px 0 0;
}
</style>
