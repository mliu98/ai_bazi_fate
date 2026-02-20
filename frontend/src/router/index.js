import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/activate',
    name: 'Activate',
    component: () => import('../views/Activate.vue')
  },
  {
    path: '/input',
    name: 'Input',
    component: () => import('../views/Input.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/loading',
    name: 'Loading',
    component: () => import('../views/Loading.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/Result.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const code = localStorage.getItem('code');
  
  if (to.meta.requiresAuth && !code) {
    next('/activate');
  } else {
    next();
  }
});

export default router;
