<template>
  <div class="page-container result-page">
    <!-- 分数动画 -->
    <div class="score-section fade-in">
      <div class="score-circle">
        <span class="score-number">{{ animatedScore }}</span>
        <span class="score-label">分</span>
      </div>
      <div class="level-badge" :style="{ background: levelColor }">
        {{ report.level }}
      </div>
    </div>

    <!-- 五行相合 -->
    <div class="wuxing-section glass-card fade-in">
      <h3>🔥 五行相合</h3>
      <div class="wuxing-comparison">
        <div class="person">
          <p class="person-label">你的五行</p>
          <div class="wuxing-tags">
            <span 
              v-for="(count, w) in report.wuxing.self" 
              :key="w"
              class="wuxing-tag"
              :style="{ background: getWuxingColor(w) }"
            >
              {{ w }}: {{ count }}
            </span>
          </div>
        </div>
        <div class="vs">VS</div>
        <div class="person">
          <p class="person-label">TA的五行</p>
          <div class="wuxing-tags">
            <span 
              v-for="(count, w) in report.wuxing.partner" 
              :key="w"
              class="wuxing-tag"
              :style="{ background: getWuxingColor(w) }"
            >
              {{ w }}: {{ count }}
            </span>
          </div>
        </div>
      </div>
      <p class="wuxing-summary">{{ report.wuxingSummary || '五行互补，天作之合' }}</p>
    </div>

    <!-- 缘分亮点 -->
    <div class="highlights-section glass-card fade-in">
      <h3>✨ 缘分亮点</h3>
      <div class="highlight-list">
        <div v-for="(item, i) in report.highlights" :key="i" class="highlight-item">
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 相处建议 -->
    <div class="advice-section glass-card fade-in">
      <h3>💕 相处建议</h3>
      <div class="advice-list">
        <div v-for="(item, i) in report.advice" :key="i" class="advice-item">
          <span class="advice-num">{{ i + 1 }}</span>
          {{ item }}
        </div>
      </div>
    </div>

    <!-- 专属姻缘签 -->
    <div class="sign-section glass-card fade-in">
      <h3>🌸 专属姻缘签</h3>
      <div class="sign-card">
        <p class="sign-text">"{{ report.sign }}"</p>
      </div>
      <van-button size="small" round @click="copySign" class="copy-btn">
        复制签文
      </van-button>
    </div>

    <!-- 付费墙 -->
    <div v-if="isPaywalled" class="paywall-section fade-in">
      <div class="paywall-blur">
        <div class="paywall-content">
          <div class="lock-icon">🔒</div>
          <h4>完整版</h4>
          <p>解锁「隐患预警」+「最佳发展时机」</p>
          <van-button type="primary" round @click="showPaywall = true">
            获取完整版
          </van-button>
        </div>
      </div>
    </div>

    <!-- 完整版内容 -->
    <div v-if="!isPaywalled && report.warning" class="warning-section glass-card fade-in">
      <h3>⚠️ 隐患预警</h3>
      <p>{{ report.warning }}</p>
    </div>

    <div v-if="!isPaywalled && report.timing" class="timing-section glass-card fade-in">
      <h3>📅 最佳发展时机</h3>
      <p>{{ report.timing }}</p>
    </div>

    <!-- 分享区域 -->
    <div class="share-section glass-card fade-in">
      <h3>📤 分享结果</h3>
      <van-button round @click="generateShareImage">
        保存图片
      </van-button>
      <van-button round @click="copyShareText">
        复制文案
      </van-button>
    </div>

    <!-- 付费弹窗 -->
    <van-popup v-model:show="showPaywall" round>
      <div class="paywall-popup">
        <h4>获取完整版</h4>
        <p>私信小红书 <span class="highlight">@八字缘分测算</span></p>
        <p>备注「完整码」</p>
        <p class="price">¥9.9 获取 3 次完整测算</p>
      </div>
    </van-popup>

    <van-toast v-model:show="showToast" :message="toastMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportStore } from '../stores/report';
import { useSessionStore } from '../stores/session';

const reportStore = useReportStore();
const sessionStore = useSessionStore();

const report = computed(() => reportStore.reportData || {});
const animatedScore = ref(0);
const showPaywall = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const levelColor = computed(() => {
  const colors = {
    '天作之合': '#FFD700',
    '良缘相伴': '#FF69B4',
    '有缘相守': '#87CEEB',
    '平淡有缘': '#90EE90'
  };
  return colors[report.value.level] || '#999';
});

const isPaywalled = computed(() => {
  return sessionStore.codeType === 'free' && report.value.warning;
});

// 分数动画
onMounted(() => {
  const target = report.value.score || 0;
  const duration = 1500;
  const steps = 30;
  const increment = target / steps;
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      animatedScore.value = target;
      clearInterval(timer);
    } else {
      animatedScore.value = Math.floor(current);
    }
  }, duration / steps);
});

const getWuxingColor = (w) => {
  const colors = {
    '金': '#FFD700',
    '木': '#90EE90',
    '水': '#87CEEB',
    '火': '#FF6B6B',
    '土': '#D2691E'
  };
  return colors[w] || '#999';
};

const copySign = async () => {
  try {
    await navigator.clipboard.writeText(report.value.sign);
    toastMessage.value = '已复制签文';
    showToast.value = true;
  } catch (e) {
    toastMessage.value = '复制失败';
    showToast.value = true;
  }
};

const copyShareText = async () => {
  try {
    const text = `我和他测出来缘分值 ${report.value.score}%，${report.value.level}！姻缘签说："${report.value.sign}"，去测测你的：[链接]`;
    await navigator.clipboard.writeText(text);
    toastMessage.value = '已复制文案';
    showToast.value = true;
  } catch (e) {
    toastMessage.value = '复制失败';
    showToast.value = true;
  }
};

const generateShareImage = () => {
  toastMessage.value = '图片生成功能开发中';
  showToast.value = true;
};
</script>

<style scoped>
.result-page {
  padding: 40px 20px;
}

.score-section {
  text-align: center;
  margin-bottom: 32px;
}

.score-circle {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 107, 0.2));
  border: 3px solid #ffd700;
  margin-bottom: 16px;
}

.score-number {
  font-size: 64px;
  font-weight: bold;
  color: #ffd700;
}

.score-label {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

.level-badge {
  display: inline-block;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #ffd700;
}

.wuxing-section {
  margin-bottom: 16px;
}

.wuxing-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.person {
  flex: 1;
}

.person-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.wuxing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.wuxing-tag {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #1a1a2e;
  font-weight: 600;
}

.vs {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  padding: 0 12px;
}

.wuxing-summary {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.highlight-list, .advice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item, .advice-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.advice-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 8px;
}

.sign-section {
  margin-bottom: 16px;
  text-align: center;
}

.sign-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1));
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.sign-text {
  font-size: 18px;
  font-style: italic;
  line-height: 1.8;
}

.paywall-section {
  margin: 16px 0;
}

.paywall-blur {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.lock-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.paywall-content h4 {
  font-size: 18px;
  margin-bottom: 8px;
}

.paywall-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.paywall-popup {
  padding: 32px;
  text-align: center;
}

.paywall-popup h4 {
  font-size: 20px;
  margin-bottom: 16px;
}

.paywall-popup .highlight {
  color: #ff6b6b;
  font-weight: 600;
}

.paywall-popup .price {
  font-size: 18px;
  color: #ffd700;
  font-weight: 600;
  margin-top: 16px;
}

.share-section {
  margin-top: 16px;
  text-align: center;
}

.share-section h3 {
  margin-bottom: 16px;
}

.share-section button {
  margin: 0 8px;
}
</style>
