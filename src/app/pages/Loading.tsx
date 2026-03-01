import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  type WuXing,
  baseScore,
  buildReportContent,
  detectWarnings,
  detectSpecial,
} from '../../lib/copyLibrary';

// 垫片文案系统
const SHIMS = {
  // 技术计算感 (0-3s)
  tech: [
    '正在推算天干地支…',
    '五行运算中…',
    '查看你们的八字命盘…',
    '姻缘线正在连接…',
    '流年行运分析中…',
  ],
  // 关系感知类 (2-5s)
  sense: [
    '你是不是有时候觉得 TA 忽远忽近…',
    '感觉 TA 对你有点不一样，但又说不准…',
    '你有没有想过，也许 TA 也在等你先开口…',
    '最近是不是有点患得患失…',
    '有时候觉得很近，有时候又觉得隔了点什么…',
    '你有没有在深夜想过，这段关系到底算什么…',
  ],
  // 关系隐患类 + 命中注定类 (5-9s)
  warning: [
    '命盘里有一处值得注意的地方…',
    '检测到潜在的命格摩擦点，分析中…',
    '发现一个影响关系走向的关键节点…',
    '有一件事，可能是你们之间的隐形障碍…',
    '你们之间有一道坎，但也有破解的方式…',
  ],
  fate: [
    '你们相识，可能真的不是偶然…',
    '这段缘分，月老早有安排…',
    '八字显示，你们曾经有过交集…',
    '有些缘分，是刻在命盘里的…',
  ],
  // 时机暗示类 (9-11s)
  timing: [
    '今年对你们来说，是个关键的年份…',
    '最近正好是一个重要的时间窗口…',
    '命盘显示，接下来三个月值得把握…',
  ],
};

const tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const diZhi   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const wuXing  = ['木','木','火','火','土','土','金','金','水','水'];
const wxCls   = ['bz-wx-wood','bz-wx-wood','bz-wx-fire','bz-wx-fire','bz-wx-earth','bz-wx-earth','bz-wx-metal','bz-wx-metal','bz-wx-water','bz-wx-water'];

// ── 年柱：以立春（约每年公历2月4日）为年份分界 ──────────────────────────
function getYearIdx(year: number, month: number, day: number) {
  const y = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  return { tgIdx: ((y - 4) % 10 + 10) % 10, dzIdx: ((y - 4) % 12 + 12) % 12 };
}

// ── 月柱：以节气的「节」为月份分界 + 五虎遁年起月法 ────────────────────────
const JIEQI_DAY  = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];
const DZ_AFTER   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
const DZ_BEFORE  = [0, 1, 2, 3, 4, 5, 6, 7, 8,  9, 10, 11];
const WUHU_YING  = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];

function getMonthIdx(month: number, day: number, yearTgIdx: number) {
  const dzIdx  = day >= JIEQI_DAY[month - 1] ? DZ_AFTER[month - 1] : DZ_BEFORE[month - 1];
  const seq    = (dzIdx - 2 + 12) % 12;
  const tgIdx  = (WUHU_YING[yearTgIdx] + seq) % 10;
  return { tgIdx, dzIdx };
}

// ── 日柱：以1900-01-01=甲戌日（干支序号10）为基准推算 ─────────────────────
function getDayIdx(year: number, month: number, day: number) {
  const base   = new Date(1900, 0, 1);
  const target = new Date(year, month - 1, day);
  const diff   = Math.round((target.getTime() - base.getTime()) / 86400000);
  const idx    = ((10 + diff) % 60 + 60) % 60;
  return { tgIdx: idx % 10, dzIdx: idx % 12 };
}

// ── 时柱：五鼠遁日起时法（由日干决定子时天干）────────────────────────────
const WUSHU_ZI = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
function getHourIdx(hour: number, dayTgIdx: number) {
  const dzIdx = hour / 2;
  const tgIdx = (WUSHU_ZI[dayTgIdx] + dzIdx) % 10;
  return { tgIdx, dzIdx };
}

// ── 组合四柱 ──────────────────────────────────────────────────────────────
function calcGanzhi(year: number, month: number, day: number, hour?: number) {
  const yr  = getYearIdx(year, month, day);
  const mo  = getMonthIdx(month, day, yr.tgIdx);
  const dy  = getDayIdx(year, month, day);
  const hr  = (hour !== undefined && hour >= 0)
    ? getHourIdx(hour, dy.tgIdx)
    : { tgIdx: 0, dzIdx: 0 };

  const col = ({ tgIdx, dzIdx }: { tgIdx: number; dzIdx: number }) => ({
    tg: tianGan[tgIdx], dz: diZhi[dzIdx], wx: wuXing[tgIdx], wxCls: wxCls[tgIdx],
  });
  return [col(yr), col(mo), col(dy), col(hr)];
}

