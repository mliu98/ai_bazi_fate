/**
 * 八字计算引擎 v2.0
 * 用于计算八字和合婚评分
 */

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干对应五行
const WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支对应五行
const DIZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 六合表
const LIUHE = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午'
};

// 三合局
const SANHE = {
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'],
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉']
};

// 六冲
const LIUCHONG = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
};

// 天干相克
const XIANGKE = {
  '甲': '戊', '戊': '甲',
  '乙': '己', '己': '乙',
  '丙': '庚', '庚': '丙',
  '丁': '辛', '辛': '丁',
  '壬': '癸', '癸': '壬'
};

// 天干五合
const WUHE = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊'
};

// 时柱天干推算（日干 -> 时干索引）
// 子时=0, 丑时=1, ... 亥时=11
const SHICHEN_GAN = {
  '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丁': ['己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚'],
  '戊': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '己': ['辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬'],
  '庚': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '辛': ['癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲'],
  '壬': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '癸': ['乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙']
};

// 地支序号
const DIZHI_INDEX = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3,
  '辰': 4, '巳': 5, '午': 6, '未': 7,
  '申': 8, '酉': 9, '戌': 10, '亥': 11
};

// 立春日期表（用于确定年柱）
const LICHUN = {
  1970: '02-04', 1971: '02-04', 1972: '02-04', 1973: '02-04', 1974: '02-04',
  1975: '02-04', 1976: '02-04', 1977: '02-04', 1978: '02-04', 1979: '02-04',
  1980: '02-04', 1981: '02-04', 1982: '02-04', 1983: '02-04', 1984: '02-04',
  1985: '02-04', 1986: '02-04', 1987: '02-04', 1988: '02-04', 1989: '02-04',
  1990: '02-04', 1991: '02-04', 1992: '02-04', 1993: '02-04', 1994: '02-04',
  1995: '02-04', 1996: '02-04', 1997: '02-04', 1998: '02-04', 1999: '02-04',
  2000: '02-04', 2001: '02-04', 2002: '02-04', 2003: '02-04', 2004: '02-04',
  2005: '02-04', 2006: '02-04', 2007: '02-04', 2008: '02-04', 2009: '02-04',
  2010: '02-04', 2011: '02-04', 2012: '02-04', 2013: '02-04', 2014: '02-04',
  2015: '02-04', 2016: '02-04', 2017: '02-04', 2018: '02-04', 2019: '02-04',
  2020: '02-04', 2021: '02-03', 2022: '02-04', 2023: '02-04', 2024: '02-04',
  2025: '02-03', 2026: '02-04', 2027: '02-04', 2028: '02-04', 2029: '02-03',
  2030: '02-04'
};

/**
 * 计算年柱
 * 以立春为分界线
 */
function getYearZhu(year, month, day) {
  const lichunDate = LICHUN[year] || '02-04';
  const [ly, lm, ld] = lichunDate.split('-').map(Number);
  
  // 如果生日在立春之前，则属上一年
  let actualYear = year;
  if (month < lm || (month === lm && day < ld)) {
    actualYear = year - 1;
  }
  
  // 甲子年 = 1984年
  const ganIndex = (actualYear - 1984) % 10;
  const zhiIndex = (actualYear - 1984) % 12;
  
  return {
    gan: TIANGAN[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    zhi: DIZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
  };
}

/**
 * 计算月柱
 * 以节气为分界（简化版：使用节令）
 */
function getMonthZhu(year, month, day) {
  // 月支：正月经节令为寅月，二月为卯月，以此类推
  // 但实际上是以节令为准，这里简化处理
  // 简化：1-2月为寅月前（丑月），3-4月为辰月前（卯月），等等
  
  // 更精确：使用节气日期
  // 简单处理：每月15日之前用上月
  const monthZhiBase = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];
  let monthIndex = month - 1;
  if (day < 15) {
    monthIndex = (monthIndex + 11) % 12;
  }
  
  // 年干决定月干：年干*2 + 月份 = 月干索引（超过9则-10）
  // 1944: 甲(0)*2+1=1->乙, 1984: 甲(0)*2+1=1->乙
  const yearGanIdx = TIANGAN.indexOf(getYearZhu(year, month, day).gan);
  let monthGanIdx = (yearGanIdx * 2 + month) % 10;
  
  return {
    gan: TIANGAN[monthGanIdx],
    zhi: monthZhiBase[monthIndex]
  };
}

/**
 * 计算日柱
 * 使用蔡勒公式
 */
function getDayZhu(year, month, day) {
  const date = new Date(year, month - 1, day);
  
  let a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  let y = date.getFullYear() + 4800 - a;
  let m = date.getMonth() + 1 + 12 * a - 3;
  
  // 蔡勒公式
  let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // 转换成天干地支
  const ganIndex = (jd + 6) % 10;
  const zhiIndex = (jd + 8) % 12;
  
  return {
    gan: TIANGAN[ganIndex],
    zhi: DIZHI[zhiIndex]
  };
}

/**
 * 计算时柱
 * @param {string} dayGan - 日干
 * @param {number} hour - 小时 (0-23)
 */
function getHourZhu(dayGan, hour) {
  // 时支：23-1点=子时(0)，1-3=丑时(1)，以此类推
  let zhiIndex = Math.floor((hour + 1) / 2) % 12;
  
  // 时干：根据日干推算
  let ganList = SHICHEN_GAN[dayGan] || SHICHEN_GAN['甲'];
  let gan = ganList[zhiIndex];
  
  return {
    gan: gan,
    zhi: DIZHI[zhiIndex]
  };
}

/**
 * 计算八字
 */
