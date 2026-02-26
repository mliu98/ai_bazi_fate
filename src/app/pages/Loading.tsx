import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  type WuXing,
  baseScore,
  buildReportContent,
  detectWarnings,
  detectSpecial,
} from '../../lib/copyLibrary';

const quotes = [
  '正在推算天干地支…',
  '五行相生相克运算中…',
  '查看你们的八字命盘…',
  '姻缘线正在连接…',
  '专属报告生成中…',
  '命理师正在解读…',
];

const tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const diZhi   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const wuXing  = ['木','木','火','火','土','土','金','金','水','水']; // 天干五行
const wxCls   = ['bz-wx-wood','bz-wx-wood','bz-wx-fire','bz-wx-fire','bz-wx-earth','bz-wx-earth','bz-wx-metal','bz-wx-metal','bz-wx-water','bz-wx-water'];

// ── 年柱：以立春（约每年公历2月4日）为年份分界 ──────────────────────────
function getYearIdx(year: number, month: number, day: number) {
  // 2月4日之前仍属上一年（立春简化取2月4日）
  const y = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  return { tgIdx: ((y - 4) % 10 + 10) % 10, dzIdx: ((y - 4) % 12 + 12) % 12 };
}

// ── 月柱：以节气的「节」为月份分界 + 五虎遁年起月法 ────────────────────────
// 各月「节」的近似公历日期（index = 月份-1）
// 1=小寒, 2=立春, 3=惊蛰, 4=清明, 5=立夏, 6=芒种,
// 7=小暑, 8=立秋, 9=白露, 10=寒露, 11=立冬, 12=大雪
const JIEQI_DAY  = [6, 4, 6, 5, 6, 6, 7, 7, 8, 8, 7, 7];
// 节后月支（0=子…11=亥）：1月小寒后=丑(1), 2月立春后=寅(2)…12月大雪后=子(0)
const DZ_AFTER   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
// 节前月支（仍属上一个月）
const DZ_BEFORE  = [0, 1, 2, 3, 4, 5, 6, 7, 8,  9, 10, 11];
// 五虎遁：寅月（正月）起始天干，按年干索引
// 甲/己→丙(2), 乙/庚→戊(4), 丙/辛→庚(6), 丁/壬→壬(8), 戊/癸→甲(0)
const WUHU_YING  = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];

