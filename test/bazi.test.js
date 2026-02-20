/**
 * 测试脚本 - 验证八字计算引擎
 * 运行: node test/bazi.test.js
 */

const { getBazi, getWuxing, calcCompatibility } = require('../backend/services/baziEngine');

console.log('🧪 八字计算引擎测试\n');

// 测试用例
const testCases = [
  { year: 1990, month: 1, day: 15, hour: 12, expected: '庚午年' },
  { year: 1995, month: 6, day: 20, hour: 18, expected: '乙亥年' },
  { year: 2000, month: 2, day: 4, hour: 8, expected: '庚辰年' },
  { year: 2020, month: 8, day: 15, hour: 22, expected: '庚子年' },
];

console.log('📅 八字计算测试:');
testCases.forEach((tc, i) => {
  const bazi = getBazi(tc.year, tc.month, tc.day, tc.hour);
  console.log(`  ${i + 1}. ${tc.year}-${tc.month}-${tc.day} ${tc.hour}时`);
  console.log(`     年柱: ${bazi.year.gan}${bazi.year.zhi}`);
  console.log(`     月柱: ${bazi.month.gan}${bazi.month.zhi}`);
  console.log(`     日柱: ${bazi.day.gan}${bazi.day.zhi}`);
  console.log(`     时柱: ${bazi.hour.gan}${bazi.hour.zhi}`);
  console.log();
});

console.log('💕 合婚测试:');
const bazi1 = getBazi(1990, 5, 15, 12);
const bazi2 = getBazi(1992, 8, 20, 14);
const result = calcCompatibility(bazi1, bazi2);
console.log(`  男方八字: ${bazi1.year.gan}${bazi1.year.zhi} ${bazi1.month.gan}${bazi1.month.zhi} ${bazi1.day.gan}${bazi1.day.zhi} ${bazi1.hour.gan}${bazi1.hour.zhi}`);
console.log(`  女方八字: ${bazi2.year.gan}${bazi2.year.zhi} ${bazi2.month.gan}${bazi2.month.zhi} ${bazi2.day.gan}${bazi2.day.zhi} ${bazi2.hour.gan}${bazi2.hour.zhi}`);
console.log(`  缘分得分: ${result.score}`);
console.log(`  等级: ${result.level}`);
console.log(`  亮点: ${result.highlights.join(', ')}`);
console.log(`  隐患: ${result.warnings.join(', ')}`);
console.log();

console.log('✅ 测试完成!');
