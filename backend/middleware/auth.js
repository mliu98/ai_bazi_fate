const codeService = require('../services/codeService');

/**
 * 激活码校验中间件
 * 请求头需携带 X-Activation-Code
 */
async function auth(req, res, next) {
  try {
    const code = req.headers['x-activation-code'];

    if (!code) {
      return res.status(401).json({ error: '请输入激活码' });
    }

    const result = await codeService.verifyCode(code);

    if (!result.valid) {
      return res.status(401).json(result);
    }

    // 将 code 信息注入请求对象
    req.codeInfo = {
      code,
      type: result.type,
      remaining: result.remaining
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: '校验失败，请稍后重试' });
  }
}

module.exports = auth;
