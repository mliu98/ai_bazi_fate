/**
 * DeepSeek AI 服务
 */

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

/**
 * 生成 AI 报告
 * @param {object} baziData - 八字数据
 * @param {object} surveyAnswers - 问卷答案
 * @param {string} codeType - 激活码类型 (free/full/unlimited)
 */
async function generateReport(baziData, surveyAnswers, codeType) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  // 构建用户输入
  const bazi1 = `${baziData.bazi1.year.gan}${baziData.bazi1.year.zhi} ${baziData.bazi1.month.gan}${baziData.bazi1.month.zhi} ${baziData.bazi1.day.gan}${baziData.bazi1.day.zhi} ${baziData.bazi1.hour.gan}${baziData.bazi1.hour.zhi}`;
  const bazi2 = `${baziData.bazi2.year.gan}${baziData.bazi2.year.zhi} ${baziData.bazi2.month.gan}${baziData.bazi2.month.zhi} ${baziData.bazi2.day.gan}${baziData.bazi2.day.zhi} ${baziData.bazi2.hour.gan}${baziData.bazi2.hour.zhi}`;

  const userInput = `
八字信息：
- 男方：${bazi1}
- 女方：${bazi2}

五行关系：${baziData.compatibility.wuxing_relation}
缘分得分：${baziData.compatibility.score}（满分99）
等级：${baziData.compatibility.level}
亮点标签：${baziData.compatibility.highlights.join('、')}
隐患标签：${baziData.compatibility.warnings.join('、')}
问卷答案：${JSON.stringify(surveyAnswers)}

请输出 JSON：
{
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "advice": ["建议1", "建议2", "建议3"],
  "sign": "专属姻缘签全文",
  "share_text": "分享文案",
  "warning": "隐患预警内容",
  "timing": "最佳发展时机描述"
}
`;

  // 系统提示
  const systemPrompt = `你是一位精通八字合婚的命理师，擅长用现代年轻人听得懂的语言解读命盘。
语言要求：口语化、有温度、带情绪感，初中语文水平即可读懂，适当使用 emoji。
禁止出现：「毫无缘分」「注定分离」「必然失败」等极端负面表述。
必须以 JSON 格式输出，不要输出任何其他内容。`;

  // 免费版不生成 warning 和 timing
  const needWarning = codeType !== 'free';

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // 解析 JSON
    let report;
    try {
      report = JSON.parse(content);
    } catch (e) {
      // 尝试从 markdown 代码块中提取
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      report = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : {};
    }

    // 内容过滤
    if (report.warning) {
      report.warning = filterNegative(report.warning);
    }

    // 免费版不返回 warning 和 timing
    if (!needWarning) {
      delete report.warning;
      delete report.timing;
    }

    return report;
  } catch (error) {
    console.error('AI generate report error:', error);
    throw error;
  }
}

/**
 * 过滤负面内容
 */
function filterNegative(text) {
  const negativeWords = ['毫无缘分', '注定分离', '必然失败', '完全不合', '不可能'];
  let filtered = text;
  
  negativeWords.forEach(word => {
    filtered = filtered.replace(word, '需要更多包容');
  });
  
  return filtered;
}

module.exports = {
  generateReport
};
