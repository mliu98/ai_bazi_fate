<template>
  <div class="page-container loading-page">
    <div class="loading-content">
      <div class="bazi-animation">
        <div class="gan-list">
          <span v-for="(g, i) in tiangan" :key="'g'+i" class="gan" :class="{ active: ganIndex === i }">
            {{ g }}
          </span>
        </div>
        <div class="zhi-list">
          <span v-for="(z, i) in dizhi" :key="'z'+i" class="zhi" :class="{ active: zhiIndex === i }">
            {{ z }}
          </span>
        </div>
      </div>

      <div class="quote-card glass-card">
        <p class="quote-text">{{ quotes[quoteIndex] }}</p>
      </div>

      <p class="loading-text">{{ statusText }}</p>
    </div>

    <van-notify v-model:show="showError" type="danger">
      {{ errorMsg }}
    </van-notify>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useReportStore } from '../stores/report';
import { useSessionStore } from '../stores/session';
import { calculateApi } from '../utils/api';

const router = useRouter();
const reportStore = useReportStore();
const sessionStore = useSessionStore();

const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const quotes = [
  '缘分天注定，半分由不得...',
  '八字相合，命运相连...',
  '天数有定，姻缘早分...',
  '冥冥之中自有定数...',
  '百年修得同船渡...'
];

const ganIndex = ref(0);
const zhiIndex = ref(0);
const quoteIndex = ref(0);
const statusText = ref('正在排盘...');
const showError = ref(false);
const errorMsg = ref('');

let ganInterval, zhiInterval, quoteInterval;

onMounted(() => {
  // 天干动画
  ganInterval = setInterval(() => {
    ganIndex.value = (ganIndex.value + 1) % 10;
  }, 150);

  // 地支动画
  zhiInterval = setInterval(() => {
    zhiIndex.value = (zhiIndex.value + 1) % 12;
  }, 200);

  // 语录切换
  quoteInterval = setInterval(() => {
    quoteIndex.value = (quoteIndex.value + 1) % quotes.length;
  }, 1500);

  // 开始测算
  setTimeout(doCalculate, 1000);
});

onUnmounted(() => {
  clearInterval(ganInterval);
  clearInterval(zhiInterval);
  clearInterval(quoteInterval);
});

const doCalculate = async () => {
  statusText.value = '正在测算...';
  
  try {
    const inputData = reportStore.inputData;
    const result = await calculateApi.calculate(inputData);
    
    // 保存报告
    reportStore.setReport(result);
    sessionStore.decrementRemaining();
    
    // 至少显示3秒
    setTimeout(() => {
      router.push('/result');
    }, 3000);
  } catch (error) {
    statusText.value = '测算失败';
    errorMsg.value = error.message || '请稍后重试';
    showError.value = true;
  }
};
</script>

<style scoped>
.loading-page {
  justify-content: center;
}

.loading-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bazi-animation {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.gan-list, .zhi-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gan, .zhi {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.gan.active, .zhi.active {
  color: #ffd700;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.quote-card {
  padding: 24px;
  margin-bottom: 40px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-style: italic;
}

.loading-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
