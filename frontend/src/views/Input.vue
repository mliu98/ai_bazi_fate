<template>
  <div class="page-container input-page">
    <div class="step-indicator">
      <span :class="{ active: step === 1 }">① 生日</span>
      <span class="line"></span>
      <span :class="{ active: step === 2 }">② 问卷</span>
    </div>

    <!-- Step 1: 生日输入 -->
    <div v-if="step === 1" class="step-content fade-in">
      <h2>填写生日信息</h2>
      
      <div class="birthday-section">
        <h3>我的生日</h3>
        <div class="picker-group">
          <van-field
            is-link
            readonly
            v-model="selfBirthday"
            placeholder="选择日期"
            @click="showSelfDatePicker = true"
          />
          <van-popup v-model:show="showSelfDatePicker" round position="bottom">
            <van-date-picker
              v-model="selfDate"
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="onSelfDateConfirm"
              @cancel="showSelfDatePicker = false"
            />
          </van-popup>
        </div>
        
        <div class="picker-group">
          <van-field
            is-link
            readonly
            v-model="selfHour"
            placeholder="选择时辰"
            @click="showSelfHourPicker = true"
          />
          <van-popup v-model:show="showSelfHourPicker" round position="bottom">
            <van-picker
              :columns="hourColumns"
              @confirm="onSelfHourConfirm"
              @cancel="showSelfHourPicker = false"
            />
          </van-popup>
        </div>

        <div class="gender-select">
          <van-button 
            :type="selfGender === 'female' ? 'primary' : 'default'"
            round 
            @click="selfGender = 'female'"
          >
            👧 我是女生
          </van-button>
          <van-button 
            :type="selfGender === 'male' ? 'primary' : 'default'"
            round 
            @click="selfGender = 'male'"
          >
            👦 我是男生
          </van-button>
        </div>
      </div>

      <div class="birthday-section">
        <h3>TA的生日</h3>
        <div class="picker-group">
          <van-field
            is-link
            readonly
            v-model="partnerBirthday"
            placeholder="选择日期"
            @click="showPartnerDatePicker = true"
          />
          <van-popup v-model:show="showPartnerDatePicker" round position="bottom">
            <van-date-picker
              v-model="partnerDate"
              :min-date="minDate"
              :max-date="maxDate"
              @confirm="onPartnerDateConfirm"
              @cancel="showPartnerDatePicker = false"
            />
          </van-popup>
        </div>
        
        <div class="picker-group">
          <van-field
            is-link
            readonly
            v-model="partnerHour"
            placeholder="选择时辰"
            @click="showPartnerHourPicker = true"
          />
          <van-popup v-model:show="showPartnerHourPicker" round position="bottom">
            <van-picker
              :columns="hourColumns"
              @confirm="onPartnerHourConfirm"
              @cancel="showPartnerHourPicker = false"
            />
          </van-popup>
        </div>
      </div>

      <van-button 
        type="primary" 
        size="large" 
        round 
        :disabled="!canProceed"
        @click="goToStep2"
        class="next-btn"
      >
        下一步
      </van-button>
    </div>

    <!-- Step 2: 问卷 -->
    <div v-if="step === 2" class="step-content fade-in">
      <h2>玄学小问卷</h2>
      <p class="question-count">第 {{ currentQuestion + 1 }} / {{ questions.length }} 题</p>

      <div class="question-card glass-card">
        <p class="question-text">{{ questions[currentQuestion].text }}</p>
        <div class="options">
          <van-button
            v-for="(option, idx) in questions[currentQuestion].options"
            :key="idx"
            :type="answers[currentQuestion] === idx ? 'primary' : 'default'"
            size="large"
            round
            class="option-btn"
            @click="selectAnswer(idx)"
          >
            {{ option }}
          </van-button>
        </div>
      </div>

      <div class="nav-buttons">
        <van-button 
          v-if="currentQuestion > 0"
          round 
          @click="prevQuestion"
        >
          上一题
        </van-button>
        <van-button 
          v-if="currentQuestion < questions.length - 1"
          type="primary"
          round 
          :disabled="answers[currentQuestion] === undefined"
          @click="nextQuestion"
        >
          下一题
        </van-button>
        <van-button 
          v-if="currentQuestion === questions.length - 1"
          type="primary"
          round 
          :disabled="!allAnswered"
          @click="submit"
        >
          开始测算
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useReportStore } from '../stores/report';

