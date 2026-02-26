import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareData {
  nameA: string; nameB: string;
  dateA: string; dateB: string;
  score: number;
  shareCard: { grade: string; wxTag: string; poemShort: string };
  ganzhiA: { tg: string; dz: string; wx: string; wxCls: string }[];
  ganzhiB: { tg: string; dz: string; wx: string; wxCls: string }[];
  sign: { grade: string; name: string; poem: string[] };
  scoreTags: { text: string; style: 'fill' | 'outline' }[];
}

export default function ShareCard() {
  const navigate   = useNavigate();
  const cardRef    = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<SVGCircleElement>(null);
  const [data, setData] = useState<ShareData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('reportResult');
    if (!raw) { toast.error('未找到报告数据'); navigate('/input'); return; }
    setData(JSON.parse(raw));
  }, [navigate]);

  // Ring animation
  useEffect(() => {
    if (!data || !ringRef.current) return;
    const total  = 289.03;
    const offset = total * (1 - data.score / 100);
    const ring   = ringRef.current;
    ring.style.strokeDashoffset = String(total);
    const t = setTimeout(() => {
      ring.style.transition      = 'stroke-dashoffset 1.4s cubic-bezier(.25,1,.5,1)';
      ring.style.strokeDashoffset = String(offset);
    }, 200);
    return () => clearTimeout(t);
  }, [data]);

  // Card petals
  useEffect(() => {
    const layer = document.getElementById('cardPetals');
    if (!layer) return;
    const colors = ['#f7c5c5','#f4a7b9','#e07a9a','#f9d4df','#fbc4d4'];
    for (let i = 0; i < 18; i++) {
      const p    = document.createElement('div');
      p.className = 'bz-fp';
      const sz    = 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random()*100}%;top:${-10-Math.random()*10}px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz*1.2}px;border-radius:${Math.random()>.5?'50% 0 50% 0':'0 50% 0 50%'};animation-duration:${6+Math.random()*8}s;animation-delay:${Math.random()*8}s;transform:rotate(${Math.random()*360}deg);`;
      layer.appendChild(p);
    }
  }, [data]);

  const handleSave = async () => {
    if (!cardRef.current || !data) return;
    setSaving(true);
    toast.loading('生成中…');
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
      });
      const link       = document.createElement('a');
      link.download    = `缘分报告_${data.nameA}与${data.nameB}.png`;
      link.href        = canvas.toDataURL('image/png');
      link.click();
      toast.dismiss();
      toast.success('图片已保存，可发布至小红书 🌸');
    } catch {
      toast.dismiss();
      toast.error('保存失败，请截图保存');
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="bz-page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="bz-loading-orb">🔮</div>
      </div>
    );
  }

  const { nameA, nameB, dateA, dateB, score, shareCard, ganzhiA, ganzhiB, sign } = data;
  const poemText = sign.poem.join('，');
  const wxTagA   = ganzhiA[0].wx;
  const wxTagB   = ganzhiB[0].wx;

  return (
    <div className="bz-share-page">
      <p className="bz-page-label">✦ 小 红 书 分 享 卡 片 ✦</p>

      <div className="bz-share-card-wrapper">
        <div id="shareCard" ref={cardRef} className="bz-share-card">

          {/* BG pattern */}
          <svg className="bz-card-bg-pattern" viewBox="0 0 375 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diag" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                <line x1="0" y1="0" x2="0" y2="20" stroke="#9b2c52" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="375" height="500" fill="url(#diag)"/>
          </svg>

          {/* Blossom TL */}
          <svg className="bz-blossom-tl" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <line x1="190" y1="10"  x2="20"  y2="195" stroke="#c45a7a" strokeWidth="2.5"/>
            <line x1="110" y1="80"  x2="10"  y2="55"  stroke="#c45a7a" strokeWidth="1.8"/>
            <line x1="145" y1="135" x2="25"  y2="140" stroke="#c45a7a" strokeWidth="1.8"/>
            <g>
              <circle cx="9"  cy="50"  r="11" fill="#f4a7b9"/>
              <circle cx="-2" cy="38"  r="7"  fill="#f7c5c5"/>
              <circle cx="24" cy="43"  r="9"  fill="#e07a9a"/>
              <circle cx="4"  cy="64"  r="7"  fill="#f4a7b9"/>
              <circle cx="22" cy="62"  r="6"  fill="#f7c5c5"/>
              <circle cx="13" cy="42"  r="4"  fill="white" opacity=".6"/>
            </g>
            <g>
              <circle cx="24" cy="135" r="12" fill="#f4a7b9"/>
              <circle cx="10" cy="122" r="8"  fill="#f7c5c5"/>
              <circle cx="40" cy="128" r="10" fill="#e07a9a"/>
              <circle cx="16" cy="150" r="8"  fill="#f4a7b9"/>
              <circle cx="38" cy="148" r="7"  fill="#f7c5c5"/>
              <circle cx="27" cy="128" r="4"  fill="white" opacity=".6"/>
            </g>
          </svg>

          {/* Blossom BR */}
          <svg className="bz-blossom-br" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <line x1="10"  y1="190" x2="180" y2="5"   stroke="#c45a7a" strokeWidth="2.5"/>
            <line x1="90"  y1="120" x2="190" y2="145" stroke="#c45a7a" strokeWidth="1.8"/>
            <line x1="55"  y1="65"  x2="175" y2="60"  stroke="#c45a7a" strokeWidth="1.8"/>
            <g>
              <circle cx="191" cy="150" r="11" fill="#f4a7b9"/>
              <circle cx="202" cy="162" r="7"  fill="#f7c5c5"/>
              <circle cx="176" cy="157" r="9"  fill="#e07a9a"/>
              <circle cx="196" cy="136" r="7"  fill="#f4a7b9"/>
              <circle cx="178" cy="138" r="6"  fill="#f7c5c5"/>
              <circle cx="189" cy="158" r="4"  fill="white" opacity=".6"/>
            </g>
            <g>
              <circle cx="176" cy="65" r="12" fill="#f4a7b9"/>
              <circle cx="190" cy="78" r="8"  fill="#f7c5c5"/>
              <circle cx="160" cy="72" r="10" fill="#e07a9a"/>
              <circle cx="184" cy="50" r="8"  fill="#f4a7b9"/>
              <circle cx="162" cy="52" r="7"  fill="#f7c5c5"/>
              <circle cx="173" cy="72" r="4"  fill="white" opacity=".6"/>
            </g>
          </svg>

          {/* Watermark */}
          <div className="bz-card-watermark">缘</div>

          {/* Petals layer */}
          <div className="bz-petals-layer" id="cardPetals" />

          {/* Inner frame */}
          <div className="bz-inner-frame" />

          {/* Content */}
          <div className="bz-card-content">

            <div className="bz-card-brand">✦ 八 字 缘 分 测 算 ✦</div>

            {/* Names */}
            <div className="bz-names-row">
              <div className="bz-person-block">
                <div className="bz-p-name">{nameA.split('').join(' ')}</div>
                <div className="bz-p-date">{dateA.replace(/年|月/g, ' · ').replace('日', '').replace(' · ', '').slice(0, 14)}</div>
                <div className="bz-p-wx">
                  <span className={`bz-wx-chip bz-wx-${ganzhiA[0].wxCls.replace('bz-wx-','')}`}>{wxTagA}</span>
                  <span className={`bz-wx-chip bz-wx-${ganzhiA[2].wxCls.replace('bz-wx-','')}`}>{ganzhiA[2].wx}</span>
                </div>
              </div>
              <div className="bz-heart-mid">❤</div>
              <div className="bz-person-block">
                <div className="bz-p-name">{nameB.split('').join(' ')}</div>
                <div className="bz-p-date">{dateB.replace(/年|月/g, ' · ').replace('日', '').replace(' · ', '').slice(0, 14)}</div>
                <div className="bz-p-wx">
                  <span className={`bz-wx-chip bz-wx-${ganzhiB[0].wxCls.replace('bz-wx-','')}`}>{wxTagB}</span>
                  <span className={`bz-wx-chip bz-wx-${ganzhiB[2].wxCls.replace('bz-wx-','')}`}>{ganzhiB[2].wx}</span>
                </div>
              </div>
            </div>

            <div className="bz-h-line"><span>❀</span></div>

            {/* Score ring */}
            <div className="bz-score-block">
              <div className="bz-score-ring-wrap">
                <svg viewBox="0 0 108 108" fill="none">
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f4a7b9"/>
                      <stop offset="100%" stopColor="#9b2c52"/>
                    </linearGradient>
                  </defs>
                  <circle cx="54" cy="54" r="46" stroke="rgba(244,167,185,.22)" strokeWidth="8"/>
                  <circle
                    ref={ringRef}
                    cx="54" cy="54" r="46"
                    stroke="url(#rg)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="289.03"
                    strokeDashoffset="289.03"
                    transform="rotate(-90 54 54)"
                  />
                </svg>
                <div className="bz-score-inner">
                  <span className="bz-score-ring-num">{score}</span>
                  <span className="bz-score-unit">缘分值</span>
                </div>
              </div>
              <div className="bz-score-grade">{shareCard.grade.split('').join(' ')}</div>
              <div className="bz-score-tags-row">
                <span className="bz-stag fill">{shareCard.wxTag}</span>
                <span className="bz-stag ghost">日月相合</span>
                <span className="bz-stag ghost">三合局</span>
              </div>
            </div>

            {/* Poem */}
            <div className="bz-poem-wrap">
              <div className="bz-poem-label">专 属 姻 缘 签 · {sign.grade}</div>
              <div className="bz-poem-title">{sign.name.split('').join(' ')}</div>
              <div className="bz-poem-text">
                <span className="bz-poem-em">{nameA}</span>
                {sign.poem[0].slice(nameA.length)}，{sign.poem[1]}<br/>
                {sign.poem[2]}，{sign.poem[3]}
              </div>
            </div>

            {/* Footer */}
            <div className="bz-card-footer">
              <div className="bz-qr-block">
                <div className="bz-qr-box">
                  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" fill="white"/>
                    <rect x="2"    y="2"    width="12" height="12" rx="1"   fill="#9b2c52"/>
                    <rect x="4"    y="4"    width="8"  height="8"  rx="0.5" fill="white"/>
                    <rect x="5.5"  y="5.5"  width="5"  height="5"  rx="0.3" fill="#9b2c52"/>
                    <rect x="26"   y="2"    width="12" height="12" rx="1"   fill="#9b2c52"/>
                    <rect x="28"   y="4"    width="8"  height="8"  rx="0.5" fill="white"/>
                    <rect x="29.5" y="5.5"  width="5"  height="5"  rx="0.3" fill="#9b2c52"/>
                    <rect x="2"    y="26"   width="12" height="12" rx="1"   fill="#9b2c52"/>
                    <rect x="4"    y="28"   width="8"  height="8"  rx="0.5" fill="white"/>
                    <rect x="5.5"  y="29.5" width="5"  height="5"  rx="0.3" fill="#9b2c52"/>
                    <rect x="16" y="2"  width="2" height="2" fill="#9b2c52"/>
                    <rect x="20" y="2"  width="2" height="2" fill="#9b2c52"/>
                    <rect x="16" y="6"  width="2" height="2" fill="#9b2c52"/>
                    <rect x="22" y="4"  width="2" height="4" fill="#9b2c52"/>
                    <rect x="16" y="10" width="4" height="2" fill="#9b2c52"/>
                    <rect x="16" y="14" width="2" height="2" fill="#9b2c52"/>
                    <rect x="20" y="14" width="2" height="2" fill="#9b2c52"/>
                    <rect x="24" y="14" width="2" height="2" fill="#9b2c52"/>
                    <rect x="2"  y="16" width="2" height="2" fill="#9b2c52"/>
                    <rect x="6"  y="16" width="4" height="2" fill="#9b2c52"/>
                    <rect x="2"  y="20" width="4" height="2" fill="#9b2c52"/>
                    <rect x="8"  y="20" width="2" height="2" fill="#9b2c52"/>
                    <rect x="14" y="16" width="2" height="4" fill="#9b2c52"/>
                    <rect x="18" y="16" width="4" height="2" fill="#9b2c52"/>
                    <rect x="14" y="22" width="4" height="2" fill="#9b2c52"/>
                    <rect x="20" y="20" width="2" height="4" fill="#9b2c52"/>
                    <rect x="24" y="18" width="2" height="2" fill="#9b2c52"/>
                    <rect x="26" y="16" width="2" height="4" fill="#9b2c52"/>
                    <rect x="30" y="16" width="2" height="2" fill="#9b2c52"/>
                    <rect x="34" y="16" width="4" height="2" fill="#9b2c52"/>
                    <rect x="28" y="20" width="4" height="2" fill="#9b2c52"/>
                    <rect x="34" y="20" width="4" height="4" fill="#9b2c52"/>
                    <rect x="26" y="24" width="2" height="4" fill="#9b2c52"/>
                    <rect x="30" y="26" width="4" height="2" fill="#9b2c52"/>
                    <rect x="16" y="26" width="2" height="4" fill="#9b2c52"/>
                    <rect x="22" y="32" width="4" height="2" fill="#9b2c52"/>
                  </svg>
                </div>
                <div className="bz-qr-label">扫码测算</div>
              </div>
              <div className="bz-footer-right">
                <div className="bz-footer-cta">去测测你们的缘分 →</div>
                <div className="bz-footer-brand">八字缘分测算</div>
                <div className="bz-footer-seal">缘</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="bz-controls">
        <button className="bz-ctrl-btn outline" onClick={() => navigate('/result')}>← 返回报告</button>
        <button className="bz-ctrl-btn primary" onClick={handleSave} disabled={saving}>
          {saving ? '生成中…' : '保存图片'}
        </button>
      </div>
      <p className="bz-save-hint">点击「保存图片」下载 PNG，可直接发布至小红书</p>
    </div>
  );
}