const hourLabels = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时'];
const getHourLabel = (hour?: number) => hour !== undefined ? (hourLabels[Math.floor(hour / 2)] ?? '时辰不详') : '时辰不详';

// 生成确定的结果（使用固定算法，不随机）
function generateFixedResult(data: any) {
  const { nameA = '你', nameB = 'TA', user, partner, questionnaire = {} } = data;
  const gzA = calcGanzhi(user.year, user.month, user.day, user.hour);
  const gzB = calcGanzhi(partner.year, partner.month, partner.day, partner.hour);
  const elemA = gzA[0].wx as WuXing;
  const elemB = gzB[0].wx as WuXing;

  const warnings = detectWarnings(gzA, gzB);
  const specials = detectSpecial(gzA, gzB);
  
  // 使用固定的分数计算（基于八字的确定值）
  const score = baseScore(elemA, elemB, specials, warnings);
  const scoreLabel = score >= 90 ? '天作之合' : score >= 80 ? '良缘天定' : score >= 70 ? '有缘有分' : '缘浅情深';
  const dateA = `${user.year}年${user.month}月${user.day}日 · ${getHourLabel(user.hour)}`;
  const dateB = `${partner.year}年${partner.month}月${partner.day}日 · ${getHourLabel(partner.hour)}`;

  const content = buildReportContent({ nameA, nameB, elemA, elemB, gzA, gzB, score, questionnaire });

  // 使用基于总分的固定子分数
  const subScores = [
    { label: '性格相合', value: Math.min(99, score + (score % 3) - 1) },
    { label: '情感默契', value: Math.min(99, score + ((score + 1) % 5) - 2) },
    { label: '五行相生', value: Math.min(99, score + ((score + 2) % 4) - 1) },
    { label: '婚姻运势', value: Math.min(99, score + ((score + 3) % 3) - 1) },
  ];

  const scoreTags = [
    { text: content.wuxingRel.tag, style: 'fill' as const },
    ...(specials.includes('日主六合') ? [{ text: '日主六合', style: 'outline' as const }] : []),
    ...(specials.includes('日支三合') ? [{ text: '日支三合', style: 'outline' as const }] : []),
    ...(specials.includes('月柱暗合') ? [{ text: '月柱暗合', style: 'outline' as const }] : []),
    ...(specials.length === 0 ? [{ text: '缘分天定', style: 'outline' as const }] : []),
  ].slice(0, 3);

  return {
    nameA, nameB, dateA, dateB, score, scoreLabel,
    scoreDesc:  content.scoreDesc,
    scoreTags,
    subScores,
    ganzhiA: gzA, ganzhiB: gzB,
    wuxingRel: content.wuxingRel,
    highlights: content.highlights,
    warnings:   content.warnings,
    advice:     content.advice,
    liunian:    content.liunian,
    timing:     content.timing,
    zhuangyun:  content.zhuangyun,
    sign:       content.sign,
    shareCard:  content.shareCard,
  };
}

// 阶段定义
type Stage = 1 | 2 | 3 | 4;

