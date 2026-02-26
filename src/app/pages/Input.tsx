import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const hours = [
  { value: '0',  label: '子时（23-01点）' },
  { value: '2',  label: '丑时（01-03点）' },
  { value: '4',  label: '寅时（03-05点）' },
  { value: '6',  label: '卯时（05-07点）' },
  { value: '8',  label: '辰时（07-09点）' },
  { value: '10', label: '巳时（09-11点）' },
  { value: '12', label: '午时（11-13点）' },
  { value: '14', label: '未时（13-15点）' },
  { value: '16', label: '申时（15-17点）' },
  { value: '18', label: '酉时（17-19点）' },
  { value: '20', label: '戌时（19-21点）' },
  { value: '22', label: '亥时（21-23点）' },
  { value: '-1', label: '不知道' },
];

const questionnaire = [
  { key: 'q1', question: '你们相识的方式是？',         options: ['一见钟情', '慢慢走进', '网络相识', '朋友介绍'] },
  { key: 'q2', question: '你感觉你们之间更像？',         options: ['磁铁相吸', '相似灵魂', '互补拼图', '还没感觉到'] },
  { key: 'q3', question: '你们有「同步心灵」的瞬间吗？', options: ['经常有',   '偶尔有',   '没有',     '不确定'] },
  { key: 'q4', question: '对方对你来说像？',             options: ['太阳',     '月亮',     '北极星',   '流星'] },
  { key: 'q5', question: '你们认识多久了？',             options: ['不到一个月','1-6个月',  '半年以上', '还没在一起'] },
];

