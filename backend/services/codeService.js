const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端（需要环境变量）
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * 生成激活码格式 XXXX-XXXX
 * 排除 O/0/I/1 等易混字符
 */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part()}-${part()}`;
}

/**
 * 验证激活码
 * @param {string} code - 激活码
 * @returns {Promise<{valid: boolean, type: string|null, remaining: number, error: string|null}>}
 */
async function verifyCode(code) {
  if (!supabase) {
    return { valid: false, type: null, remaining: 0, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('activation_codes')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return { valid: false, type: null, remaining: 0, error: '激活码不存在' };
  }

  // 检查是否过期
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, type: null, remaining: 0, error: '激活码已过期' };
  }

  // 检查剩余次数
  const remaining = data.total_uses - data.used_count;
  if (remaining <= 0) {
    return { valid: false, type: null, remaining: 0, error: '激活码次数已用完' };
  }

  return { valid: true, type: data.type, remaining, error: null };
}

/**
 * 消耗激活码一次
 * @param {string} code - 激活码
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function consumeCode(code) {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  // 使用乐观锁防止并发问题
  const { data, error: fetchError } = await supabase
    .from('activation_codes')
    .select('*')
    .eq('code', code)
    .single();

  if (fetchError || !data) {
    return { success: false, error: '激活码不存在' };
  }

  const remaining = data.total_uses - data.used_count;
  if (remaining <= 0) {
    return { success: false, error: '激活码次数已用完' };
  }

  const { error: updateError } = await supabase
    .from('activation_codes')
    .update({ used_count: data.used_count + 1 })
    .eq('code', code)
    .eq('used_count', data.used_count); // 乐观锁条件

  if (updateError) {
    return { success: false, error: '消耗次数失败，请重试' };
  }

  return { success: true, error: null };
}

/**
 * 批量生成激活码
 * @param {number} count - 数量
 * @param {string} type - 类型 (free/full/unlimited)
 * @param {number} expiresInDays - 有效天数
 * @param {string} note - 备注
 * @returns {Promise<{codes: string[], error: string|null}>}
 */
async function batchGenerate(count, type, expiresInDays = 30, note = '') {
  if (!supabase) {
    return { codes: [], error: 'Supabase not configured' };
  }

  const totalUses = type === 'free' ? 1 : type === 'full' ? 3 : 9999;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push({
      code: generateCode(),
      type,
      total_uses: totalUses,
      used_count: 0,
      expires_at: expiresAt.toISOString(),
      note
    });
  }

  const { error } = await supabase
    .from('activation_codes')
    .insert(codes);

  if (error) {
    return { codes: [], error: error.message };
  }

  return { codes: codes.map(c => c.code), error: null };
}

/**
 * 获取激活码列表
 * @param {object} options - 查询选项
 * @returns {Promise<{data: array, total: number, error: string|null}>}
 */
async function listCodes(options = {}) {
  if (!supabase) {
    return { data: [], total: 0, error: 'Supabase not configured' };
  }

  let query = supabase
    .from('activation_codes')
    .select('*', { count: 'exact' });

  if (options.type) {
    query = query.eq('type', options.type);
  }

  if (options.used !== undefined) {
    if (options.used) {
      query = query.eq('used_count', supabase.raw('total_uses'));
    } else {
      query = query.lt('used_count', supabase.raw('total_uses'));
    }
  }

  if (options.page && options.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    return { data: [], total: 0, error: error.message };
  }

  return { data: data || [], total: count || 0, error: null };
}

/**
 * 作废激活码
 * @param {string} code - 激活码
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function revokeCode(code) {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data, error: fetchError } = await supabase
    .from('activation_codes')
    .select('total_uses')
    .eq('code', code)
    .single();

  if (fetchError || !data) {
    return { success: false, error: '激活码不存在' };
  }

  const { error: updateError } = await supabase
    .from('activation_codes')
    .update({ used_count: data.total_uses })
    .eq('code', code);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, error: null };
}

module.exports = {
  generateCode,
  verifyCode,
  consumeCode,
  batchGenerate,
  listCodes,
  revokeCode
};
