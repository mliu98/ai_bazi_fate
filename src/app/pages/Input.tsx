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

// 问卷第一组：关系现状 (Q1-Q5)
const questionnaireGroup1 = [
  { key: 'q1', question: '你们现在是什么关系？', options: ['已经在一起了', '暧昧中还没桶破', '我在单方面喜欢他', '刚认识在观察'] },
  { key: 'q2', question: '你们认识多久了？', options: ['不到3个月', '3个月到1年', '1到3年', '3年以上老相识了'] },
  { key: 'q3', question: '你们平时主要怎么联系？', options: ['天天发消息聊不停', '有一搭没一搭', '主要见面少发消息', '基本靠缘分偶尔碰到'] },
  { key: 'q4', question: '他主动找过你吗？', options: ['经常主动找我', '偶尔主动', '基本都是我主动', '说不清楚各一半'] },
  { key: 'q5', question: '你们相识是怎么来的？', options: ['朋友介绍', '同学', '同事', '偶然认识（陌生人）', '网上认识线下见面'] },
];

// 问卷第二组：相处细节 (Q6-Q10)
const questionnaireGroup2 = [
  { key: 'q6', question: '你们在一起的时候，气氛更多是？', options: ['话多停不下来那种', '安静但不尴尬很舒服', '有点紧张但很心动', '还不太熟说话会紧张'] },
  { key: 'q7', question: '他让你最心动的是哪一点？', options: ['对我很细心体贴', '很幽默总逗我笑', '有能力有主见很稳', '莫名就是感觉对了'] },
  { key: 'q8', question: '你们之间有没有过争吵或冷战？', options: ['从来没有还太平', '有过小摩擦但没大问题', '吵过架但后来好了', '有过一段时间闹僵'] },
  { key: 'q9', question: '他对你的感觉，你觉得有几分？', options: ['应该喜欢我', '感觉有好感但不确定', '完全猜不透', '应该只把我当朋友'] },
  { key: 'q10', question: '你们有没有做过什么「有仪式感」的事？', options: ['一起过过节日', '有共同的小习惯或暗语', '有过难忘的约会', '暂时还没有'] },
];

// 问卷第三组：内心感受 (Q11-Q15)
const questionnaireGroup3 = [
  { key: 'q11', question: '在他面前，你是什么状态？', options: ['很自然，不用装', '会有点在意自己表现', '很紧张但喜欢这种感觉', '还没到这种程度'] },
  { key: 'q12', question: '你在他身上花了多少心思？', options: ['经常想他，注意力都在他身上', '喜欢但还好没到魂不守舍', '有点心动但克制', '只是普通感兴趣'] },
  { key: 'q13', question: '你觉得你们最大的障碍是什么？', options: ['没啥大障碍，就差桶破那层纸', '不确定对方的心意', '距离或异地问题', '性格差异有点大'] },
  { key: 'q14', question: '你有没有把他介绍给朋友或家人？', options: ['跟闺蜜说过了', '家人也知道了', '还没，太早了', '不想说怕被问东问西'] },
  { key: 'q15', question: '你最想从这份测算里知道什么？', options: ['我们到底有没有缘分', '他是不是认真喜欢我', '我们什么时候能在一起', '长期在一起合不合适'] },
];

