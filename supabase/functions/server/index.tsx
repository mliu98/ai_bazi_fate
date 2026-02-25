import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

// Helper function to generate activation code
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}`;
}

// Helper function to calculate BaZi (八字)
function calculateBaZi(year: number, month: number, day: number, hour?: number) {
  // Simplified BaZi calculation
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const wuXing = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  
  const yearGan = tianGan[(year - 4) % 10];
  const yearZhi = diZhi[(year - 4) % 12];
  const monthGan = tianGan[month % 10];
  const monthZhi = diZhi[month % 12];
  const dayGan = tianGan[day % 10];
  const dayZhi = diZhi[day % 12];
  
  let hourGan = '';
  let hourZhi = '';
  if (hour !== undefined) {
    hourGan = tianGan[hour % 10];
    hourZhi = diZhi[(Math.floor(hour / 2) + 1) % 12];
  }
  
  const element = wuXing[(year - 4) % 10];
  
  return {
    year: `${yearGan}${yearZhi}`,
    month: `${monthGan}${monthZhi}`,
    day: `${dayGan}${dayZhi}`,
    hour: hour !== undefined ? `${hourGan}${hourZhi}` : '时辰未知',
    element
  };
}

// Calculate compatibility score
function calculateCompatibility(bazi1: any, bazi2: any) {
  let score = 60; // Base score
  
  // Element compatibility
  const elementPairs: Record<string, Record<string, number>> = {
    '木': { '木': 5, '火': 10, '土': -5, '金': -10, '水': 10 },
    '火': { '木': 10, '火': 5, '土': 10, '金': -5, '水': -10 },
    '土': { '木': -5, '火': 10, '土': 5, '金': 10, '水': -10 },
    '金': { '木': -10, '火': -5, '土': 10, '金': 5, '水': 10 },
    '水': { '木': 10, '火': -10, '土': -10, '金': 10, '水': 5 }
  };
  
  score += elementPairs[bazi1.element]?.[bazi2.element] || 0;
  
  // Year compatibility
  const yearGan1 = bazi1.year[0];
  const yearGan2 = bazi2.year[0];
  if (yearGan1 === yearGan2) score += 8;
  
  // Random variation for uniqueness
  score += Math.floor(Math.random() * 20) - 5;
  
  return Math.min(99, Math.max(55, score));
}

// Call DeepSeek API to generate report
async function generateReportWithAI(data: any) {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!apiKey) {
    console.log('DeepSeek API key not found, using fallback content');
    return generateFallbackReport(data);
  }

  const prompt = `你是一位精通八字合婚的命理师，擅长用现代年轻人听得懂的语言解读命盘。

用户信息：
- 双方八字：${data.user.bazi.year} ${data.user.bazi.month} ${data.user.bazi.day} / ${data.partner.bazi.year} ${data.partner.bazi.month} ${data.partner.bazi.day}
- 五行属性：${data.user.bazi.element} vs ${data.partner.bazi.element}
- 缘分得分：${data.score}分
- 相识方式：${data.questionnaire.q1}
- 关系感觉：${data.questionnaire.q2}
- 心灵同步：${data.questionnaire.q3}
- 对方定位：${data.questionnaire.q4}
- 认识时长：${data.questionnaire.q5}

请生成一份温暖、准确、有情感的八字缘分报告，包含以下内容（请以JSON格式输出）：

{
  "highlights": ["3-5条正向的八字分析亮点，每条30-50字"],
  "advice": ["3-5条实用的恋爱相处建议，每条30-50字"],
  "sign": "一段诗意的专属姻缘签文案，80-120字，带情感共鸣",
  "warning": "1-2条需要注意的潜在冲突点，60-80字",
  "timing": "基于八字推算的最佳发展时机建议，60-80字",
  "shareText": "适合发小红书的分享文案，约100字"
}

