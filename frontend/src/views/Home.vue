<template>
  <div class="page-container home-page">
    <div class="logo-section fade-in">
      <div class="logo">🔮</div>
      <h1>八字缘分测算</h1>
      <p class="subtitle">输入生日，看看你们是不是天作之合</p>
    </div>

    <div class="action-section">
      <van-button type="primary" size="large" round @click="goToActivate" class="start-btn">
        开始测算
      </van-button>
    </div>

    <div class="features-section glass-card fade-in">
      <div class="feature-item">
        <span class="feature-icon">✨</span>
        <span>AI 智能分析</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">📊</span>
        <span>八字合婚评分</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🎁</span>
        <span>专属姻缘签</span>
      </div>
    </div>

    <p class="disclaimer">本报告仅供娱乐参考</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToActivate = () => {
  router.push('/activate');
};
</script>

<style scoped>
.home-page {
  justify-content: center;
  padding-top: 60px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 80px;
  margin-bottom: 16px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.action-section {
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
  margin-bottom: 40px;
}

.start-btn {
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b6b, #ffd700);
  border: none;
}

.features-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.feature-icon {
  font-size: 24px;
}

.disclaimer {
  position: fixed;
  bottom: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
