<template>
  <div class="page-container activate-page">
    <div class="header fade-in">
      <div class="logo">🔮</div>
      <h1>激活码</h1>
      <p class="subtitle">请输入您的激活码开始测算</p>
    </div>

    <div class="input-section glass-card fade-in">
      <van-field
        v-model="codeInput"
        placeholder="XXXX-XXXX"
        maxlength="9"
        :formatter="formatCode"
        @update:model-value="handleInput"
        class="code-input"
      >
        <template #left-icon>
          <span>🔑</span>
        </template>
      </van-field>

      <van-button 
        type="primary" 
        size="large" 
        round 
        :loading="loading"
        :disabled="codeInput.length < 9"
        @click="verifyCode"
        class="verify-btn"
      >
        开始测算
      </van-button>

      <van-button 
        type="default" 
        size="small" 
        text="没有激活码？"
        @click="showTip = true"
        class="tip-btn"
      />
    </div>

    <van-popup v-model:show="showTip" round>
      <div class="tip-popup">
        <p>关注小红书账号获取激活码</p>
        <p class="tip-account">@八字缘分测算</p>
      </div>
    </van-popup>

    <van-notify v-model:show="showError" type="danger">
      {{ errorMsg }}
    </van-notify>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session';
import { codeApi } from '../utils/api';

const router = useRouter();
const sessionStore = useSessionStore();

const codeInput = ref('');
const loading = ref(false);
const showTip = ref(false);
const showError = ref(false);
const errorMsg = ref('');

const formatCode = (value) => {
  // 移除非字母数字字符，转大写
  const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  // 每4位插入-
  if (cleaned.length > 4) {
    return cleaned.slice(0, 4) + '-' + cleaned.slice(4);
  }
  return cleaned;
};

const handleInput = (value) => {
  codeInput.value = formatCode(value);
};

const verifyCode = async () => {
  if (codeInput.value.length < 9) return;
  
  loading.value = true;
  try {
    const result = await codeApi.verify(codeInput.value);
    sessionStore.setCodeInfo({
      code: result.code,
      type: result.type,
      remaining: result.remaining
    });
    router.push('/input');
  } catch (error) {
    errorMsg.value = error.message;
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 3000);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.activate-page {
  justify-content: center;
  padding-top: 80px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 60px;
  margin-bottom: 16px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.input-section {
  padding: 32px 24px;
}

.code-input {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 24px;
  letter-spacing: 4px;
  text-align: center;
}

.verify-btn {
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.tip-btn {
  color: rgba(255, 255, 255, 0.6) !important;
}

.tip-popup {
  padding: 32px;
  text-align: center;
}

.tip-account {
  font-size: 18px;
  font-weight: 600;
  color: #ff6b6b;
  margin-top: 12px;
}
</style>
