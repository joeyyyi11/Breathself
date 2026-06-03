import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'breath',
    component: () => import('@/views/BreathView.vue'),
    meta: { title: '呼吸引导 · 觉察笔记' }
  },
  {
    path: '/board',
    name: 'board',
    component: () => import('@/views/BoardView.vue'),
    meta: { title: '我的笔记面板 · 觉察笔记' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置 · 觉察笔记' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/board'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