export default function Input() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [gender, setGender] = useState('female');
  const [nameA, setNameA]   = useState('');
  const [nameB, setNameB]   = useState('');

  const [userBirth, setUserBirth]       = useState({ year: '', month: '', day: '', hour: '-1' });
  const [partnerBirth, setPartnerBirth] = useState({ year: '', month: '', day: '', hour: '-1' });
  const [answers, setAnswers]           = useState<Record<string, string>>({});

  const currentYear = 2026;
  const years  = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days   = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    const container = document.getElementById('inputPetals');
    if (!container) return;
    const colors = ['#f7c5c5','#f4a7b9','#e07a9a','#f9d4df','#fbc4d4'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'bz-petal';
      const size = 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random()*100}%;top:${-10-Math.random()*20}px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${size}px;height:${size*1.2}px;border-radius:${Math.random()>.5?'50% 0 50% 0':'0 50% 0 50%'};animation-duration:${5+Math.random()*8}s;animation-delay:${Math.random()*8}s;`;
      container.appendChild(p);
    }
  }, []);

  const validateStep1 = () => {
    if (!nameA.trim()) { toast.error('请输入你的名字'); return false; }
    if (!nameB.trim()) { toast.error('请输入对方的名字'); return false; }
    if (!userBirth.year || !userBirth.month || !userBirth.day) { toast.error('请填写你的完整生日信息'); return false; }
    if (!partnerBirth.year || !partnerBirth.month || !partnerBirth.day) { toast.error('请填写对方完整的生日信息'); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = () => {
    const unanswered = questionnaire.filter(q => !answers[q.key]);
    if (unanswered.length > 0) { toast.error('请完成所有问题'); return; }
    const code = localStorage.getItem('activationCode');
    if (!code) { toast.error('请先输入激活码'); navigate('/activate'); return; }
    const data = {
      code, gender,
      nameA: nameA.trim(), nameB: nameB.trim(),
      user:    { year: +userBirth.year,    month: +userBirth.month,    day: +userBirth.day,    hour: +userBirth.hour    >= 0 ? +userBirth.hour    : undefined },
      partner: { year: +partnerBirth.year, month: +partnerBirth.month, day: +partnerBirth.day, hour: +partnerBirth.hour >= 0 ? +partnerBirth.hour : undefined },
      questionnaire: answers,
    };
    localStorage.setItem('inputData', JSON.stringify(data));
    navigate('/loading');
  };

  const allAnswered = questionnaire.every(q => answers[q.key]);

  const selectStyle: React.CSSProperties = { borderColor: 'rgba(196,90,122,.3)', fontFamily: 'Noto Serif SC,serif', fontSize: 13 };

  return (
    <div className="bz-page">
      <div id="inputPetals" className="bz-petals-bg" />

      <svg className="bz-blossom-deco left" width="160" height="280" viewBox="0 0 200 320">
        <line x1="175" y1="10" x2="55" y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="108" y1="130" x2="22" y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="20" cy="105" r="9" fill="#f4a7b9"/><circle cx="9" cy="94" r="6" fill="#f7c5c5"/><circle cx="32" cy="97" r="7" fill="#e07a9a"/><circle cx="14" cy="118" r="6" fill="#f4a7b9"/></g>
      </svg>
      <svg className="bz-blossom-deco right" width="160" height="280" viewBox="0 0 200 320">
        <line x1="25" y1="10" x2="145" y2="310" stroke="#c45a7a" strokeWidth="2.5"/>
        <line x1="92" y1="130" x2="178" y2="110" stroke="#c45a7a" strokeWidth="1.8"/>
        <g><circle cx="180" cy="105" r="9" fill="#f4a7b9"/><circle cx="191" cy="94" r="6" fill="#f7c5c5"/><circle cx="168" cy="97" r="7" fill="#e07a9a"/><circle cx="186" cy="118" r="6" fill="#f4a7b9"/></g>
      </svg>

      <div className="bz-container" style={{ paddingTop: 0 }}>
        <div className="bz-report-header" style={{ paddingTop: 40, paddingBottom: 20 }}>
          <div className="bz-subtitle">✦ 八 字 合 婚 · 缘 分 测 算 ✦</div>
          <h1 style={{ fontFamily:'Noto Serif SC,serif', fontSize:26, letterSpacing:8, color:'var(--bz-crimson)', fontWeight:500 }}>
            {step === 1 ? '填 写 信 息' : '玄 学 小 问 卷'}
          </h1>
          <div className="bz-h-ornament">❀ · ❀ · ❀</div>
        </div>

        {/* Step dots */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:24 }}>
          {[1,2].map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: step>=s ? 'linear-gradient(135deg,#e07a9a,#9b2c52)' : 'rgba(244,167,185,.3)',
                color: step>=s ? 'white' : 'var(--bz-crimson)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Noto Serif SC,serif', fontSize:13,
                boxShadow: step>=s ? '0 2px 12px rgba(155,44,82,.3)' : 'none',
                transition:'all .3s',
              }}>{s}</div>
              {i===0 && <div style={{ width:40, height:2, background: step>=2 ? 'linear-gradient(to right,#e07a9a,#9b2c52)' : 'rgba(244,167,185,.3)', borderRadius:2 }}/>}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <>
            {/* Gender */}
            <div className="bz-form-section">
              <div className="bz-form-label">我 是</div>
              <div style={{ display:'flex', gap:10 }}>
                {[{v:'female',l:'女生 👧'},{v:'male',l:'男生 👦'}].map(({v,l}) => (
                  <button key={v} onClick={() => setGender(v)} style={{
                    flex:1, padding:'10px 0', borderRadius:12,
                    fontFamily:'Noto Serif SC,serif', fontSize:13, letterSpacing:3, cursor:'pointer',
                    border: gender===v ? '1.5px solid var(--bz-rose)' : '1px solid rgba(196,90,122,.3)',
                    background: gender===v ? 'linear-gradient(135deg,rgba(244,167,185,.3),rgba(224,122,154,.15))' : 'rgba(255,255,255,.5)',
                    color:'var(--bz-crimson)', transition:'all .2s',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Person A */}
            <div className="bz-form-section">
              <div className="bz-form-label">我 的 信 息</div>
              <input
                className="bz-text-input"
                style={{ marginBottom:10 }}
                placeholder="输入你的名字（1-4字）"
                value={nameA}
                onChange={e => setNameA(e.target.value)}
                maxLength={4}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                <Select value={userBirth.year}  onValueChange={v => setUserBirth({...userBirth, year:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="年" /></SelectTrigger>
                  <SelectContent>{years.map(y=><SelectItem key={y} value={y.toString()}>{y}年</SelectItem>)}</SelectContent>
                </Select>
                <Select value={userBirth.month} onValueChange={v => setUserBirth({...userBirth, month:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="月" /></SelectTrigger>
                  <SelectContent>{months.map(m=><SelectItem key={m} value={m.toString()}>{m}月</SelectItem>)}</SelectContent>
                </Select>
                <Select value={userBirth.day}   onValueChange={v => setUserBirth({...userBirth, day:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="日" /></SelectTrigger>
                  <SelectContent>{days.map(d=><SelectItem key={d} value={d.toString()}>{d}日</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Select value={userBirth.hour} onValueChange={v => setUserBirth({...userBirth, hour:v})}>
                <SelectTrigger style={selectStyle}><SelectValue placeholder="出生时辰（可选）" /></SelectTrigger>
                <SelectContent>{hours.map(h=><SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Person B */}
            <div className="bz-form-section">
              <div className="bz-form-label">TA 的 信 息</div>
              <input
                className="bz-text-input"
                style={{ marginBottom:10 }}
                placeholder="输入对方名字（1-4字）"
                value={nameB}
                onChange={e => setNameB(e.target.value)}
                maxLength={4}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                <Select value={partnerBirth.year}  onValueChange={v => setPartnerBirth({...partnerBirth, year:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="年" /></SelectTrigger>
                  <SelectContent>{years.map(y=><SelectItem key={y} value={y.toString()}>{y}年</SelectItem>)}</SelectContent>
                </Select>
                <Select value={partnerBirth.month} onValueChange={v => setPartnerBirth({...partnerBirth, month:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="月" /></SelectTrigger>
                  <SelectContent>{months.map(m=><SelectItem key={m} value={m.toString()}>{m}月</SelectItem>)}</SelectContent>
                </Select>
                <Select value={partnerBirth.day}   onValueChange={v => setPartnerBirth({...partnerBirth, day:v})}>
                  <SelectTrigger style={selectStyle}><SelectValue placeholder="日" /></SelectTrigger>
                  <SelectContent>{days.map(d=><SelectItem key={d} value={d.toString()}>{d}日</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Select value={partnerBirth.hour} onValueChange={v => setPartnerBirth({...partnerBirth, hour:v})}>
                <SelectTrigger style={selectStyle}><SelectValue placeholder="出生时辰（可选）" /></SelectTrigger>
                <SelectContent>{hours.map(h=><SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <button className="bz-btn bz-btn-primary" style={{ width:'100%', marginTop:8 }} onClick={handleNext}>
              下一步 →
            </button>
          </>
        ) : (
          <>
            {questionnaire.map((q, idx) => (
              <div key={q.key} className="bz-form-section">
                <div className="bz-form-label">{idx+1} · {q.question}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => setAnswers({...answers,[q.key]:opt})} style={{
                      padding:'10px 8px', borderRadius:10,
                      fontFamily:'Noto Serif SC,serif', fontSize:12, letterSpacing:2,
                      cursor:'pointer', transition:'all .2s',
                      border: answers[q.key]===opt ? '1.5px solid var(--bz-rose)' : '1px solid rgba(196,90,122,.25)',
                      background: answers[q.key]===opt ? 'linear-gradient(135deg,rgba(244,167,185,.35),rgba(224,122,154,.2))' : 'rgba(255,255,255,.5)',
                      color:'var(--bz-crimson)',
                      boxShadow: answers[q.key]===opt ? '0 2px 10px rgba(155,44,82,.15)' : 'none',
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button className="bz-btn bz-btn-outline" style={{ flex:1 }} onClick={() => setStep(1)}>← 返回</button>
              <button
                className="bz-btn bz-btn-primary"
                style={{ flex:2, opacity: allAnswered ? 1 : .55, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                测算我们的缘分 ✨
              </button>
            </div>
          </>
        )}

        <div className="bz-disclaimer" style={{ marginTop:24 }}>
          本报告基于传统命理文化生成，仅供娱乐参考<br />不构成任何情感或人生决策建议
        </div>
        <div className="bz-footer">✦ 八字缘分测算 · 月老赐缘 ✦</div>
      </div>
    </div>
  );
}