function getMonthIdx(month: number, day: number, yearTgIdx: number) {
  const dzIdx  = day >= JIEQI_DAY[month - 1] ? DZ_AFTER[month - 1] : DZ_BEFORE[month - 1];
  const seq    = (dzIdx - 2 + 12) % 12; // 从寅月(dzIdx=2)起算的月序
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
// 甲/己→甲(0), 乙/庚→丙(2), 丙/辛→戊(4), 丁/壬→庚(6), 戊/癸→壬(8)
const WUSHU_ZI = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
// Input 表单 hour 编码：0=子时, 2=丑时, 4=寅时…22=亥时（均为偶数）
function getHourIdx(hour: number, dayTgIdx: number) {
  const dzIdx = hour / 2; // 子=0, 丑=1, …亥=11
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
    : { tgIdx: 0, dzIdx: 0 }; // 时辰不详默认甲子

  const col = ({ tgIdx, dzIdx }: { tgIdx: number; dzIdx: number }) => ({
    tg: tianGan[tgIdx], dz: diZhi[dzIdx], wx: wuXing[tgIdx], wxCls: wxCls[tgIdx],
  });
  return [col(yr), col(mo), col(dy), col(hr)];
}

const hourLabels = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时'];
const getHourLabel = (hour?: number) => hour !== undefined ? (hourLabels[Math.floor(hour / 2)] ?? '时辰不详') : '时辰不详';

function generateMockResult(data: any) {
  const { nameA = '你', nameB = 'TA', user, partner, questionnaire = {} } = data;
  const gzA = calcGanzhi(user.year, user.month, user.day, user.hour);
  const gzB = calcGanzhi(partner.year, partner.month, partner.day, partner.hour);
  // 命主五行取年柱天干的五行（已含立春分界）
  const elemA = gzA[0].wx as WuXing;
  const elemB = gzB[0].wx as WuXing;

  // 从话术库计算缘分分数
  const warnings = detectWarnings(gzA, gzB);
  const specials = detectSpecial(gzA, gzB);
  const score = baseScore(elemA, elemB, specials, warnings);
  const scoreLabel = score >= 90 ? '天作之合' : score >= 80 ? '良缘天定' : score >= 70 ? '有缘有分' : '缘浅情深';
  const dateA = `${user.year}年${user.month}月${user.day}日 · ${getHourLabel(user.hour)}`;
  const dateB = `${partner.year}年${partner.month}月${partner.day}日 · ${getHourLabel(partner.hour)}`;

  // 从话术库生成各模块内容
  const content = buildReportContent({ nameA, nameB, elemA, elemB, gzA, gzB, score, questionnaire });

  // subScores 微调：基于总分浮动
  const subScores = [
    { label: '性格相合', value: Math.min(99, score + Math.floor(Math.random()*8) - 2) },
    { label: '情感默契', value: Math.min(99, score + Math.floor(Math.random()*8) - 4) },
    { label: '五行相生', value: Math.min(99, score + Math.floor(Math.random()*8) - 2) },
    { label: '婚姻运势', value: Math.min(99, score + Math.floor(Math.random()*8) - 4) },
  ];

  // scoreTags：基于特殊关系和五行
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

export default function Loading() {
  const navigate  = useNavigate();
  const [quote,   setQuote]   = useState(quotes[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const qI = setInterval(() => setQuote(quotes[Math.floor(Math.random()*quotes.length)]), 1400);
    const pI = setInterval(() => setProgress(p => p >= 90 ? p : p + Math.random()*12), 300);

    const run = async () => {
      try {
        const raw = localStorage.getItem('inputData');
        if (!raw) { toast.error('数据丢失，请重新输入'); navigate('/input'); return; }
        await new Promise(r => setTimeout(r, 2200));
        const result = generateMockResult(JSON.parse(raw));
        localStorage.setItem('reportResult', JSON.stringify(result));
        const rem = parseInt(localStorage.getItem('codeRemaining') || '0') - 1;
        localStorage.setItem('codeRemaining', String(rem));
        setProgress(100);
        setTimeout(() => navigate('/result'), 700);
      } catch {
        toast.error('生成失败，请重试');
        setTimeout(() => navigate('/input'), 2000);
      }
    };

    run();
    return () => { clearInterval(qI); clearInterval(pI); };
  }, [navigate]);

  return (
    <div className="bz-page">
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }} id="loadPetals" />

      <div className="bz-loading-center">
        <div className="bz-loading-orb">🔮</div>

        <div className="bz-loading-chars">
          {['甲','子'].map((c,i) => (
            <span key={i} className="bz-loading-char" style={{ animationDelay:`${i*0.15}s` }}>{c}</span>
          ))}
          <span className="bz-loading-heart">❤</span>
          {['乙','丑'].map((c,i) => (
            <span key={i} className="bz-loading-char" style={{ animationDelay:`${(i+2)*0.15}s` }}>{c}</span>
          ))}
        </div>

        <div className="bz-loading-quote">{quote}</div>
        <div className="bz-loading-sub">AI命理师正在为你生成专属报告</div>

        <div className="bz-progress-wrap">
          <div className="bz-progress-label">
            <span className="bz-progress-text">测算进度</span>
            <span className="bz-progress-pct">{Math.round(progress)}%</span>
          </div>
          <div className="bz-progress-bar-bg">
            <div className="bz-progress-bar-fill" style={{ width:`${progress}%` }} />
          </div>
        </div>

        <div style={{ marginTop:28, display:'flex', gap:16, opacity:.25 }}>
          {['❀','✿','❁','✾'].map((c,i) => (
            <span key={i} style={{ fontSize:24, color:'var(--bz-rose)', animation:`bz-pulse ${1.5+i*0.2}s ease-in-out infinite` }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
