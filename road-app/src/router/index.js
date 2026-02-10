import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuthStore } from '@/stores/auth';
import TabsLayout from '@/views/TabsLayout.vue';

const routes = [
  {
    path: '/',
    redirect: '/tabs/map'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/tabs/',
    component: TabsLayout,
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/MapView.vue')
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/ReportView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'edit-report/:id',
        name: 'EditReport',
        component: () => import('@/views/EditReportView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'edit-point/:id',
        name: 'EditPoint',
        component: () => import('@/views/EditPointView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/ReportsListView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Map' });
  } else {
    next();
  }
});

export default router;