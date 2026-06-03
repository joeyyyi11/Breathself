<template>
  <button class="frap-btn" @click="$emit('click')" aria-label="新建笔记" title="新建笔记">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.frap-btn {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-green-accent);
  color: var(--color-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: var(--z-frap);
  box-shadow: var(--shadow-frap);
  transition: transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease, background var(--duration-fast) ease;
}

.frap-btn:hover {
  background: #006a42;
}

.frap-btn:active {
  transform: scale(0.95);
  box-shadow: var(--shadow-frap-active);
}

@media (max-width: 640px) {
  .frap-btn {
    right: 20px;
    bottom: 20px;
  }
}
</style>
