import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Activate() {
  const navigate  = useNavigate();
  const [code, setCode]     = useState('');
  const [loading, setLoading] = useState(false);

  const formatCode = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length <= 4) return clean;
    return `${clean.slice(0,4)}-${clean.slice(4,8)}`;
  };

  const handleVerify = async () => {
    if (!code || code.length !== 9) { toast.error('请输入完整的激活码'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem('activationCode', code);
    localStorage.setItem('codeType', 'demo');
    localStorage.setItem('codeRemaining', '99');
    toast.success('激活成功！');
    setTimeout(() => navigate('/input'), 500);
  };

  return (
    <div className="bz-page">
      <div className="bz-container" style={{ paddingTop: 0 }}>
        {/* Header */}
        <div className="bz-report-header" style={{ paddingBottom: 24 }}>
          <div className="bz-subtitle">✦ 八 字 缘 分 测 算 ✦</div>
          <h1 style={{ fontFamily:'Noto Serif SC,serif', fontSize:26, letterSpacing:8, color:'var(--bz-crimson)', fontWeight:500 }}>
            输 入 激 活 码
          </h1>
          <div className="bz-h-ornament">❀ · ❀ · ❀</div>
        </div>

        {/* Code input */}
        <div className="bz-form-section">
          <div className="bz-form-label">激 活 码</div>
          <input
            className="bz-text-input"
            type="text"
            value={code}
            onChange={e => setCode(formatCode(e.target.value))}
            placeholder="XXXX-XXXX"
            maxLength={9}
            disabled={loading}
            style={{ fontSize:20, letterSpacing:8 }}
          />
          <p style={{ textAlign:'center', fontSize:11, color:'var(--bz-deep)', opacity:.6, marginTop:8, letterSpacing:1 }}>
            格式：4位-4位，如 AB12-CD34
          </p>
        </div>

        {/* Verify button */}
        <button
          className="bz-btn bz-btn-primary"
          style={{ width:'100%', marginBottom:16, opacity: (loading || code.length !== 9) ? .55 : 1 }}
          onClick={handleVerify}
          disabled={loading || code.length !== 9}
        >
          {loading ? '验 证 中…' : '验 证 并 开 始'}
        </button>

        {/* How to get code */}
        <div className="bz-section">
          <div className="bz-section-title">如 何 获 取 激 活 码</div>
          <div className="bz-benefits-list">
            {[
              '关注小红书账号 @八字缘分测算',
              '参与评论区抽奖活动获取体验码',
              '私信「完整码」获取付费版激活码',
            ].map((item, i) => (
              <div key={i} className="bz-benefit-item">
                <span className="bz-benefit-dot" style={{ minWidth:16 }}>{i+1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code types */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:24 }}>
          {[
            { label:'体验码', desc:'1次测算', color:'var(--bz-petal)' },
            { label:'完整码', desc:'3次测算', color:'var(--bz-rose)' },
            { label:'无限码', desc:'不限次数', color:'var(--bz-crimson)' },
          ].map(({ label, desc, color }) => (
            <div key={label} style={{
              padding:'14px 10px', borderRadius:12, textAlign:'center',
              background:'rgba(255,255,255,.5)',
              border:`1px solid ${color}44`,
            }}>
              <div style={{ fontFamily:'Noto Serif SC,serif', fontSize:12, color, letterSpacing:2, marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:11, color:'var(--bz-deep)', opacity:.7 }}>{desc}</div>
            </div>
          ))}
        </div>

        <button
          className="bz-btn bz-btn-outline"
          style={{ width:'100%' }}
          onClick={() => navigate('/')}
        >
          ← 返 回 首 页
        </button>

        <div className="bz-footer">✦ 八字缘分测算 · 月老赐缘 ✦</div>
      </div>
    </div>
  );
}