function getBazi(year, month, day, hour = 12) {
  const yearZhu = getYearZhu(year, month, day);
  const monthZhu = getMonthZhu(year, month, day);
  const dayZhu = getDayZhu(year, month, day);
  const hourZhu = getHourZhu(dayZhu.gan, hour);
  
  return {
    year: yearZhu,
    month: monthZhu,
    day: dayZhu,
    hour: hourZhu
  };
}

/**
 * 计算五行
 */
function getWuxing(bazi) {
  const counts = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  
  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  
  pillars.forEach(p => {
    // 天干五行
    counts[WUXING[p.gan]] = (counts[WUXING[p.gan]] || 0) + 1;
    // 地支五行（含两个藏干，简化只取本气）
    counts[DIZHI_WUXING[p.zhi]] = (counts[DIZHI_WUXING[p.zhi]] || 0) + 1;
  });
  
  return counts;
}

/**
 * 纳音五行（补充参考）
 */
function getNayin(gan, zhi) {
  const nayin = {
    '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
    '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
    '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
    '甲申': '井泉水', '乙酉': '井泉水', '丙戌': '屋上土', '丁亥': '屋上土',
    '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
    '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂石金', '乙未': '砂石金',
    '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
    '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
    '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
    '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
    '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
    '丙辰': '砂石金', '丁巳': '砂石金', '戊午': '天上火', '己未': '天上火',
    '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
  };
  return nayin[gan + zhi] || '';
}

/**
 * 计算合婚评分
 */
function calcCompatibility(bazi1, bazi2) {
  let score = 50; // 基础分
  const highlights = [];
  const warnings = [];
  
  const pillars1 = [bazi1.year, bazi1.month, bazi1.day, bazi1.hour];
  const pillars2 = [bazi2.year, bazi2.month, bazi2.day, bazi2.hour];
  const scoreWeights = [10, 15, 20, 5]; // 年、月、日、时柱分数
  
  // 检查相合（六合+三合+五合）
  pillars1.forEach((p1, i) => {
    const p2 = pillars2[i];
    
    // 六合 +20
    if (LIUHE[p1.zhi] === p2.zhi) {
      score += scoreWeights[i];
      highlights.push(`${p1.zhi}${p2.zhi}合`);
    }
    
    // 三合 +10
    if (SANHE[p1.zhi] && SANHE[p1.zhi].includes(p2.zhi)) {
      score += Math.floor(scoreWeights[i] / 2);
      highlights.push(`${p1.zhi}${p2.zhi}会`);
    }
    
    // 天干五合 +15
    if (WUHE[p1.gan] === p2.gan) {
      score += Math.floor(scoreWeights[i] / 2);
      highlights.push(`${p1.gan}${p2.gan}合`);
    }
  });
  
  // 检查相冲
  pillars1.forEach((p1, i) => {
    const p2 = pillars2[i];
    
    if (LIUCHONG[p1.zhi] === p2.zhi) {
      score -= scoreWeights[i];
      warnings.push(`${p1.zhi}${p2.zhi}冲`);
    }
  });
  
  // 检查天干相克
  pillars1.forEach((p1, i) => {
    const p2 = pillars2[i];
    
    if (XIANGKE[p1.gan] === p2.gan) {
      score -= 5;
      warnings.push(`${p1.gan}克${p2.gan}`);
    }
  });
  
  // 五行互补检查
  const wuxing1 = getWuxing(bazi1);
  const wuxing2 = getWuxing(bazi2);
  
  let xiangshengCount = 0;
  Object.keys(wuxing1).forEach(w => {
    // 你生我或我生你
    if ((w === '木' && (wuxing1['火'] > 0 || wuxing2['火'] > 0)) ||
        (w === '火' && (wuxing1['土'] > 0 || wuxing2['土'] > 0)) ||
        (w === '土' && (wuxing1['金'] > 0 || wuxing2['金'] > 0)) ||
        (w === '金' && (wuxing1['水'] > 0 || wuxing2['水'] > 0)) ||
        (w === '水' && (wuxing1['木'] > 0 || wuxing2['木'] > 0))) {
      xiangshengCount++;
    }
  });
  
  if (xiangshengCount >= 2) {
    score += 10;
    highlights.push('五行相生');
  }
  
  // 检查日柱夫妻宫
  const dayZhi1 = bazi1.day.zhi;
  const dayZhi2 = bazi2.day.zhi;
  if (LIUHE[dayZhi1] === dayZhi2 || dayZhi1 === dayZhi2) {
    score += 10;
    highlights.push('日柱相合');
  }
  
  // 限制分数范围
  score = Math.max(55, Math.min(99, score));
  
  // 等级
  let level = '平淡有缘';
  if (score >= 95) level = '天作之合';
  else if (score >= 85) level = '良缘相伴';
  else if (score >= 75) level = '有缘相守';
  else if (score >= 65) level = '吉缘初现';
  
  // 五行关系描述
  const wuxingRelation = [];
  Object.keys(wuxing1).forEach(w => {
    if (wuxing1[w] > wuxing2[w] + 1) {
      wuxingRelation.push(`你${w}旺`);
    } else if (wuxing2[w] > wuxing1[w] + 1) {
      wuxingRelation.push(`TA${w}旺`);
    }
  });
  
  return {
    score,
    level,
    highlights: highlights.slice(0, 5),
    warnings: warnings.slice(0, 3),
    wuxing_relation: wuxingRelation.join('、') || '五行平衡',
    wuxing1,
    wuxing2
  };
}

module.exports = {
  getBazi,
  getWuxing,
  calcCompatibility,
  getNayin,
  TIANGAN,
  DIZHI,
  WUXING,
  DIZHI_WUXING,
  LIUHE,
  SANHE,
  LIUCHONG
};
