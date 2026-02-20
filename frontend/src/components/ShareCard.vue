<template>
  <div class="share-card" ref="cardRef">
    <div class="card-content">
      <div class="card-header">
        <h1>🔮 八字缘分测算</h1>
      </div>
      
      <div class="score-display">
        <div class="score-circle">
          <span class="score">{{ score }}</span>
          <span class="label">分</span>
        </div>
        <div class="level-badge">{{ level }}</div>
      </div>
      
      <div class="sign-display">
        <p class="sign-text">"{{ sign }}"</p>
      </div>
      
      <div class="card-footer">
        <p>扫码测你的缘分</p>
        <div class="qrcode" ref="qrRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  score: { type: Number, default: 0 },
  level: { type: String, default: '' },
  sign: { type: String, default: '' },
  url: { type: String, default: '' }
});

const cardRef = ref(null);
const qrRef = ref(null);

onMounted(() => {
  if (props.url && qrRef.value) {
    QRCode.toCanvas(qrRef.value, props.url, { 
      width: 100,
      margin: 1,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      }
    });
  }
});

const generateImage = () => {
  return new Promise((resolve, reject) => {
    if (!cardRef.value) {
      reject(new Error('Card ref not found'));
      return;
    }
    
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(cardRef.value, {
        width: 1080,
        height: 1080,
        scale: 2,
        backgroundColor: '#1a1a2e',
        useCORS: true
      }).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      }).catch(reject);
    }).catch(reject);
  });
};

const downloadImage = async () => {
  try {
    const url = await generateImage();
    const link = document.createElement('a');
    link.download = '我的缘分测算.png';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error('Generate image error:', e);
    return false;
  }
};

defineExpose({
  downloadImage,
  generateImage
});
</script>

<style scoped>
.share-card {
  width: 1080px;
  height: 1080px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-family: 'Noto Serif SC', serif;
}

.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.card-header h1 {
  font-size: 56px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 60px 0;
}

.score-circle {
  width: 360px;
  height: 360px;
  border-radius: 50%;
  border: 8px solid #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.1);
}

.score {
  font-size: 140px;
  font-weight: bold;
  color: #ffd700;
}

.label {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 8px;
}

.level-badge {
  margin-top: 24px;
  padding: 12px 36px;
  background: linear-gradient(135deg, #ff6b6b, #ffd700);
  border-radius: 30px;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a2e;
}

.sign-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.sign-text {
  font-size: 40px;
  font-style: italic;
  text-align: center;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
}

.card-footer {
  text-align: center;
  padding-bottom: 40px;
}

.card-footer p {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
}

.qrcode {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
}
</style>
