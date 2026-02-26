import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();

  // Petal animation
  useEffect(() => {
    const container = document.getElementById('homePetals');
    if (!container) return;
    const colors = ['#f7c5c5','#f4a7b9','#e07a9a','#f9d4df','#fbc4d4'];
    for (let i = 0; i < 22; i++) {
      const p    = document.createElement('div');
      p.className = 'bz-petal';
      const size  = 8 + Math.random() * 12;
      p.style.cssText = `left:${Math.random()*100}%;top:${-10-Math.random()*20}px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${size}px;height:${size*1.2}px;border-radius:${Math.random()>.5?'50% 0 50% 0':'0 50% 0 50%'};animation-duration:${5+Math.random()*10}s;animation-delay:${Math.random()*8}s;transform:rotate(${Math.random()*360}deg);`;
      container.appendChild(p);
    }
  }, []);

  const handleStart = () => {
    const code = localStorage.getItem('activationCode');
    if (code) navigate('/input');
    else navigate('/activate');
  };

  return (
    <div className="bz-page">
      <div className="bz-petals-bg" id="homePetals" />

      {/* Branch decorations */}
      <svg className="bz-blossom-deco left" width="160" height="280" viewBox="0 0 200 320">
        <line x1="175" y1="10" x2="55"  y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="108" y1="130" x2="22" y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="20" cy="105" r="9" fill="#f4a7b9"/><circle cx="9" cy="94" r="6" fill="#f7c5c5"/><circle cx="32" cy="97" r="7" fill="#e07a9a"/><circle cx="14" cy="118" r="6" fill="#f4a7b9"/></g>
      </svg>
      <svg className="bz-blossom-deco right" width="160" height="280" viewBox="0 0 200 320">
        <line x1="25"  y1="10" x2="145" y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="92"  y1="130" x2="178" y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="180" cy="105" r="9" fill="#f4a7b9"/><circle cx="191" cy="94" r="6" fill="#f7c5c5"/><circle cx="168" cy="97" r="7" fill="#e07a9a"/><circle cx="186" cy="118" r="6" fill="#f4a7b9"/></g>
      </svg>

      <div className="bz-container">
        {/* Header */}
        <div className="bz-home-header">
          <div className="bz-home-logo">🔮</div>
          <div className="bz-home-title">八字缘分测算</div>
          <div className="bz-home-tagline">他是不是你命中注定的那个人？</div>
        </div>

        {/* Features grid */}
        <div className="bz-section" style={{ marginBottom: 16 }}>
          <div className="bz-section-title">报 告 包 含</div>
          <div className="bz-feature-grid">
            <div className="bz-feature-card">
              <div className="bz-feature-icon">📅</div>
              <div className="bz-feature-title">八字排盘</div>
              <div className="bz-feature-desc">天干地支精准推算</div>
            </div>
            <div className="bz-feature-card">
              <div className="bz-feature-icon">❤️</div>
              <div className="bz-feature-title">五行相合</div>
              <div className="bz-feature-desc">金木水火土相生</div>
            </div>
            <div className="bz-feature-card">
              <div className="bz-feature-icon">✨</div>
              <div className="bz-feature-title">缘分亮点</div>
              <div className="bz-feature-desc">4大合盘亮点解读</div>
            </div>
            <div className="bz-feature-card">
              <div className="bz-feature-icon">🌸</div>
              <div className="bz-feature-title">专属签文</div>
              <div className="bz-feature-desc">诗意姻缘签</div>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="bz-section" style={{ marginBottom: 24 }}>
          <div className="bz-section-title">你 将 获 得</div>
          <div className="bz-benefits-list">
            {[
              '缘分总分 + 八字等级评定',
              '流年排盘 · 最佳发展时机',
              '隐患预警 · 相处实用建议',
              '转运技巧 · 开运小妙招',
              '专属诗意姻缘签 · 可分享小红书',
            ].map((item, i) => (
              <div key={i} className="bz-benefit-item">
                <span className="bz-benefit-dot">❀</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button className="bz-btn bz-btn-primary" style={{ width:'100%', fontSize:15, letterSpacing:6 }} onClick={handleStart}>
          开 始 测 算
        </button>

        <div className="bz-disclaimer" style={{ marginTop: 20 }}>
          本产品基于传统八字命理文化，结合AI智能生成个性化内容<br/>仅供娱乐参考，不构成任何决策建议
        </div>
        <div className="bz-footer">✦ 八字缘分测算 · 月老赐缘 ✦</div>
      </div>
    </div>
  );
}
