const express = require('express');
const router = express.Router();
const codeService = require('../services/codeService');

/**
 * 管理员密码校验中间件
 */
function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  
  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  
  next();
}

// 挂载管理员中间件
router.use(adminAuth);

// POST /api/admin/codes/generate - 批量生成激活码
router.post('/codes/generate', async (req, res) => {
  try {
    const { count, type, expiresInDays, note } = req.body;
    
    if (!count || !type) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    if (!['free', 'full', 'unlimited'].includes(type)) {
      return res.status(400).json({ error: '类型错误' });
    }
    
    const result = await codeService.batchGenerate(
      count,
      type,
      expiresInDays || 30,
      note || ''
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      success: true,
      codes: result.codes,
      count: result.codes.length
    });
  } catch (error) {
    console.error('Generate codes error:', error);
    res.status(500).json({ error: '生成失败' });
  }
});

// GET /api/admin/codes/list - 获取激活码列表
router.get('/codes/list', async (req, res) => {
  try {
    const { type, used, page = 1, limit = 20 } = req.query;
    
    const result = await codeService.listCodes({
      type,
      used: used === 'true' ? true : used === 'false' ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({
      data: result.data,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('List codes error:', error);
    res.status(500).json({ error: '查询失败' });
  }
});

// POST /api/admin/codes/revoke - 作废激活码
router.post('/codes/revoke', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '请提供激活码' });
    }
    
    const result = await codeService.revokeCode(code);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Revoke code error:', error);
    res.status(500).json({ error: '作废失败' });
  }
});

module.exports = router;
