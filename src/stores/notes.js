import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'awareness_notes_v1'

// 6 个情绪标签：语义色严格按需求来
export const EMOTIONS = [
  { id: 'anxiety',   name: '焦虑', color: '#D2691E' },
  { id: 'calm',      name: '平静', color: '#1E3932' },
  { id: 'gratitude', name: '感恩', color: '#cba258' },
  { id: 'awareness', name: '觉察', color: '#006241' },
  { id: 'sad',       name: '悲伤', color: '#2b5148' },
  { id: 'energy',    name: '活力', color: '#00754A' }
]

export const getEmotion = (id) =>
  EMOTIONS.find((e) => e.id === id) || EMOTIONS[3]

const DAY_MS = 24 * 60 * 60 * 1000

/** 示例笔记距今天数：3 / 10 / 45 / 200 / 400 天前（对应不同时间范围筛选） */
const DEMO_NOTE_DAYS_AGO = {
  'n-1': 3,
  'n-2': 10,
  'n-3': 45,
  'n-4': 200,
  'n-5': 400
}

const demoNoteCreatedAt = (noteId) =>
  Date.now() - (DEMO_NOTE_DAYS_AGO[noteId] ?? 10) * DAY_MS

const syncDemoNoteTimes = (columns) => {
  columns.forEach((col) => {
    col.notes.forEach((note) => {
      if (DEMO_NOTE_DAYS_AGO[note.id] != null) {
        note.createdAt = demoNoteCreatedAt(note.id)
      }
    })
  })
  return columns
}

// 预置 4 列分类 + 示例笔记
const defaultState = () => ({
  columns: [
    {
      id: 'col-work',
      name: '工作焦虑',
      color: '#D2691E',
      notes: [
        {
          id: 'n-1',
          title: '周报压力',
          body: '又是周五，想到周报要总结一周成果就有点紧张。其实这周做的事不少，只是觉得"不够亮眼"。',
          emotion: 'anxiety',
          opacity: 70,
          createdAt: demoNoteCreatedAt('n-1')
        },
        {
          id: 'n-2',
          title: '一次失败的会议',
          body: '今天的提案没被采纳，回看自己讲解时其实节奏太快了，下次可以提前演练一遍。',
          emotion: 'awareness',
          opacity: 40,
          createdAt: demoNoteCreatedAt('n-2')
        }
      ]
    },
    {
      id: 'col-rel',
      name: '关系',
      color: '#2b5148',
      notes: [
        {
          id: 'n-3',
          title: '和妈妈通了电话',
          body: '听到她声音很高兴，下次主动多打一些。',
          emotion: 'gratitude',
          opacity: 50,
          createdAt: demoNoteCreatedAt('n-3')
        }
      ]
    },
    {
      id: 'col-aware',
      name: '觉察记录',
      color: '#006241',
      notes: [
        {
          id: 'n-4',
          title: '我在害怕什么',
          body: '深夜回看一天，发现很多焦虑其实是"怕被评价"。看见即是松动的开始。',
          emotion: 'awareness',
          opacity: 60,
          createdAt: demoNoteCreatedAt('n-4')
        }
      ]
    },
    {
      id: 'col-thanks',
      name: '感恩',
      color: '#cba258',
      notes: [
        {
          id: 'n-5',
          title: '早晨的咖啡',
          body: '冲了一杯手冲，第一口的香气让人安静下来。',
          emotion: 'gratitude',
          opacity: 30,
          createdAt: demoNoteCreatedAt('n-5')
        }
      ]
    }
  ],
  settings: {
    breathDuration: 60,
    theme: 'starbucks',
    lastSeen: 0
  }
})

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    if (!parsed.columns || !Array.isArray(parsed.columns)) return defaultState()
    return {
      columns: syncDemoNoteTimes(parsed.columns),
      settings: { ...defaultState().settings, ...(parsed.settings || {}) }
    }
  } catch (e) {
    console.warn('[notes] localStorage 解析失败，使用默认数据', e)
    return defaultState()
  }
}