const groupTitles = [
  { subtitle: '先聊聊你们的故事 🌙', progress: '1 / 3 组 · 共 15 题' },
  { subtitle: '再说说你们在一起是什么感觉 💬', progress: '2 / 3 组 · 共 15 题' },
  { subtitle: '最后说说你的心里话 🔮', progress: '3 / 3 组 · 共 15 题' },
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
  
  // 当前问卷组 (2=第一组, 3=第二组, 4=第三组)
  const [quizGroup, setQuizGroup] = useState(2);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  // 当前已选待确认的答案
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);

  const currentYear = 2026;
  const years  = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days   = Array.from({ length: 31 }, (_, i) => i + 1);

  // 获取当前组的问卷
  const getCurrentGroup = () => {
    switch (quizGroup) {
      case 2: return questionnaireGroup1;
      case 3: return questionnaireGroup2;
      case 4: return questionnaireGroup3;
      default: return questionnaireGroup1;
    }
  };

  // 当前题目
  const currentQuestion = getCurrentGroup()[currentQIndex];

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

  // 处理选择答案（只是预览，不直接提交）
  const handleSelectAnswer = (answer: string) => {
    setPendingAnswer(answer);
  };

  // 确认答案并跳到下一题
  const handleConfirmAnswer = () => {
    if (!pendingAnswer) return;
    setAnswers({...answers, [currentQuestion.key]: pendingAnswer});
    setPendingAnswer(null);
    
    // 自动进入下一题
    setTimeout(() => {
      const group = getCurrentGroup();
      if (currentQIndex < group.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        if (quizGroup === 2) { setQuizGroup(3); setCurrentQIndex(0); }
        else if (quizGroup === 3) { setQuizGroup(4); setCurrentQIndex(0); }
      }
    }, 200);
  };

  // 检查当前组是否完成
  const isCurrentGroupComplete = () => {
    const group = getCurrentGroup();
    return group.every(q => answers[q.key]);
  };

  // 处理上一题
  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    } else {
      // 回到上一组
      if (quizGroup === 3) {
        setQuizGroup(2);
        setCurrentQIndex(questionnaireGroup1.length - 1);
      } else if (quizGroup === 4) {
        setQuizGroup(3);
        setCurrentQIndex(questionnaireGroup2.length - 1);
      }
    }
  };

  // 处理提交
  const handleSubmit = () => {
    const allQuestions = [...questionnaireGroup1, ...questionnaireGroup2, ...questionnaireGroup3];
    const unanswered = allQuestions.filter(q => !answers[q.key]);
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

  // 返回按钮处理
  const handleBack = () => {
    if (step === 2) {
      // 从问卷返回到第一步
      if (quizGroup === 2 && currentQIndex === 0) {
        setStep(1);
      } else {
        handlePrev();
      }
    }
  };

  const selectStyle: React.CSSProperties = { borderColor: 'rgba(196,90,122,.3)', fontFamily: 'Noto Serif SC,serif', fontSize: 16 };

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

      <div className="bz-container" style={{ paddingTop: 0, maxWidth: 600 }}>
        <div className="bz-report-header" style={{ paddingTop: 40, paddingBottom: 20 }}>
          <div className="bz-subtitle" style={{ fontSize: 14 }}>✦ 八 字 合 婚 · 缘 分 测 算 ✦</div>
          <h1 style={{ fontFamily:'Noto Serif SC,serif', fontSize:28, letterSpacing:8, color:'var(--bz-crimson)', fontWeight:500 }}>
            {step === 1 ? '填 写 信 息' : '玄 学 小 问 卷'}
          </h1>
          <div className="bz-h-ornament">❀ · ❀ · ❀</div>
        </div>

        {/* Step dots */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:24 }}>
          {[1,2].map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background: step>=s ? 'linear-gradient(135deg,#e07a9a,#9b2c52)' : 'rgba(244,167,185,.3)',
                color: step>=s ? 'white' : 'var(--bz-crimson)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Noto Serif SC,serif', fontSize:15,
                boxShadow: step>=s ? '0 2px 12px rgba(155,44,82,.3)' : 'none',
                transition:'all .3s',
              }}>{s}</div>
              {i===0 && <div style={{ width:50, height:2, background: step>=2 ? 'linear-gradient(to right,#e07a9a,#9b2c52)' : 'rgba(244,167,185,.3)', borderRadius:2 }}/>}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <>
            {/* Gender */}
            <div className="bz-form-section">
              <div className="bz-form-label" style={{ fontSize: 16 }}>我 是</div>
              <div style={{ display:'flex', gap:12 }}>
                {[{v:'female',l:'女生 👧'},{v:'male',l:'男生 👦'}].map(({v,l}) => (
                  <button key={v} onClick={() => setGender(v)} style={{
                    flex:1, padding:'14px 0', borderRadius:12,
                    fontFamily:'Noto Serif SC,serif', fontSize:15, letterSpacing:3, cursor:'pointer',
                    border: gender===v ? '1.5px solid var(--bz-rose)' : '1px solid rgba(196,90,122,.3)',
                    background: gender===v ? 'linear-gradient(135deg,rgba(244,167,185,.3),rgba(224,122,154,.15))' : 'rgba(255,255,255,.5)',
                    color:'var(--bz-crimson)', transition:'all .2s',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Person A */}
            <div className="bz-form-section">
              <div className="bz-form-label" style={{ fontSize: 16 }}>我 的 信 息</div>
              <input
                className="bz-text-input"
                style={{ marginBottom:12, fontSize: 16 }}
                placeholder="输入你的名字（1-4字）"
                value={nameA}
                onChange={e => setNameA(e.target.value)}
                maxLength={4}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
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
              <div className="bz-form-label" style={{ fontSize: 16 }}>TA 的 信 息</div>
              <input
                className="bz-text-input"
                style={{ marginBottom:12, fontSize: 16 }}
                placeholder="输入对方名字（1-4字）"
                value={nameB}
                onChange={e => setNameB(e.target.value)}
                maxLength={4}
              />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
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

            <button className="bz-btn bz-btn-primary" style={{ width:'100%', marginTop:12, fontSize: 16, padding: '14px 0' }} onClick={handleNext}>
              下一步 →
            </button>
          </>
        ) : (
          <>
            {/* 问卷组过渡页 */}
            {currentQIndex === 0 && quizGroup > 2 && (
              <div className="bz-form-section" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontFamily: 'Noto Serif SC, serif', fontSize: 16, color: 'var(--bz-crimson)', marginBottom: 8 }}>
                  ❀ 第一组完成，月老已记下 🌙 ❀
                </div>
              </div>
            )}
            {currentQIndex === 0 && quizGroup === 4 && (
              <div className="bz-form-section" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontFamily: 'Noto Serif SC, serif', fontSize: 16, color: 'var(--bz-crimson)', marginBottom: 8 }}>
                  ❀ 第二组完成，继续加油 💬 ❀
                </div>
              </div>
            )}

            {/* 问卷标题 */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Noto Serif SC, serif', fontSize: 15, color: 'var(--bz-crimson)', marginBottom: 6 }}>
                {groupTitles[quizGroup - 2].subtitle}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(196,90,122,.7)' }}>
                {groupTitles[quizGroup - 2].progress}
              </div>
            </div>

            {/* 进度条 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                height: 5, 
                background: 'rgba(244,167,185,.3)', 
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${((currentQIndex + 1) / getCurrentGroup().length) * 100}%`,
                  background: 'linear-gradient(90deg, #e07a9a, #9b2c52)',
                  borderRadius: 3,
                  transition: 'width .3s ease'
                }} />
              </div>
            </div>

            {/* 当前题目 */}
            <div className="bz-form-section">
              <div className="bz-form-label" style={{ fontSize: 17 }}>
                {currentQIndex + 1} · {currentQuestion.question}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop: 12 }}>
                {currentQuestion.options.map(opt => (
                  <button key={opt} onClick={() => handleSelectAnswer(opt)} style={{
                    padding:'14px 10px', borderRadius:12,
                    fontFamily:'Noto Serif SC,serif', fontSize:14, letterSpacing:1,
                    cursor:'pointer', transition:'all .2s',
                    border: (pendingAnswer || answers[currentQuestion.key]) === opt ? '2px solid var(--bz-rose)' : '1px solid rgba(196,90,122,.25)',
                    background: (pendingAnswer || answers[currentQuestion.key]) === opt ? 'linear-gradient(135deg,rgba(244,167,185,.35),rgba(224,122,154,.2))' : 'rgba(255,255,255,.5)',
                    color:'var(--bz-crimson)',
                    boxShadow: (pendingAnswer || answers[currentQuestion.key]) === opt ? '0 2px 12px rgba(155,44,82,.2)' : 'none',
                  }}>{opt}</button>
                ))}
              </div>
            </div>

            {/* 底部操作 */}
            <div style={{ display:'flex', gap:12, marginTop: 16 }}>
              <button 
                className="bz-btn bz-btn-outline" 
                style={{ flex:1, fontSize: 15, padding: '12px 0' }} 
                onClick={handleBack}
              >
                ← 返回
              </button>
              {quizGroup === 4 && isCurrentGroupComplete() ? (
                <button 
                  className="bz-btn bz-btn-primary" 
                  style={{ flex:2, fontSize: 16, padding: '12px 0' }}
                  onClick={handleSubmit}
                >
                  测算我们的缘分 ✨
                </button>
              ) : pendingAnswer ? (
                <button 
                  className="bz-btn bz-btn-primary" 
                  style={{ flex:2, fontSize: 16, padding: '12px 0' }}
                  onClick={handleConfirmAnswer}
                >
                  确认答案 →
                </button>
              ) : isCurrentGroupComplete() ? (
                <button 
                  className="bz-btn bz-btn-primary" 
                  style={{ flex:2, fontSize: 16, padding: '12px 0' }}
                  onClick={() => {
                    if (quizGroup === 2) { setQuizGroup(3); setCurrentQIndex(0); }
                    else if (quizGroup === 3) { setQuizGroup(4); setCurrentQIndex(0); }
                  }}
                >
                  下一组 →
                </button>
              ) : (
                <button 
                  className="bz-btn bz-btn-primary" 
                  style={{ flex:2, fontSize: 16, padding: '12px 0' }}
                  disabled
                >
                  请选择答案
                </button>
              )}
            </div>
          </>
        )}

        <div className="bz-disclaimer" style={{ marginTop:28, fontSize: 13 }}>
          本报告基于传统命理文化生成，仅供娱乐参考<br />不构成任何情感或人生决策建议
        </div>
        <div className="bz-footer" style={{ fontSize: 13 }}>✦ TA是我的正缘吗？ · 月老赐缘 ✦</div>
      </div>
    </div>
  );
}