export default function Loading() {
  const navigate  = useNavigate();
  const [stage, setStage] = useState<Stage>(1);
  const [progress, setProgress] = useState(0);
  const [shimText, setShimText] = useState('');
  const [showShim, setShowShim] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState('??');
  const [showScore, setShowScore] = useState(false);
  
  const shimTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 预先计算结果（只计算一次）
  const fixedResult = useMemo(() => {
    try {
      const raw = localStorage.getItem('inputData');
      if (!raw) return null;
      return generateFixedResult(JSON.parse(raw));
    } catch {
      return null;
    }
  }, []);

  // 获取当前阶段的垫片文案
  const getShimForStage = (s: Stage): string[] => {
    switch (s) {
      case 1: return SHIMS.tech;
      case 2: return SHIMS.sense;
      case 3: return [...SHIMS.warning, ...SHIMS.fate];
      case 4: return SHIMS.timing;
      default: return SHIMS.tech;
    }
  };

  // 随机获取垫片文案
  const getRandomShim = (shims: string[]): string => {
    return shims[Math.floor(Math.random() * shims.length)];
  };

  // 显示垫片文案
  const showShimText = (s: Stage) => {
    const shims = getShimForStage(s);
    const text = getRandomShim(shims);
    setShimText(text);
    setShowShim(true);
    
    setTimeout(() => {
      setShowShim(false);
    }, 2500);
  };

  // 阶段转换
  const advanceStage = (nextStage: Stage) => {
    if (stageTimeoutRef.current) {
      clearTimeout(stageTimeoutRef.current);
    }
    
    setStage(nextStage);
    showShimText(nextStage);
    
    let nextDelay = 3000;
    if (nextStage === 1) nextDelay = 2000;
    else if (nextStage === 2) nextDelay = 3000;
    else if (nextStage === 3) nextDelay = 4000;
    else if (nextStage === 4) nextDelay = 2000;
    
    if (nextStage < 4) {
      stageTimeoutRef.current = setTimeout(() => {
        advanceStage((nextStage + 1) as Stage);
      }, nextDelay);
    }
  };

  useEffect(() => {
    if (!fixedResult) {
      toast.error('数据丢失，请重新输入');
      navigate('/input');
      return;
    }

    const finalScore = fixedResult.score;
    
    // 阶段1：排盘 (0-2s)
    advanceStage(1);
    
    // 阶段2：五行计算 (2-5s)
    stageTimeoutRef.current = setTimeout(() => {
      advanceStage(2);
    }, 2000);
    
    // 阶段3：合婚推演 (5-9s)
    stageTimeoutRef.current = setTimeout(() => {
      advanceStage(3);
      // 阶段3显示缘分值数字跳动
      setShowScore(true);
      // 生成向最终分数收敛的数字跳动
      let currentRandom = finalScore;
      const interval = setInterval(() => {
        // 逐渐向最终分数收敛
        const diff = finalScore - currentRandom;
        if (Math.abs(diff) <= 2) {
          setScoreDisplay(String(finalScore));
        } else {
          // 随机偏移，但逐渐减小
          const offset = Math.floor(Math.random() * 6) - 3;
          currentRandom = Math.max(70, Math.min(100, finalScore + offset));
          setScoreDisplay(String(currentRandom));
        }
      }, 350);
      setTimeout(() => {
        clearInterval(interval);
        setScoreDisplay(String(finalScore));
      }, 3000);
    }, 5000);
    
    // 阶段4：生成报告 (9-11s)
    stageTimeoutRef.current = setTimeout(() => {
      advanceStage(4);
      setShowScore(false);
    }, 9000);
    
    // 进度条逻辑
    let currentProgress = 0;
    const updateProgress = () => {
      if (currentProgress >= 98) return;
      
      if (stage === 1) {
        currentProgress = Math.min(currentProgress + 3, 20);
      }
      else if (stage === 2) {
        currentProgress = Math.min(currentProgress + 4, 45);
      }
      else if (stage === 3) {
        if (currentProgress > 50 && currentProgress < 55) {
          // 停顿
        } else if (currentProgress > 70 && currentProgress < 75) {
          // 停顿
        } else {
          currentProgress = Math.min(currentProgress + 2, 85);
        }
      }
      else {
        currentProgress = Math.min(currentProgress + 8, 100);
      }
      
      setProgress(currentProgress);
    };
    
    progressIntervalRef.current = setInterval(updateProgress, 200);

    // 保存结果并跳转
    const run = async () => {
      try {
        await new Promise(r => setTimeout(r, 11000));
        
        localStorage.setItem('reportResult', JSON.stringify(fixedResult));
        const rem = parseInt(localStorage.getItem('codeRemaining') || '0') - 1;
        localStorage.setItem('codeRemaining', String(rem));
        
        setTimeout(() => navigate('/result'), 800);
      } catch {
        toast.error('生成失败，请重试');
        setTimeout(() => navigate('/input'), 2000);
      }
    };

    run();
    
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (shimTimeoutRef.current) clearTimeout(shimTimeoutRef.current);
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
    };
  }, [navigate, fixedResult]);

  // 阶段标题
  const stageTitles = {
    1: '八字排盘',
    2: '五行计算',
    3: '合婚推演',
    4: '生成报告',
  };

  const stageDescs = {
    1: '干支逐字飞入，依次亮起',
    2: '金木水火土节点依次连线',
    3: '深度解析中…',
    4: '月老已签定，报告即将呈现',
  };

  return (
    <div className="bz-page">
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} id="loadPetals" />

      <div className="bz-loading-center" style={{ maxWidth: 600, padding: '0 20px' }}>
        {/* 阶段指示器 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 12, 
          marginBottom: 32 
        }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: stage >= s ? 'var(--bz-rose)' : 'rgba(196,90,122,.3)',
              transition: 'all .3s',
            }} />
          ))}
        </div>

        {/* 八字字符动画 - 阶段1 */}
        <div className="bz-loading-chars" style={{ 
          opacity: stage === 1 ? 1 : 0.3,
          transform: stage === 1 ? 'scale(1)' : 'scale(0.9)',
          transition: 'all .5s'
        }}>
          {stage === 1 ? (
            <>
              {['甲','子'].map((c,i) => (
                <span key={i} className="bz-loading-char" style={{ animationDelay: `${i*0.3}s`, fontSize: 36 }}>{c}</span>
              ))}
              <span className="bz-loading-heart" style={{ animationDelay: '0.6s', fontSize: 28 }}>❤</span>
              {['乙','丑'].map((c,i) => (
                <span key={i} className="bz-loading-char" style={{ animationDelay: `${(i+2)*0.3}s`, fontSize: 36 }}>{c}</span>
              ))}
            </>
          ) : (
            <span style={{ fontFamily: 'Noto Serif SC, serif', fontSize: 32, color: 'var(--bz-crimson)' }}>
              {stage >= 2 ? '八字排盘完成' : '…'}
            </span>
          )}
        </div>

        {/* 五行动画 - 阶段2 */}
        {stage >= 2 && (
          <div style={{ 
            display: 'flex', 
            gap: 20, 
            marginTop: 24,
            opacity: stage === 2 ? 1 : 0.3,
            transition: 'opacity .5s',
            justifyContent: 'center'
          }}>
            {['木','火','土','金','水'].map((wx, i) => (
              <div key={wx} style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: stage === 2 && i < 4 ? 'rgba(224,122,154,.2)' : 'rgba(196,90,122,.1)',
                border: `2px solid var(--bz-crimson)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Noto Serif SC, serif',
                fontSize: 16,
                color: 'var(--bz-crimson)',
                transition: 'all .3s',
                transitionDelay: stage === 2 ? `${i * 0.25}s` : '0s',
                transform: stage === 2 && i < 4 ? 'scale(1.15)' : 'scale(1)',
              }}>
                {wx}
              </div>
            ))}
          </div>
        )}

        {/* 垫片文案 */}
        <div style={{ 
          marginTop: 40, 
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontFamily: 'Noto Serif SC, serif',
            fontSize: 17,
            color: 'var(--bz-crimson)',
            textAlign: 'center',
            opacity: showShim ? 1 : 0,
            transform: showShim ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all .4s ease',
            padding: '12px 20px',
            background: 'rgba(255,255,255,.7)',
            borderRadius: 12,
            maxWidth: '90%',
          }}>
            {shimText || stageDescs[stage as Stage]}
          </div>
        </div>

        {/* 缘分值数字跳动 - 阶段3 */}
        {showScore && (
          <div style={{
            marginTop: 24,
            fontFamily: 'Noto Serif SC, serif',
            fontSize: 28,
            color: 'var(--bz-crimson)',
            opacity: showScore ? 1 : 0,
            transition: 'opacity .3s',
            textAlign: 'center'
          }}>
            缘分值: <span style={{ fontWeight: 'bold', fontSize: 32 }}>{scoreDisplay}</span>
          </div>
        )}

        {/* 进度条 */}
        <div className="bz-progress-wrap" style={{ marginTop: 40 }}>
          <div className="bz-loading-quote" style={{ 
            fontFamily: 'Noto Serif SC, serif', 
            fontSize: 18,
            color: 'var(--bz-crimson)',
            marginBottom: 12,
            textAlign: 'center'
          }}>
            {stageTitles[stage as Stage]}
          </div>
          <div className="bz-progress-bar-bg" style={{ 
            height: 8, 
            background: 'rgba(244,167,185,.3)', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div 
              className="bz-progress-bar-fill" 
              style={{ 
                width: `${progress}%`,
                transition: 'width .3s ease',
                height: '100%',
                background: 'linear-gradient(90deg, #e07a9a, #9b2c52)',
                borderRadius: 4
              }} 
            />
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: 12,
            fontSize: 15,
            color: 'rgba(196,90,122,.8)'
          }}>
            {Math.round(progress)}%
          </div>
        </div>

        {/* 底部装饰 */}
        <div style={{ marginTop: 36, display:'flex', gap: 20, justifyContent: 'center', opacity: .3 }}>
          {['❀','✿','❁','✾'].map((c,i) => (
            <span key={i} style={{ fontSize: 28, color:'var(--bz-rose)', animation:`bz-pulse ${1.5+i*0.2}s ease-in-out infinite` }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
