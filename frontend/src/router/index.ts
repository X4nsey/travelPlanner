import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'TravelPlanner — Планирование путешествий' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true, title: 'Вход — TravelPlanner' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true, title: 'Регистрация — TravelPlanner' },
    },
    {
      path: '/explore',
      name: 'explore-world',
      component: () => import('@/views/ExploreWorldView.vue'),
      meta: { title: 'Исследовать мир — TravelPlanner' },
    },
    {
      path: '/countries',
      name: 'countries-catalog',
      component: () => import('@/views/CountriesCatalogView.vue'),
      meta: { title: 'Страны мира — TravelPlanner' },
    },
    {
      path: '/countries/:slug',
      name: 'country-detail',
      component: () => import('@/views/CountryDetailView.vue'),
      meta: { title: 'О стране — TravelPlanner' },
    },
    {
      path: '/diagnostics/photos',
      name: 'photo-diagnostics',
      component: () => import('@/views/PhotoDiagnosticsView.vue'),
      meta: { title: 'Диагностика фотографий — TravelPlanner' },
    },
    {
      path: '/favorites',
      name: 'favorite-countries',
      component: () => import('@/views/FavoriteCountriesView.vue'),
      meta: { requiresAuth: true, title: 'Избранные страны — TravelPlanner' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardOverviewView.vue'),
      meta: { requiresAuth: true, title: 'Личный кабинет — TravelPlanner' },
    },
    {
      path: '/trips',
      name: 'trips-list',
      component: () => import('@/views/TripsListView.vue'),
      meta: { requiresAuth: true, title: 'Мои поездки — TravelPlanner' },
    },
    {
      path: '/trips/new',
      name: 'trip-create',
      component: () => import('@/views/TripFormView.vue'),
      meta: { requiresAuth: true, title: 'Создать поездку — TravelPlanner' },
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: () => import('@/views/TripDetailView.vue'),
      meta: { requiresAuth: true, title: 'Детали поездки — TravelPlanner' },
    },
    {
      path: '/trips/:id/edit',
      name: 'trip-edit',
      component: () => import('@/views/TripFormView.vue'),
      meta: { requiresAuth: true, title: 'Редактировать поездку — TravelPlanner' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true, title: 'Профиль — TravelPlanner' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }

  if (to.meta.title) {
    document.title = String(to.meta.title);
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
