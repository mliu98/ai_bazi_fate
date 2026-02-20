const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const baziEngine = require('../services/baziEngine');
const aiService = require('../services/aiService');
const codeService = require('../services/codeService');

// 简易内存缓存（生产环境用 Redis）
const reportCache = new Map();

// POST /api/calculate - 生成报告
router.post('/calculate', auth, async (req, res) => {
  try {
    const { selfBirthday, partnerBirthday, selfGender, survey } = req.body;
    const codeInfo = req.codeInfo;

    // 校验参数
    if (!selfBirthday || !partnerBirthday || !selfGender || !survey) {
      return res.status(400).json({ error: '参数不完整' });
    }

    // 解析生日
    const parseBirthday = (b) => {
      const [year, month, day, hour] = b.split('-').map(Number);
      return { year, month, day, hour: hour || 12 };
    };

    const self = parseBirthday(selfBirthday);
    const partner = parseBirthday(partnerBirthday);

    // 计算八字
    const bazi1 = baziEngine.getBazi(self.year, self.month, self.day, self.hour);
    const bazi2 = baziEngine.getBazi(partner.year, partner.month, partner.day, partner.hour);

    // 计算五行和兼容性
    const wuxing1 = baziEngine.getWuxing(bazi1);
    const wuxing2 = baziEngine.getWuxing(bazi2);
    const compatibility = baziEngine.calcCompatibility(bazi1, bazi2);

    // 检查缓存（相同生日组合用缓存）
    const cacheKey = `${selfBirthday}-${partnerBirthday}-${codeInfo.type}`;
    let report = reportCache.get(cacheKey);

    if (!report) {
      // 调用 AI 生成报告
      const aiResult = await aiService.generateReport(
        { bazi1, bazi2, compatibility },
        survey,
        codeInfo.type
      );

      report = {
        bazi: {
          self: bazi1,
          partner: bazi2
        },
        wuxing: {
          self: wuxing1,
          partner: wuxing2
        },
        compatibility,
        highlights: aiResult.highlights || [],
        advice: aiResult.advice || [],
        sign: aiResult.sign || '缘分天注定',
        shareText: aiResult.share_text || '',
        warning: aiResult.warning,
        timing: aiResult.timing,
        createdAt: new Date().toISOString()
      };

      // 缓存（免费版不缓存 full 内容）
      if (codeInfo.type !== 'free') {
        reportCache.set(cacheKey, report);
      }
    }

    // 消耗激活码次数
    if (codeInfo.type !== 'unlimited') {
      await codeService.consumeCode(codeInfo.code);
    }

    // 记录测算（可选）
    // await supabase.from('calculations').insert({...})

    // 返回报告（免费版不含 warning/timing）
    const response = {
      score: compatibility.score,
      level: compatibility.level,
      bazi: report.bazi,
      wuxing: report.wuxing,
      wuxingSummary: compatibility.wuxing_relation,
      highlights: report.highlights,
      advice: report.advice,
      sign: report.sign,
      shareText: report.shareText,
      remaining: codeInfo.type === 'unlimited' ? 'unlimited' : codeInfo.remaining - 1
    };

    // 完整版额外返回
    if (codeInfo.type !== 'free') {
      response.warning = report.warning;
      response.timing = report.timing;
    }

    res.json(response);
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: '测算失败，请稍后重试' });
  }
});

module.exports = router;
