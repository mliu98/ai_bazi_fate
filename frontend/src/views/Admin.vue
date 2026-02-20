<template>
  <div class="page-container admin-page">
    <div v-if="!isAuthenticated" class="login-section">
      <h2>管理员登录</h2>
      <van-field
        v-model="password"
        type="password"
        placeholder="请输入管理员密码"
        @keyup.enter="login"
      />
      <van-button type="primary" size="large" round @click="login" :loading="loading">
        登录
      </van-button>
    </div>

    <div v-else class="admin-content">
      <div class="admin-header">
        <h2>运营后台</h2>
        <van-button size="small" @click="logout">退出</van-button>
      </div>

      <van-tabs v-model:active="activeTab" class="admin-tabs">
        <van-tab title="生成激活码">
          <div class="tab-content">
            <van-field v-model.number="generateConfig.count" type="digit" label="数量" placeholder="10" />
            <van-field v-model="generateConfig.type" is-link readonly label="类型" @click="showTypePicker = true" />
            <van-field v-model.number="generateConfig.days" type="digit" label="有效天数" placeholder="30" />
            <van-field v-model="generateConfig.note" label="备注" placeholder="可选" />
            
            <van-button type="primary" size="large" round @click="generateCodes" :loading="generating">
              生成
            </van-button>

            <div v-if="generatedCodes.length" class="generated-list">
              <h4>生成的激活码：</h4>
              <van-button size="small" @click="copyCodes">一键复制</van-button>
              <div class="codes">
                <span v-for="code in generatedCodes" :key="code" class="code-tag">
                  {{ code }}
                </span>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="激活码列表">
          <div class="tab-content">
            <div class="filter-row">
              <van-button size="small" :type="filterType === '' ? 'primary' : 'default'" @click="filterType = ''">
                全部
              </van-button>
              <van-button size="small" :type="filterType === 'free' ? 'primary' : 'default'" @click="filterType = 'free'">
                体验码
              </van-button>
              <van-button size="small" :type="filterType === 'full' ? 'primary' : 'default'" @click="filterType = 'full'">
                完整码
              </van-button>
            </div>
            
            <van-loading v-if="loading" />
            
            <div v-else class="code-table">
              <div v-for="item in filteredCodes" :key="item.code" class="code-row">
                <span class="code">{{ item.code }}</span>
                <span class="type">{{ item.type }}</span>
                <span class="usage">{{ item.used_count }}/{{ item.total_uses }}</span>
                <van-button size="small" type="danger" @click="revokeCode(item.code)" :disabled="item.used_count >= item.total_uses">
                  作废
                </van-button>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="数据统计">
          <div class="tab-content">
            <div class="stats-grid">
              <div class="stat-card glass-card">
                <p class="stat-value">{{ stats.total }}</p>
                <p class="stat-label">总码数</p>
              </div>
              <div class="stat-card glass-card">
                <p class="stat-value">{{ stats.used }}</p>
                <p class="stat-label">已使用</p>
              </div>
              <div class="stat-card glass-card">
                <p class="stat-value">{{ stats.remaining }}</p>
                <p class="stat-label">剩余</p>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-popup v-model:show="showTypePicker" round position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-toast v-model:show="showToast" :message="toastMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { adminApi } from '../utils/api';

const password = ref('');
const loading = ref(false);
const generating = ref(false);
const isAuthenticated = ref(false);
const activeTab = ref(0);
const generatedCodes = ref([]);
const codesList = ref([]);

const filterType = ref('');
const showTypePicker = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const generateConfig = ref({
  count: 10,
  type: 'free',
  days: 30,
  note: ''
});

const typeColumns = [
  { text: '体验码 (1次)', value: 'free' },
  { text: '完整码 (3次)', value: 'full' },
  { text: '无限码', value: 'unlimited' }
];

const stats = computed(() => {
  const total = codesList.value.length;
  const used = codesList.value.filter(c => c.used_count >= c.total_uses).length;
  const remaining = total - used;
  return { total, used, remaining };
});

const filteredCodes = computed(() => {
  if (!filterType.value) return codesList.value;
  return codesList.value.filter(c => c.type === filterType.value);
});

onMounted(() => {
  // 检查 session
  const savedPassword = sessionStorage.getItem('adminPassword');
  if (savedPassword === 'adminmm133') {
    isAuthenticated.value = true;
    loadCodes();
  }
});

const login = async () => {
  if (password.value !== 'adminmm133') {
    toastMessage.value = '密码错误';
    showToast.value = true;
    return;
  }
  
  sessionStorage.setItem('adminPassword', password.value);
  isAuthenticated.value = true;
  loadCodes();
};

const logout = () => {
  sessionStorage.removeItem('adminPassword');
  isAuthenticated.value = false;
  password.value = '';
};

const onTypeConfirm = ({ selectedOptions }) => {
  generateConfig.value.type = selectedOptions[0].value;
  showTypePicker.value = false;
};

const generateCodes = async () => {
  generating.value = true;
  try {
    const token = sessionStorage.getItem('adminPassword');
    const result = await adminApi.generateCodes({
      count: generateConfig.value.count,
      type: generateConfig.value.type,
      expiresInDays: generateConfig.value.days,
      note: generateConfig.value.note
    }, token);
    
    generatedCodes.value = result.codes;
    toastMessage.value = `成功生成 ${result.count} 个`;
    showToast.value = true;
    
    loadCodes();
  } catch (error) {
    toastMessage.value = error.message;
    showToast.value = true;
  } finally {
    generating.value = false;
  }
};

const loadCodes = async () => {
  loading.value = true;
  try {
    const token = sessionStorage.getItem('adminPassword');
    const result = await adminApi.listCodes({ limit: 100 }, token);
    codesList.value = result.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const revokeCode = async (code) => {
  try {
    const token = sessionStorage.getItem('adminPassword');
    await adminApi.revokeCode(code, token);
    toastMessage.value = '已作废';
    showToast.value = true;
    loadCodes();
  } catch (error) {
    toastMessage.value = error.message;
    showToast.value = true;
  }
};

const copyCodes = async () => {
  const text = generatedCodes.value.join('\n');
  await navigator.clipboard.writeText(text);
  toastMessage.value = '已复制';
  showToast.value = true;
};
</script>

<style scoped>
.admin-page {
  padding-top: 40px;
}

.login-section {
  max-width: 300px;
  margin: 0 auto;
}

.login-section h2 {
  text-align: center;
  margin-bottom: 24px;
}

.login-section button {
  margin-top: 16px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.admin-tabs {
  background: transparent;
}

.tab-content {
  padding: 16px;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.code-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.code-row .code {
  flex: 1;
  font-family: monospace;
}

.code-row .type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.code-row .usage {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.generated-list {
  margin-top: 24px;
}

.generated-list h4 {
  margin-bottom: 12px;
}

.codes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.code-tag {
  font-family: monospace;
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 24px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
