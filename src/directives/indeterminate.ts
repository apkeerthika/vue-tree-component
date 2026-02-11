import type { Directive } from 'vue';

export const vIndeterminate: Directive<HTMLInputElement, boolean> = {
  mounted(el, binding) {
    el.indeterminate = binding.value;
  },
  updated(el, binding) {
    el.indeterminate = binding.value;
  }
};