const router = useRouter();
const reportStore = useReportStore();

const step = ref(1);
const currentQuestion = ref(0);

// 日期选择
const minDate = new Date(1970, 0, 1);
const maxDate = new Date(2010, 11, 31);

const selfDate = ref(['1990', '01', '01']);
const partnerDate = ref(['1990', '01', '01']);
const selfBirthday = ref('');
const partnerBirthday = ref('');

const showSelfDatePicker = ref(false);
const showPartnerDatePicker = ref(false);

const selfHour = ref('');
const partnerHour = ref('');
const showSelfHourPicker = ref(false);
const showPartnerHourPicker = ref(false);

const hourColumns = [
  '子时（23-1点）', '丑时（1-3点）', '寅时（3-5点）', '卯时（5-7点）',
  '辰时（7-9点）', '巳时（9-11点）', '午时（11-13点）', '未时（13-15点）',
  '申时（15-17点）', '酉时（17-19点）', '戌时（19-21点）', '亥时（21-23点）',
  '不知道'
];

const selfGender = ref('');

// 问卷
const questions = [
  {
    text: '你们相识的方式是？',
    options: ['一见钟情', '慢慢走进', '网络相识', '朋友介绍']
  },
  {
    text: '你感觉你们之间更像？',
    options: ['磁铁相吸', '相似灵魂', '互补拼图', '还没感觉到']
  },
  {
    text: '你们有"同步心灵"的瞬间吗？',
    options: ['经常有', '偶尔有', '没有', '不确定']
  },
  {
    text: '对方对你来说像？',
    options: ['太阳', '月亮', '北极星', '流星']
  },
  {
    text: '你们认识多久了？',
    options: ['不到一个月', '1-6个月', '半年以上', '还没在一起']
  }
];

const answers = ref({});

// 计算属性
const canProceed = computed(() => {
  return selfBirthday.value && selfHour.value && 
         partnerBirthday.value && partnerHour.value && 
         selfGender.value;
});

const allAnswered = computed(() => {
  return answers.value[0] !== undefined &&
         answers.value[1] !== undefined &&
         answers.value[2] !== undefined &&
         answers.value[3] !== undefined &&
         answers.value[4] !== undefined;
});

// 方法
const onSelfDateConfirm = ({ selectedValues }) => {
  selfBirthday.value = selectedValues.join('-');
  showSelfDatePicker.value = false;
};

const onPartnerDateConfirm = ({ selectedValues }) => {
  partnerBirthday.value = selectedValues.join('-');
  showPartnerDatePicker.value = false;
};

const onSelfHourConfirm = ({ selectedOptions }) => {
  const hour = selectedOptions[0];
  selfHour.value = hour === '不知道' ? '12' : String(hourColumns.indexOf(hour));
  showSelfHourPicker.value = false;
};

const onPartnerHourConfirm = ({ selectedOptions }) => {
  const hour = selectedOptions[0];
  partnerHour.value = hour === '不知道' ? '12' : String(hourColumns.indexOf(hour));
  showPartnerHourPicker.value = false;
};

const goToStep2 = () => {
  step.value = 2;
};

const selectAnswer = (idx) => {
  answers.value[currentQuestion.value] = idx;
};

const prevQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
  }
};

const nextQuestion = () => {
  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++;
  }
};

const submit = () => {
  // 保存输入数据
  reportStore.setInputData({
    selfBirthday: selfBirthday.value + '-' + selfHour.value,
    partnerBirthday: partnerBirthday.value + '-' + partnerHour.value,
    selfGender: selfGender.value,
    survey: answers.value
  });
  
  router.push('/loading');
};
</script>

<style scoped>
.input-page {
  padding-top: 40px;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.step-indicator .active {
  color: #ffd700;
  font-weight: 600;
}

.step-indicator .line {
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.step-content {
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  font-size: 20px;
  margin-bottom: 24px;
}

.question-count {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.birthday-section {
  margin-bottom: 24px;
}

.birthday-section h3 {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.picker-group {
  margin-bottom: 12px;
}

.gender-select {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.gender-select button {
  flex: 1;
}

.next-btn {
  margin-top: 32px;
}

.question-card {
  padding: 24px;
  margin-bottom: 24px;
}

.question-text {
  font-size: 16px;
  text-align: center;
  margin-bottom: 24px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  justify-content: flex-start;
}

.nav-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
