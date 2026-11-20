import type { Directive, DirectiveBinding } from 'vue';

export interface RevealDirectiveOptions {
  delay?: number;
  threshold?: number;
}

type RevealBindingValue = number | RevealDirectiveOptions | undefined;

const observerMap = new WeakMap<HTMLElement, IntersectionObserver>();

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolveOptions(value: RevealBindingValue): { delay: number; threshold: number } {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { delay: Math.max(0, value), threshold: 0.08 };
  }
  if (value && typeof value === 'object') {
    return {
      delay: typeof value.delay === 'number' && Number.isFinite(value.delay) ? Math.max(0, value.delay) : 0,
      threshold:
        typeof value.threshold === 'number' && Number.isFinite(value.threshold)
          ? Math.min(1, Math.max(0, value.threshold))
          : 0.08,
    };
  }
  return { delay: 0, threshold: 0.08 };
}

export const vReveal: Directive<HTMLElement, RevealBindingValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<RevealBindingValue>) {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      prefersReducedMotion()
    ) {
      el.classList.add('reveal-visible');
      return;
    }

    const { delay, threshold } = resolveOptions(binding.value);
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    el.classList.add('reveal-hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.remove('reveal-hidden');
            el.classList.add('reveal-visible');
            observer.disconnect();
            observerMap.delete(el);
            break;
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -32px 0px',
      }
    );

    observerMap.set(el, observer);
    observer.observe(el);
  },

  unmounted(el: HTMLElement) {
    const observer = observerMap.get(el);
    if (observer) {
      observer.disconnect();
      observerMap.delete(el);
    }
  },
};
