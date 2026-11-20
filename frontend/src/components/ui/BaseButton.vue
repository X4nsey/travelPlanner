<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  fullWidth: false,
});

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-55 disabled:cursor-not-allowed active:scale-[0.99]';

  const variants: Record<string, string> = {
    primary:
      'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 dark:text-white focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm hover:shadow',
    secondary:
      'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 focus:ring-sky-400 dark:focus:ring-teal-500/40',
    outline:
      'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 dark:hover:border-slate-600 focus:ring-slate-300 dark:focus:ring-slate-600 shadow-sm dark:shadow-none',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 dark:text-white focus:ring-rose-500 shadow-sm',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white focus:ring-slate-300 dark:focus:ring-slate-600',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth ? 'w-full' : '',
  ].join(' ');
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
  >
    <Loader2 v-if="loading" class="w-4 h-4 animate-spin shrink-0" />
    <slot name="icon" v-else />
    <slot />
  </button>
</template>
