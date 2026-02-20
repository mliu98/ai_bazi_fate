const express = require('express');
const router = express.Router();
const codeService = require('../services/codeService');

// POST /api/code/verify - 验证激活码（不消耗次数）
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '请输入激活码' });
    }

    // 格式校验
    const formattedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (formattedCode.length !== 8) {
      return res.status(400).json({ error: '激活码格式错误' });
    }

    const result = await codeService.verifyCode(formattedCode);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    res.json({
      valid: true,
      code: formattedCode,
      type: result.type,
      remaining: result.remaining
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: '验证失败，请稍后重试' });
  }
});

module.exports = router;
