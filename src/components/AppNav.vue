<template>
  <header class="app-nav">
    <div class="nav-inner">
      <router-link to="/board" class="brand">
        <svg viewBox="0 0 32 32" class="brand-mark" aria-hidden="true">
          <circle cx="16" cy="16" r="13" fill="#00754A" />
          <circle cx="16" cy="16" r="6" fill="#f2f0eb" />
        </svg>
        <span class="brand-text">BreathSelf</span>
      </router-link>

      <nav class="nav-links">
        <button class="btn btn-ghost" @click="$router.push('/')" title="重新进入呼吸引导">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 4 21 10 15 10" />
          </svg>
          呼吸空间
        </button>

        <button v-if="showNewColumn" class="btn btn-outline" @click="$emit('new-column')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新分类
        </button>

        <router-link to="/settings" class="btn btn-ghost" title="设置">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 4.27 16.97l.06-.06A1.65 1.65 0 0 0 4.66 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.03 4.27l.06.06A1.65 1.65 0 0 0 9 4.66a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.31.2.65.2 1s-.07.69-.2 1z" />
          </svg>
          设置
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineProps({
  showNewColumn: { type: Boolean, default: true }
})
defineEmits(['new-column'])
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  background: var(--color-white);
  box-shadow: var(--shadow-nav);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 14px var(--outer-gutter);
  max-width: 1600px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .nav-inner {
    padding: 16px var(--outer-gutter-md);
  }
}
@media (min-width: 1024px) {
  .nav-inner {
    padding: 18px var(--outer-gutter-lg);
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-starbucks-green);
  font-weight: 700;
  font-size: 1.7rem;
  letter-spacing: var(--letter-spacing-normal);
}

.brand-mark {
  width: 30px;
  height: 30px;
}

.brand-text {
  white-space: nowrap;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .brand-text {
    display: none;
  }
  .nav-links .btn {
    padding: 6px 12px;
    font-size: 1.25rem;
  }
}
</style>
