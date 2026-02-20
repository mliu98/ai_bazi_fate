import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSessionStore = defineStore('session', () => {
  const code = ref(localStorage.getItem('code') || '');
  const codeType = ref(localStorage.getItem('codeType') || '');
  const remaining = ref(parseInt(localStorage.getItem('remaining')) || 0);

  const isActivated = computed(() => !!code.value && remaining.value > 0);

  function setCodeInfo(codeInfo) {
    code.value = codeInfo.code;
    codeType.value = codeInfo.type;
    remaining.value = codeInfo.remaining;
    
    localStorage.setItem('code', codeInfo.code);
    localStorage.setItem('codeType', codeInfo.type);
    localStorage.setItem('remaining', codeInfo.remaining);
  }

  function clearSession() {
    code.value = '';
    codeType.value = '';
    remaining.value = 0;
    
    localStorage.removeItem('code');
    localStorage.removeItem('codeType');
    localStorage.removeItem('remaining');
  }

  function decrementRemaining() {
    if (remaining.value > 0) {
      remaining.value--;
      localStorage.setItem('remaining', remaining.value);
    }
  }

  return {
    code,
    codeType,
    remaining,
    isActivated,
    setCodeInfo,
    clearSession,
    decrementRemaining
  };
});
