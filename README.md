# 八字缘分测算 (AI Bazi)

> 基于八字合婚的 AI 算命 Web 应用

## 技术栈

- **前端**: Vue 3 + Vite + Vant + Pinia
- **后端**: Node.js + Express
- **数据库**: Supabase (PostgreSQL)
- **AI**: DeepSeek API

## 项目结构

```
ai-bazi-1/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── views/    # 页面组件
│   │   ├── components/
│   │   ├── stores/   # Pinia 状态管理
│   │   ├── utils/   # 工具函数
│   │   └── router/
│   └── ...
├── backend/           # 后端项目
│   ├── routes/       # API 路由
│   ├── services/    # 业务逻辑
│   ├── middleware/  # 中间件
│   └── server.js
└── ...
```

## 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_key

# Admin
ADMIN_PASSWORD=your_admin_password
```

### 3. 创建数据库

在 Supabase 后台执行 SQL：

```sql
CREATE TABLE activation_codes (
  code VARCHAR(9) PRIMARY KEY,
  type TEXT CHECK (type IN ('free', 'full', 'unlimited')),
  total_uses INT NOT NULL,
  used_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  note TEXT
);
```

### 4. 启动开发服务器

```bash
# 后端 (端口 3000)
cd backend
npm start

# 前端 (端口 5173)
cd frontend
npm run dev
```

## 功能

- ✅ 激活码系统（体验码/完整码/无限码）
- ✅ 八字计算引擎
- ✅ 合婚评分
- ✅ AI 报告生成
- ✅ 运营后台
- ✅ 分享功能

## 部署

详见开发文档中的 PHASE 9 部署指南。

## License

MIT
