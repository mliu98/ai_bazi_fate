# AI 八字姻缘测试 - 测试文档

## 项目信息
- **项目名称**: ai-bazi-fate
- **项目位置**: `D:\Projects\ai-bazi-1`
- **技术栈**: Vite + React + Tailwind CSS + Supabase
- **本地服务器**: http://localhost:5173/

---

## 页面结构

### 1. Home.tsx (首页)
**功能**: landing page，引导用户开始测算

**主要元素**:
- Logo/标题区域 (Sparkles图标 + "八字缘分测算" + 副标题)
- 4个功能介绍卡片 (传统八字/五行相合/AI智能/专属姻缘签)
- "你将获得" 列表 (缘分总分/五行分析/亮点解读/相处建议/姻缘签)
- CTA按钮 "开始测算" → 跳转 /activate

**UI组件**:
- Button (cta-button)
- Sparkles, Heart, Calendar, Star (lucide-react)
- 背景装饰 (❀ ✿ ❁ ✾ emoji)

**待测试/修改**:
- [ ] 标题文案是否需要调整
- [ ] 颜色主题是否满意
- [ ] 4个功能卡片内容
- [ ] "你将获得"列表内容
- [ ] CTA按钮样式

---

### 2. Activate.tsx (激活页面)
**功能**: 验证激活码

**主要元素**:
- 返回按钮
- 激活码输入框
- 激活按钮
- 提示信息 (需要激活码/3分钟获取报告)

**待测试/修改**:
- [ ] 激活码验证逻辑
- [ ] 错误提示文案
- [ ] 激活成功跳转逻辑

---

### 3. Input.tsx (输入页面)
**功能**: 收集用户和另一半的生日信息 + 问卷调查

**步骤1 - 生日信息**:
- 性别选择 (女生/男生) - RadioGroup
- 我的生日: 年/月/日/时辰 - Select下拉框
- 对方的生日: 年/月/日/时辰 - Select下拉框
- 年份范围: 2026 - 18岁 ~ 50年前
- 时辰选项: 子时~亥时 + "不知道"

**步骤2 - 问卷调查** (5个问题):
- q1: 你们相识的方式是？ (一见钟情/慢慢走进/网络相识/朋友介绍)
- q2: 你感觉你们之间更像？ (磁铁相吸/相似灵魂/互补拼图/还没感觉到)
- q3: 你们有「同步心灵」的瞬间吗？ (经常有/偶尔有/没有/不确定)
- q4: 对方对你来说像？ (太阳/月亮/北极星/流星)
- q5: 你们认识多久了？ (不到一个月/1-6个月/半年以上/还没在一起)

**UI组件**:
- Button, Label
- RadioGroup, RadioGroupItem
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- ArrowLeft, ArrowRight, User, Users (lucide-react)
- toast (sonner)

**待测试/修改**:
- [ ] 年份范围是否需要调整
- [ ] 问卷问题内容是否合适
- [ ] 问卷选项是否需要修改
- [ ] 表单验证逻辑
- [ ] 页面样式

---

### 4. Loading.tsx (加载页面)
**功能**: 显示测算中的加载动画

**主要元素**:
- 进度条/加载动画
- 测算提示文字
- 取消按钮 (可选)

**待测试/修改**:
- [ ] 加载动画样式
- [ ] 提示文案
- [ ] 加载时间 (模拟或实际API调用)

---

### 5. Result.tsx (结果页面)
**功能**: 展示八字合盘分析结果

**主要内容**:
- 缘分总分 + 八字等级评定
- 五行相合度分析
- 3-5条缘分亮点解读
- 实用恋爱相处建议
- 专属诗意姻缘签文
- 剩余次数显示

**Premium内容** (部分可见):
- warning: 警告/需要注意的地方
- timing: 最佳时机建议

**功能按钮**:
- 生成分享图片 (html2canvas)
- 复制分享文案
- 返回首页

**UI组件**:
- Button, Card
- Share2, Lock, Download, Home, Loader2 (lucide-react)
- toast (sonner)
- html2canvas (图片生成)

**待测试/修改**:
- [ ] 报告数据展示逻辑
- [ ] 分数计算显示
- [ ] 五行分析展示样式
- [ ] 亮点/建议列表
- [ ] 姻缘签样式
- [ ] 图片生成功能
- [ ] 复制分享功能
- [ ] Premium内容显示逻辑

---

### 6. Admin.tsx (管理页面)
**功能**: 管理员后台，查看激活码和使用记录

**主要元素**:
- 激活码管理 (生成/查看/删除)
- 使用记录列表
- 统计数据

**待测试/修改**:
- [ ] 管理员权限验证
- [ ] 激活码CRUD操作
- [ ] 使用记录展示
- [ ] 数据统计

---

## UI组件库 (components/ui/)

### 表单组件
- [ ] button.tsx - 按钮
- [ ] input.tsx - 输入框
- [ ] textarea.tsx - 多行文本
- [ ] select.tsx - 下拉选择
- [ ] radio-group.tsx - 单选组
- [ ] checkbox.tsx - 复选框
- [ ] switch.tsx - 开关
- [ ] slider.tsx - 滑动条
- [ ] input-otp.tsx -  OTP输入

### 布局组件
- [ ] card.tsx - 卡片
- [ ] dialog.tsx - 弹窗
- [ ] drawer.tsx - 抽屉
- [ ] sheet.tsx - 侧边栏
- [ ] popover.tsx - 气泡卡片
- [ ] tooltip.tsx - 提示框
- [ ] scroll-area.tsx - 滚动区域
- [ ] resizable.tsx - 可调整大小
- [ ] separator.tsx - 分隔线
- [ ] avatar.tsx - 头像

### 反馈组件
- [ ] alert.tsx - 警告框
- [ ] alert-dialog.tsx - 确认对话框
- [ ] progress.tsx - 进度条
- [ ] skeleton.tsx - 骨架屏
- [ ] sonner.tsx - 吐司通知
- [ ] toast.tsx - 通知

### 导航组件
- [ ] navigation-menu.tsx - 导航菜单
- [ ] menu.tsx / menubar.tsx - 菜单
- [ ] breadcrumb.tsx - 面包屑
- [ ] pagination.tsx - 分页
- [ ] tabs.tsx - 标签页

### 数据展示
- [ ] table.tsx - 表格
- [ ] chart.tsx - 图表
- [ ] badge.tsx - 徽章
- [ ] calendar.tsx - 日历

### 其他
- [ ] aspect-ratio.tsx - 宽高比
- [ ] collapsible.tsx - 折叠
- [ ] hover-card.tsx - 悬停卡片
- [ ] toggle.tsx - 切换

---

## 测试环境

### 本地测试
- URL: http://localhost:5173/
- 需要先启动: `npm run dev`

### 测试账号
- 激活码: (待添加)
- 管理员: (待添加)

---

## 修改建议记录

### 需要确认的事项
1. 首页标题/副标题文案
2. 功能卡片内容
3. 问卷问题是否合适
4. 颜色主题偏好
5. 是否需要添加更多字段

### 可能的需求
- [ ] 添加更多问卷问题
- [ ] 自定义颜色主题
- [ ] 分享图片样式定制
- [ ] 报告模板多样化
- [ ] 添加动画效果