const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useNotesStore = defineStore('notes', () => {
  const initial = loadFromStorage()
  const columns = ref(initial.columns)
  const settings = ref(initial.settings)

  // ---- 持久化 ----
  watch(
    [columns, settings],
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ columns: columns.value, settings: settings.value })
        )
      } catch (e) {
        console.warn('[notes] 写入 localStorage 失败', e)
      }
    },
    { deep: true }
  )

  // ---- Getters ----
  const totalNotes = computed(() =>
    columns.value.reduce((sum, c) => sum + c.notes.length, 0)
  )

  // ---- Column CRUD ----
  const addColumn = ({ name = '新分类', color = '#00754A' } = {}) => {
    columns.value.push({
      id: uid('col'),
      name,
      color,
      notes: []
    })
  }

  const updateColumn = (id, payload) => {
    const col = columns.value.find((c) => c.id === id)
    if (col) Object.assign(col, payload)
  }

  const deleteColumn = (id) => {
    const idx = columns.value.findIndex((c) => c.id === id)
    if (idx !== -1) columns.value.splice(idx, 1)
  }

  // ---- Note CRUD ----
  const addNote = (columnId, payload) => {
    const col = columns.value.find((c) => c.id === columnId)
    if (!col) return null
    const note = {
      id: uid('n'),
      title: payload.title?.trim() || '无标题',
      body: payload.body || '',
      emotion: payload.emotion || 'awareness',
      opacity: Number(payload.opacity) || 50,
      createdAt: Date.now()
    }
    col.notes.push(note)
    return note
  }

  const updateNote = (columnId, noteId, payload) => {
    const col = columns.value.find((c) => c.id === columnId)
    if (!col) return
    const note = col.notes.find((n) => n.id === noteId)
    if (note) Object.assign(note, payload)
  }

  const deleteNote = (columnId, noteId) => {
    const col = columns.value.find((c) => c.id === columnId)
    if (!col) return
    const idx = col.notes.findIndex((n) => n.id === noteId)
    if (idx !== -1) col.notes.splice(idx, 1)
  }

  const moveNote = (fromColId, noteId, toColId) => {
    if (fromColId === toColId) return
    const from = columns.value.find((c) => c.id === fromColId)
    const to = columns.value.find((c) => c.id === toColId)
    if (!from || !to) return
    const idx = from.notes.findIndex((n) => n.id === noteId)
    if (idx === -1) return
    const [note] = from.notes.splice(idx, 1)
    to.notes.push(note)
  }

  // ---- Settings ----
  const updateSettings = (payload) => {
    settings.value = { ...settings.value, ...payload }
  }

  // ---- Data Import / Export ----
  const exportJSON = () => {
    return JSON.stringify(
      { columns: columns.value, settings: settings.value, exportedAt: Date.now() },
      null,
      2
    )
  }

  const importJSON = (jsonText) => {
    const parsed = JSON.parse(jsonText)
    if (!parsed.columns || !Array.isArray(parsed.columns)) {
      throw new Error('数据格式不正确：缺少 columns 字段')
    }
    columns.value = parsed.columns
    if (parsed.settings) {
      settings.value = { ...defaultState().settings, ...parsed.settings }
    }
  }

  const resetAll = () => {
    const fresh = defaultState()
    columns.value = fresh.columns
    settings.value = fresh.settings
  }

  const clearAllNotes = () => {
    columns.value.forEach((c) => {
      c.notes = []
    })
  }

  return {
    columns,
    settings,
    totalNotes,
    addColumn,
    updateColumn,
    deleteColumn,
    addNote,
    updateNote,
    deleteNote,
    moveNote,
    updateSettings,
    exportJSON,
    importJSON,
    resetAll,
    clearAllNotes
  }
})