要求：
1. 语言风格年轻化、口语化，避免生僻术语
2. 正向积极，但不夸张
3. 结合问卷答案增加个性化
4. 姻缘签要有诗意和韵味
5. 分享文案要吸引人点击`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的八字命理师，擅长用现代语言解读传统命理。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', await response.text());
      return generateFallbackReport(data);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateFallbackReport(data);
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return generateFallbackReport(data);
  }
}

// Fallback report generation (when API is not available)
function generateFallbackReport(data: any) {
  const { score, user, partner, questionnaire } = data;
  
  const highlights = [
    `你们的五行属性${user.bazi.element}与${partner.bazi.element}相合度很高，天生就有一种互相吸引的磁场`,
    `从八字来看，你们的相识方式「${questionnaire.q1}」暗合了姻缘线的走向`,
    `双方日柱相合，代表在情感交流上能够心有灵犀，互相理解对方的需求`,
    score >= 85 ? '年柱六合，意味着家庭观念相近，对未来规划有共同愿景' : '月柱相生，日常相处中能够互相扶持，感情稳定增长'
  ];

  const advice = [
    `${user.bazi.element}属性的你在感情中需要更多安全感，对方可以多主动表达爱意`,
    `你们之间更像「${questionnaire.q2}」，建议保持这种节奏，不要急于推进关系`,
    `沟通是你们关系的关键，遇到分歧时要用温和的方式表达想法`,
    `可以一起做一些两人都感兴趣的事情，增进默契和共同回忆`
  ];

  const sign = `${questionnaire.q4 === '太阳' ? '你是月，他是阳，' : ''}缘起${questionnaire.q5}，情动心间。八字相合${score}分，虽非完美却是真心。${user.bazi.element}${partner.bazi.element}相生，如春风化雨，润物无声。愿你们珍惜当下，共赴未来，情深不负相思意，携手同行白首时。`;

  const warning = score < 75 
    ? `你们在处理冲突时可能会有不同的方式，需要学会互相理解对方的沟通习惯，避免冷战。`
    : `偶尔会在生活小事上产生分歧，建议多站在对方角度思考，包容彼此的小毛病。`;

  const timing = `根据流年推算，2026年春季（3-5月）和秋季（9-11月）是你们关系发展的良好时机，适合确定关系或进入下一阶段。`;

  const shareText = `我和TA测了八字缘分，得分${score}分！命理师说我们${user.bazi.element}${partner.bazi.element}相合，${score >= 85 ? '天作之合' : '良缘可期'}～姻缘签更是把我看哭了💕 想知道你和TA的缘分吗？`;

  return { highlights, advice, sign, warning, timing, shareText };
}

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-661ddcd5/health", (c) => {
  return c.json({ status: "ok" });
});

// Verify activation code
app.post("/make-server-661ddcd5/api/code/verify", async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code || !/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
      return c.json({ error: '激活码格式错误' }, 400);
    }

    const codeData = await kv.get(`code:${code}`);
    
    if (!codeData) {
      return c.json({ error: '激活码不存在或已失效' }, 404);
    }

    const { type, total_uses, used_count, expires_at } = codeData;

    // Check expiration
    if (expires_at && new Date(expires_at) < new Date()) {
      return c.json({ error: '激活码已过期' }, 400);
    }

    // Check usage
    if (used_count >= total_uses) {
      return c.json({ error: '激活码使用次数已用完' }, 400);
    }

    return c.json({
      valid: true,
      type,
      remaining: total_uses - used_count
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return c.json({ error: '验证失败' }, 500);
  }
});

// Generate report
app.post("/make-server-661ddcd5/api/calculate", async (c) => {
  try {
    const data = await c.req.json();
    const { code, user, partner, questionnaire } = data;

    // Verify code
    const codeData = await kv.get(`code:${code}`);
    if (!codeData || codeData.used_count >= codeData.total_uses) {
      return c.json({ error: '激活码无效或已用完' }, 400);
    }

    // Calculate BaZi
    const userBazi = calculateBaZi(user.year, user.month, user.day, user.hour);
    const partnerBazi = calculateBaZi(partner.year, partner.month, partner.day, partner.hour);

    // Calculate score
    const score = calculateCompatibility(userBazi, partnerBazi);

    // Generate AI report
    const aiReport = await generateReportWithAI({
      score,
      user: { ...user, bazi: userBazi },
      partner: { ...partner, bazi: partnerBazi },
      questionnaire
    });

    // Update code usage
    await kv.set(`code:${code}`, {
      ...codeData,
      used_count: codeData.used_count + 1
    });

    // Save report
    const reportId = `report:${code}:${Date.now()}`;
    await kv.set(reportId, {
      code,
      user,
      partner,
      questionnaire,
      score,
      userBazi,
      partnerBazi,
      report: aiReport,
      created_at: new Date().toISOString()
    });

    return c.json({
      score,
      level: score >= 90 ? '天作之合' : score >= 80 ? '良缘相伴' : score >= 70 ? '平淡有缘' : '需要努力',
      userBazi,
      partnerBazi,
      report: {
        highlights: aiReport.highlights,
        advice: aiReport.advice,
        sign: aiReport.sign,
        shareText: aiReport.shareText
      },
      isPremium: codeData.type === 'full' || codeData.type === 'unlimited'
    });
  } catch (error) {
    console.error('Error calculating:', error);
    return c.json({ error: '计算失败，请重试' }, 500);
  }
});

// Get full report (premium content)
app.post("/make-server-661ddcd5/api/report/full", async (c) => {
  try {
    const { code } = await c.req.json();

    const codeData = await kv.get(`code:${code}`);
    if (!codeData) {
      return c.json({ error: '激活码无效' }, 400);
    }

    if (codeData.type === 'free') {
      return c.json({ error: '需要完整版激活码' }, 403);
    }

    // Get latest report for this code
    const reports = await kv.getByPrefix(`report:${code}:`);
    if (reports.length === 0) {
      return c.json({ error: '未找到报告' }, 404);
    }

    const latestReport = reports[reports.length - 1];
    const { report } = latestReport;

    return c.json({
      warning: report.warning,
      timing: report.timing
    });
  } catch (error) {
    console.error('Error getting full report:', error);
    return c.json({ error: '获取失败' }, 500);
  }
});

// Admin: Generate codes
app.post("/make-server-661ddcd5/api/admin/codes/generate", async (c) => {
  try {
    const adminToken = c.req.header('Authorization')?.split(' ')[1];
    const correctToken = Deno.env.get('ADMIN_TOKEN') || 'admin123';
    
    if (adminToken !== correctToken) {
      return c.json({ error: '未授权' }, 401);
    }

    const { type, count } = await c.req.json();
    
    const totalUses = type === 'free' ? 1 : type === 'full' ? 3 : 9999;
    const codes = [];

    for (let i = 0; i < count; i++) {
      const code = generateCode();
      const codeData = {
        code,
        type,
        total_uses: totalUses,
        used_count: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      await kv.set(`code:${code}`, codeData);
      codes.push(code);
    }

    return c.json({ codes });
  } catch (error) {
    console.error('Error generating codes:', error);
    return c.json({ error: '生成失败' }, 500);
  }
});

// Admin: List codes
app.get("/make-server-661ddcd5/api/admin/codes/list", async (c) => {
  try {
    const adminToken = c.req.header('Authorization')?.split(' ')[1];
    const correctToken = Deno.env.get('ADMIN_TOKEN') || 'admin123';
    
    if (adminToken !== correctToken) {
      return c.json({ error: '未授权' }, 401);
    }

    const codes = await kv.getByPrefix('code:');
    
    return c.json({ codes });
  } catch (error) {
    console.error('Error listing codes:', error);
    return c.json({ error: '获取失败' }, 500);
  }
});

Deno.serve(app.fetch);