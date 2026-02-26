import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];
const ADVICE_NUMS  = ['一', '二', '三', '四', '五', '六'];

interface GanzhiPillar { tg: string; dz: string; wx: string; wxCls: string; }
interface ReportData {
  nameA: string; nameB: string;
  dateA: string; dateB: string;
  score: number; scoreLabel: string; scoreDesc: string;
  scoreTags: { text: string; style: 'fill' | 'outline' }[];
  subScores: { label: string; value: number }[];
  ganzhiA: GanzhiPillar[]; ganzhiB: GanzhiPillar[];
  wuxingRel: { tag: string; desc: string };
  highlights: { icon: string; title: string; desc: string }[];
  warnings:   { icon: string; badge: string; title: string; desc: string }[];
  advice: string[];
  liunian:    { year: number; gz: string; stars: number; note: string; active: boolean }[];
  timing:     { date: string; desc: string; badge: 'best' | 'caution'; badgeText: string }[];
  zhuangyun:  { icon: string; title: string; desc: string }[];
  sign: { grade: string; name: string; poem: string[]; ganzhiA: string[]; ganzhiB: string[] };
  shareCard: { grade: string; wxTag: string; poemShort: string };
}

export default function Result() {
  const navigate = useNavigate();
  const arcRef   = useRef<SVGCircleElement>(null);
  const [data, setData] = useState<ReportData | null>(null);

  // Load data
  useEffect(() => {
    const raw = localStorage.getItem('reportResult');
    if (!raw) { toast.error('未找到报告数据'); navigate('/input'); return; }
    setData(JSON.parse(raw));
  }, [navigate]);

  // Score arc animation
  useEffect(() => {
    if (!data || !arcRef.current) return;
    const total  = 351.86;
    const offset = total * (1 - data.score / 100);
    const arc    = arcRef.current;
    arc.style.strokeDashoffset = String(total);
    const t = setTimeout(() => {
      arc.style.transition      = 'stroke-dashoffset 1.4s cubic-bezier(.25,1,.5,1)';
      arc.style.strokeDashoffset = String(offset);
    }, 100);
    return () => clearTimeout(t);
  }, [data]);

  // Petals
  useEffect(() => {
    const container = document.getElementById('resultPetals');
    if (!container) return;
    const colors = ['#f7c5c5','#f4a7b9','#e07a9a','#f9d4df','#fbc4d4','#eda0b8'];
    for (let i = 0; i < 28; i++) {
      const p    = document.createElement('div');
      p.className = 'bz-petal';
      const size  = 10 + Math.random() * 14;
      p.style.cssText = `left:${Math.random()*100}%;top:${-10-Math.random()*20}px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${size}px;height:${size*1.2}px;border-radius:${Math.random()>.5?'50% 0 50% 0':'0 50% 0 50%'};animation-duration:${5+Math.random()*10}s;animation-delay:${Math.random()*10}s;transform:rotate(${Math.random()*360}deg);`;
      container.appendChild(p);
    }
  }, []);

  if (!data) {
    return (
      <div className="bz-page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="bz-loading-orb">🔮</div>
      </div>
    );
  }

  // Sign gz row: nameA chars + · + nameB chars
  const allGzSign: (string | null)[] = [...data.sign.ganzhiA, null, ...data.sign.ganzhiB];

  // First poem line: split nameA prefix
  const firstPoemLine = data.sign.poem[0] ?? '';
  const poemRest      = firstPoemLine.startsWith(data.nameA)
    ? firstPoemLine.slice(data.nameA.length)
    : firstPoemLine;

  return (
    <div className="bz-page">
      <div className="bz-petals-bg" id="resultPetals" />

      {/* Branch decorations */}
      <svg className="bz-blossom-deco left" width="180" height="300" viewBox="0 0 200 320">
        <line x1="175" y1="10"  x2="55"  y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="108" y1="130" x2="22"  y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <line x1="135" y1="215" x2="38"  y2="215" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="20" cy="105" r="9" fill="#f4a7b9"/><circle cx="9"  cy="94"  r="6" fill="#f7c5c5"/><circle cx="32" cy="97"  r="7" fill="#e07a9a"/><circle cx="14" cy="118" r="6" fill="#f4a7b9"/><circle cx="30" cy="116" r="5" fill="#f7c5c5"/></g>
        <g><circle cx="38" cy="210" r="10" fill="#f4a7b9"/><circle cx="25" cy="199" r="6" fill="#f7c5c5"/><circle cx="53" cy="202" r="7" fill="#e07a9a"/><circle cx="30" cy="223" r="6" fill="#f4a7b9"/><circle cx="50" cy="222" r="5" fill="#f7c5c5"/></g>
      </svg>
      <svg className="bz-blossom-deco right" width="180" height="300" viewBox="0 0 200 320">
        <line x1="25"  y1="10"  x2="145" y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="92"  y1="130" x2="178" y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <line x1="65"  y1="215" x2="162" y2="215" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="180" cy="105" r="9" fill="#f4a7b9"/><circle cx="191" cy="94"  r="6" fill="#f7c5c5"/><circle cx="168" cy="97"  r="7" fill="#e07a9a"/><circle cx="186" cy="118" r="6" fill="#f4a7b9"/><circle cx="170" cy="116" r="5" fill="#f7c5c5"/></g>
        <g><circle cx="162" cy="210" r="10" fill="#f4a7b9"/><circle cx="175" cy="199" r="6" fill="#f7c5c5"/><circle cx="147" cy="202" r="7" fill="#e07a9a"/><circle cx="170" cy="223" r="6" fill="#f4a7b9"/><circle cx="150" cy="222" r="5" fill="#f7c5c5"/></g>
      </svg>

      <div className="bz-container">

        {/* Header */}
        <div className="bz-report-header">
          <div className="bz-subtitle">✦ 八 字 合 婚 · 命 理 详 解 ✦</div>
          <h1>缘分测算报告</h1>
          <div className="bz-h-ornament">❀ · ❀ · ❀</div>
        </div>

        {/* People strip */}
        <div className="bz-people-strip">
          <div className="bz-ps-person">
            <div className="bz-ps-name">{data.nameA.split('').join(' ')}</div>
            <div className="bz-ps-date">{data.dateA}</div>
            <div className="bz-ps-wuxing">
              <span className={`bz-wx ${data.ganzhiA[0].wxCls}`}>{data.ganzhiA[0].wx}</span>
              <span className={`bz-wx ${data.ganzhiA[2].wxCls}`}>{data.ganzhiA[2].wx}</span>
            </div>
          </div>
          <div className="bz-ps-heart">❤</div>
          <div className="bz-ps-person">
            <div className="bz-ps-name">{data.nameB.split('').join(' ')}</div>
            <div className="bz-ps-date">{data.dateB}</div>
            <div className="bz-ps-wuxing">
              <span className={`bz-wx ${data.ganzhiB[0].wxCls}`}>{data.ganzhiB[0].wx}</span>
              <span className={`bz-wx ${data.ganzhiB[2].wxCls}`}>{data.ganzhiB[2].wx}</span>
            </div>
          </div>
        </div>

        {/* ── 1. 缘分总分 ── */}
        <div className="bz-section">
          <div className="bz-section-title">缘 分 总 分</div>
          <div className="bz-score-main">
            <div className="bz-score-circle">
              <svg viewBox="0 0 130 130" fill="none">
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f4a7b9"/>
                    <stop offset="100%" stopColor="#9b2c52"/>
                  </linearGradient>
                </defs>
                <circle cx="65" cy="65" r="56" stroke="rgba(244,167,185,.25)" strokeWidth="10"/>
                <circle
                  ref={arcRef}
                  cx="65" cy="65" r="56"
                  stroke="url(#sg)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="351.86"
                  strokeDashoffset="351.86"
                  transform="rotate(-90 65 65)"
                />
              </svg>
              <span className="bz-score-num">{data.score}</span>
              <span className="bz-score-pct">缘分值</span>
            </div>
            <div className="bz-score-right">
              <div className="bz-score-label">{data.scoreLabel}</div>
              <div className="bz-score-desc">{data.scoreDesc}</div>
              <div className="bz-score-tags">
                {data.scoreTags.map((tag, i) => (
                  <span key={i} className={`bz-score-tag${tag.style === 'outline' ? ' outline' : ''}`}>{tag.text}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="bz-sub-bars">
            {data.subScores.map((s, i) => (
              <div key={i} className="bz-bar-row">
                <span className="bz-bar-label">{s.label}</span>
                <div className="bz-bar-bg">
                  <div className="bz-bar-fill" style={{ width:`${s.value}%`, animationDelay:`${0.3+i*0.2}s` }} />
                </div>
                <span className="bz-bar-val">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 八字排盘 ── */}
        <div className="bz-section">
          <div className="bz-section-title">八 字 排 盘</div>
          <div className="bz-bazi-board">
            <div>
              <div className="bz-bazi-person-label">✦ {data.nameA} · 命盘</div>
              <div className="bz-bazi-pillars">
                {data.ganzhiA.map((p, i) => (
                  <div key={i} className="bz-pillar" style={{ animationDelay:`${0.3+i*0.12}s` }}>
                    <span className="bz-pillar-name">{PILLAR_NAMES[i]}</span>
                    <div className="bz-pillar-tg">{p.tg}</div>
                    <div className="bz-pillar-dz">{p.dz}</div>
                    <span className={`bz-wx ${p.wxCls} bz-pillar-wx`}>{p.wx}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bz-bazi-person-label">✦ {data.nameB} · 命盘</div>
              <div className="bz-bazi-pillars">
                {data.ganzhiB.map((p, i) => (
                  <div key={i} className="bz-pillar" style={{ animationDelay:`${0.6+i*0.12}s` }}>
                    <span className="bz-pillar-name">{PILLAR_NAMES[i]}</span>
                    <div className="bz-pillar-tg">{p.tg}</div>
                    <div className="bz-pillar-dz">{p.dz}</div>
                    <span className={`bz-wx ${p.wxCls} bz-pillar-wx`}>{p.wx}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bz-wuxing-rel">
            <span className="bz-rel-tag">{data.wuxingRel.tag}</span>
            <span className="bz-rel-desc">{data.wuxingRel.desc}</span>
          </div>
        </div>

        {/* ── 3. 缘分亮点 ── */}
        <div className="bz-section">
          <div className="bz-section-title">缘 分 亮 点</div>
          <div className="bz-item-list">
            {data.highlights.map((h, i) => (
              <div key={i} className="bz-item" style={{ animation:`bz-fadeUp .5s ease ${0.2+i*0.15}s both` }}>
                <div className="bz-item-icon">{h.icon}</div>
                <div>
                  <div className="bz-item-title">{h.title}</div>
                  <div className="bz-item-desc">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 隐患预警 ── */}
        <div className="bz-section bz-warn-section">
          <div className="bz-section-title" style={{ color:'#c9822a' }}>⚠ 隐 患 预 警</div>
          <div className="bz-item-list">
            {data.warnings.map((w, i) => (
              <div key={i} className="bz-item warn" style={{ animation:`bz-fadeUp .5s ease ${0.2+i*0.15}s both` }}>
                <div className="bz-item-icon">{w.icon}</div>
                <div>
                  <div className="bz-item-title">
                    <span className="bz-warn-badge">{w.badge}</span>{w.title}
                  </div>
                  <div className="bz-item-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 相处建议 ── */}
        <div className="bz-section">
          <div className="bz-section-title">相 处 建 议</div>
          <div className="bz-advice-list">
            {data.advice.map((a, i) => (
              <div key={i} className="bz-advice-item" style={{ animation:`bz-fadeUp .5s ease ${0.2+i*0.15}s both` }}>
                <div className="bz-advice-num">{ADVICE_NUMS[i]}</div>
                <div className="bz-advice-text">{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 流年排盘 ── */}
        <div className="bz-section">
          <div className="bz-section-title">流 年 排 盘</div>
          <div className="bz-liunian-grid">
            {data.liunian.map((l, i) => (
              <div key={i} className={`bz-liunian-cell${l.active ? ' active' : ''}`}>
                <div className="bz-liunian-year">{l.year}</div>
                <div className="bz-liunian-gz">{l.gz}</div>
                <div className="bz-liunian-stars">
                  {Array.from({ length: l.stars }, (_, j) => <span key={j} className="bz-star">★</span>)}
                </div>
                <div className="bz-liunian-note">{l.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 最佳发展时机 ── */}
        <div className="bz-section">
          <div className="bz-section-title">最 佳 发 展 时 机</div>
          <div className="bz-timing-list">
            {data.timing.map((t, i) => (
              <div key={i} className={`bz-timing-item ${t.badge}`} style={{ animation:`bz-fadeUp .5s ease ${0.2+i*0.15}s both` }}>
                <div className="bz-timing-date">{t.date}</div>
                <div className="bz-timing-desc">{t.desc}</div>
                <span className={`bz-timing-badge ${t.badge}`}>{t.badgeText}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 转运技巧 ── */}
        <div className="bz-section">
          <div className="bz-section-title">转 运 技 巧</div>
          <div className="bz-zhuangyun-grid">
            {data.zhuangyun.map((z, i) => (
              <div key={i} className="bz-zhuangyun-item" style={{ animation:`bz-fadeUp .5s ease ${0.2+i*0.12}s both` }}>
                <div className="bz-zhuangyun-icon">{z.icon}</div>
                <div className="bz-zhuangyun-title">{z.title}</div>
                <div className="bz-zhuangyun-desc">{z.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bz-divider">✦ · · · ✦</div>

        {/* ── 9. 专属姻缘签 ── */}
        <div className="bz-section bz-sign-section">
          <div className="bz-sign-embed">
            <div className="bz-sign-title-row">
              <span>专 属 姻 缘 签</span>
            </div>

            <div className="bz-sign-wrap" style={{ marginTop: 70 }}>
              <div className="bz-knot" />
              <div className="bz-thread" />

              <div className="bz-sign-card">
                <span className="bz-sign-corner tl">🌸</span>
                <span className="bz-sign-corner tr">🌸</span>
                <span className="bz-sign-corner bl">🌺</span>
                <span className="bz-sign-corner br">🌺</span>

                <div className="bz-sign-head">
                  <div className="bz-sign-grade">{data.sign.grade.split('').join(' ')}</div>
                  <div style={{ color:'var(--bz-rose)', fontSize:11, letterSpacing:4, opacity:.6, marginBottom:7 }}>✦ · ✦</div>
                  <div className="bz-sign-name">{data.sign.name.split('').join(' ')}</div>
                </div>

                <div className="bz-sign-for">为 <em>{data.nameA}</em> 与 <em>{data.nameB}</em> 而卜</div>

                <div className="bz-sign-rule"><span>❀</span></div>

                <div className="bz-sign-poem">
                  <span className="bz-poem-line">
                    <span className="bz-poem-name">{data.nameA}</span>{poemRest}
                  </span>
                  {data.sign.poem.slice(1).map((line, i) => (
                    <span key={i+1} className="bz-poem-line">{line}</span>
                  ))}
                </div>

                <div className="bz-sign-rule" style={{ marginTop:12 }}><span>❀</span></div>
                <div style={{ textAlign:'center', fontSize:9, letterSpacing:3, color:'var(--bz-gold)', opacity:.7, marginBottom:6 }}>
                  命 盘 八 字
                </div>
                <div className="bz-sign-gz">
                  {allGzSign.map((ch, i) =>
                    ch === null
                      ? <span key={i} className="bz-gz-dot" style={{ animationDelay:`${1.6+i*0.12}s` }}>·</span>
                      : <div   key={i} className="bz-gz-c"  style={{ animationDelay:`${1.6+i*0.12}s` }}>{ch}</div>
                  )}
                </div>

                <div className="bz-sign-seal">缘</div>
              </div>

              <div className="bz-score-badge-float">
                <span className="bz-snum">{data.score}</span>
                <span className="bz-sunit">缘分值</span>
              </div>
            </div>

            <div className="bz-sign-tags">
              {data.scoreTags.map((tag, i) => (
                <span key={i} className={`bz-sign-tag ${tag.style === 'fill' ? 'hi' : 'outline'}`}>{tag.text}</span>
              ))}
              <span className="bz-sign-tag outline">{data.scoreLabel}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bz-cta-section">
          <button className="bz-btn bz-btn-outline" onClick={() => navigate('/share')}>保存报告</button>
          <button className="bz-btn bz-btn-primary" onClick={() => navigate('/input')}>再测一次</button>
        </div>

        <div className="bz-disclaimer">
          本报告基于传统命理文化生成，仅供娱乐参考<br/>不构成任何情感或人生决策建议
        </div>
        <div className="bz-footer">✦ 八字缘分测算 · 月老赐缘 ✦</div>

      </div>
    </div>
  );
}
