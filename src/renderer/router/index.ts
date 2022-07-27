import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/home/index.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/about/index.vue'),
    },
    {
      path: '/subscribes',
      name: 'subscribes',
      component: () => import('@/views/subscribes/index.vue'),
      // children: [
      //   {
      //     path: 'edit',
      //     name: 'subscribes-edit',
      //     component: () => import('@/views/site/SiteEditView.vue'),
      //   }
      // ]
    },
    {
      path: '/download',
      name: 'download',
      component: () => import('@/views/download/index.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/favorites/index.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/index.js'),
    }
  ],
})

export default router
