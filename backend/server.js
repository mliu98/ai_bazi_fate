require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const codeRoutes = require('./routes/code');
const calculateRoutes = require('./routes/calculate');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 配置
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 限流配置
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 5, // 每个 IP 最多 5 次
  message: { error: '请求过于频繁，请稍后再试' }
});

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: '验证次数过多，请稍后再试' }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/code', verifyLimiter, codeRoutes);
app.use('/api/calculate', limiter, calculateRoutes);
app.use('/api/admin', adminRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
