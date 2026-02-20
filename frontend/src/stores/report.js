import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useReportStore = defineStore('report', () => {
  const reportData = ref(null);
  const inputData = ref(null);

  function setReport(data) {
    reportData.value = data;
  }

  function setInputData(data) {
    inputData.value = data;
  }

  function clearReport() {
    reportData.value = null;
    inputData.value = null;
  }

  return {
    reportData,
    inputData,
    setReport,
    setInputData,
    clearReport
  };
});
