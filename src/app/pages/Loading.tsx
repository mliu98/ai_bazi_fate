import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const mysticQuotes = [
  '正在推算天干地支...',
  '五行相生相克运算中...',
  '查看你们的八字命盘...',
  '姻缘线正在连接...',
  '专属报告生成中...',
  '命理师正在解读...',
];

export default function Loading() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(mysticQuotes[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate quotes
    const quoteInterval = setInterval(() => {
      setQuote(mysticQuotes[Math.floor(Math.random() * mysticQuotes.length)]);
    }, 1500);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    // 纯前端模式：直接生成假数据
    const generateReport = async () => {
      try {
        const inputData = localStorage.getItem('inputData');
        if (!inputData) {
          toast.error('数据丢失，请重新输入');
          navigate('/input');
          return;
        }

        const data = JSON.parse(inputData);

        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 生成假数据（placeholder）
        const mockResult = generateMockResult(data);
        
        // 保存结果
        localStorage.setItem('reportResult', JSON.stringify(mockResult));
        
        // 更新剩余次数
        const remaining = parseInt(localStorage.getItem('codeRemaining') || '0') - 1;
        localStorage.setItem('codeRemaining', remaining.toString());

        setProgress(100);

        // 短暂延迟后跳转
        setTimeout(() => {
          navigate('/result');
        }, 1000);
      } catch (error) {
        console.error('Error generating report:', error);
        toast.error('生成失败，请重试');
        setTimeout(() => {
          navigate('/input');
        }, 2000);
      }
    };

    // 生成模拟报告数据
    function generateMockResult(data: any) {
      const { user, partner } = data;
      
      // 简单的假八字计算
      const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const wuXing = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
      
      const userElement = wuXing[(user.year - 4) % 10];
      const partnerElement = wuXing[(partner.year - 4) % 10];
      
      const userBazi = {
        year: `${tianGan[(user.year - 4) % 10]}${diZhi[(user.year - 4) % 12]}`,
        month: `${tianGan[(user.month) % 10]}${diZhi[(user.month) % 12]}`,
        day: `${tianGan[(user.day) % 10]}${diZhi[(user.day) % 12]}`,
        hour: user.hour !== undefined ? `${tianGan[(user.hour) % 10]}${diZhi[(Math.floor((user.hour || 0) / 2) + 1) % 12]}` : '未知',
        element: userElement
      };
      
      const partnerBazi = {
        year: `${tianGan[(partner.year - 4) % 10]}${diZhi[(partner.year - 4) % 12]}`,
        month: `${tianGan[(partner.month) % 10]}${diZhi[(partner.month) % 12]}`,
        day: `${tianGan[(partner.day) % 10]}${diZhi[(partner.day) % 12]}`,
        hour: partner.hour !== undefined ? `${tianGan[(partner.hour) % 10]}${diZhi[(Math.floor((partner.hour || 0) / 2) + 1) % 12]}` : '未知',
        element: partnerElement
      };

      // 随机分数 60-99
      const score = Math.floor(Math.random() * 40) + 60;
      
      let level = '一般';
      if (score >= 85) level = '天作之合';
      else if (score >= 75) level = '良缘相伴';
      else if (score >= 65) level = '中等缘分';

      return {
        score,
        level,
        bazi: {
          user: userBazi,
          partner: partnerBazi
        },
        highlights: [
          `你们的五行属性${userElement}与${partnerElement}相合度很高，天生就有一种互相吸引的磁场`,
          '从八字来看，你们的相识方式暗合了姻缘线的走向',
          '双方日柱相合，代表在情感交流上能够心有灵犀，互相理解对方的需求',
          '流年运势显示你们在一起时会有好事发生',
          '你们的属相组合在传统命理中被认为是上等婚配'
        ],
        advice: [
          `${userElement}属性的你在感情中需要更多安全感，对方可以多主动表达爱意`,
          '建议保持沟通节奏，不要急于推进关系',
          '遇到分歧时要用温和的方式表达想法',
          '可以一起做一些放松的活动来增进感情',
          '多关注对方的情绪变化，给予支持和理解'
        ],
        sign: '缘起前世，情动心间。八字相合虽有波折却是真心。愿你们珍惜当下，共赴未来，情深不负相思意，携手同行白首时。',
        warning: '你们在处理冲突时可能会有不同的方式，需要学会互相理解对方的沟通习惯，避免冷战。',
        timing: '根据流年推算，2026年春季（3-5月）和秋季（9-11月）是你们关系发展的良好时机。',
        shareText: `我和TA测了八字缘分，得分${score}分！命理师说我们${userElement}${partnerElement}相合，${score >= 85 ? '天作之合' : '良缘可期'}～想知道你和TA的缘分吗？`,
        remaining: 98
      };
    }

    generateReport();

    return () => {
      clearInterval(quoteInterval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Animated Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-pink-600 rounded-full mb-6 shadow-2xl animate-pulse">
            <div className="text-5xl">🔮</div>
          </div>
          
          {/* BaZi Animation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-3xl animate-bounce" style={{ animationDelay: '0ms' }}>甲</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: '100ms' }}>子</div>
            <div className="text-2xl text-red-600 animate-pulse">❤️</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: '200ms' }}>乙</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: '300ms' }}>丑</div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {quote}
          </h2>
          
          <p className="text-gray-600">
            AI命理师正在为你生成专属报告
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">测算进度</span>
            <span className="text-sm font-semibold text-red-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center mt-6 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">预计还需 3 秒</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex items-center justify-center gap-4 text-4xl opacity-20">
          <span className="animate-pulse" style={{ animationDelay: '0ms' }}>❀</span>
          <span className="animate-pulse" style={{ animationDelay: '200ms' }}>✿</span>
          <span className="animate-pulse" style={{ animationDelay: '400ms' }}>❁</span>
          <span className="animate-pulse" style={{ animationDelay: '600ms' }}>✾</span>
        </div>
      </div>
    </div>
  );
}
