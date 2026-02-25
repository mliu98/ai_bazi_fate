import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Share2, Lock, Download, Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ReportData {
  score: number;
  level: string;
  bazi: {
    user: any;
    partner: any;
  };
  highlights: string[];
  advice: string[];
  sign: string;
  shareText: string;
  warning?: string;
  timing?: string;
  remaining: number | string;
}

interface PremiumData {
  warning: string;
  timing: string;
}

export default function Result() {
  const navigate = useNavigate();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [premiumData, setPremiumData] = useState<PremiumData | null>(null);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Check if premium (not free code)
  const isPremium = reportData?.remaining !== undefined && reportData.remaining !== 'unlimited' && parseInt(String(reportData.remaining)) > 0;

  useEffect(() => {
    const result = localStorage.getItem('reportResult');
    if (!result) {
      toast.error('未找到报告数据');
      navigate('/input');
      return;
    }

    const data = JSON.parse(result);
    setReportData(data);
    
    // If has warning/timing, it's premium
    if (data.warning || data.timing) {
      setPremiumData({ warning: data.warning, timing: data.timing });
    }
  }, [navigate]);

  const handleUnlockPremium = async () => {
    // Premium content is already included in the local API response
    if (reportData?.warning || reportData?.timing) {
      setPremiumData({ 
        warning: reportData.warning, 
        timing: reportData.timing 
      });
      toast.success('已显示完整版内容');
    } else {
      toast.info('请使用完整版激活码');
    }
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current) return;

    setDownloading(true);
    toast.loading('正在生成分享图片...');

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `八字缘分测算-${reportData?.score}分.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('图片已保存到相册');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('生成图片失败');
    } finally {
      setDownloading(false);
      toast.dismiss();
    }
  };

  const handleCopyText = () => {
    if (!reportData) return;
    
    navigator.clipboard.writeText(reportData.shareText);
    toast.success('文案已复制到剪贴板');
  };

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">你们的缘分报告</h1>
          <p className="text-gray-600">基于传统八字命理 · AI智能生成</p>
        </div>

        {/* Score Card */}
        <Card className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white p-8 mb-6 shadow-2xl">
          <div className="text-center">
            <div className="text-7xl font-bold mb-2">{reportData.score}</div>
            <div className="text-2xl font-semibold mb-4">{reportData.level}</div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="bg-white/20 rounded-full px-4 py-2">
                {reportData.bazi.user.element}命
              </div>
              <div className="text-2xl">❤️</div>
              <div className="bg-white/20 rounded-full px-4 py-2">
                {reportData.bazi.partner.element}命
              </div>
            </div>
          </div>
        </Card>

        {/* BaZi Display */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span>
            八字排盘
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-pink-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">你的八字</p>
              <p className="text-lg font-semibold text-gray-800">
                {reportData.bazi.user.year} {reportData.bazi.user.month}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {reportData.bazi.user.day} {reportData.bazi.user.hour}
              </p>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">对方八字</p>
              <p className="text-lg font-semibold text-gray-800">
                {reportData.bazi.partner.year} {reportData.bazi.partner.month}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {reportData.bazi.partner.day} {reportData.bazi.partner.hour}
              </p>
            </div>
          </div>
        </Card>

        {/* Highlights */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span>
            缘分亮点
          </h3>
          <div className="space-y-3">
            {reportData.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
                <span className="text-red-600 font-semibold">{idx + 1}.</span>
                <p className="text-gray-700 flex-1">{highlight}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Advice */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💕</span>
            相处建议
          </h3>
          <div className="space-y-3">
            {reportData.advice.map((advice, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
                <span className="text-pink-600 font-semibold">•</span>
                <p className="text-gray-700 flex-1">{advice}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Sign */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-amber-50 to-orange-50">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🌸</span>
            专属姻缘签
          </h3>
          <div className="bg-white/80 rounded-xl p-6 border-2 border-pink-200">
            <p className="text-gray-800 leading-relaxed text-center font-serif text-lg">
              {reportData.sign}
            </p>
          </div>
        </Card>

        {/* Premium Content */}
        {premiumData ? (
          <>
            <Card className="p-6 mb-6 border-2 border-orange-300">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                隐患预警
              </h3>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-gray-700">{premiumData.warning}</p>
              </div>
            </Card>

            <Card className="p-6 mb-6 border-2 border-purple-300">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📅</span>
                最佳发展时机
              </h3>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-gray-700">{premiumData.timing}</p>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">解锁完整版报告</h3>
              <p className="text-sm text-gray-600 mb-4">
                查看「隐患预警」和「最佳发展时机」
              </p>
              <Button
                onClick={handleUnlockPremium}
                disabled={loadingPremium}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {loadingPremium ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    加载中...
                  </>
                ) : isPremium ? (
                  '立即解锁'
                ) : (
                  '获取完整版激活码'
                )}
              </Button>
              {!isPremium && (
                <p className="text-xs text-gray-500 mt-3">
                  私信小红书 @八字缘分测算，备注「完整码」
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Share Section */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            分享到小红书
          </h3>
          
          <div className="space-y-4">
            <Button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  保存分享图片
                </>
              )}
            </Button>

            <Button
              onClick={handleCopyText}
              variant="outline"
              className="w-full"
            >
              复制分享文案
            </Button>
          </div>
        </Card>

        {/* Hidden Share Card (for screenshot) */}
        <div className="fixed -left-[9999px] top-0">
          <div
            ref={shareCardRef}
            className="w-[1080px] h-[1080px] bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-12 flex flex-col items-center justify-center text-white"
            style={{ fontFamily: 'serif' }}
          >
            <div className="text-6xl mb-8">🔮</div>
            <h1 className="text-7xl font-bold mb-4">八字缘分测算</h1>
            <div className="text-9xl font-bold mb-6">{reportData.score}</div>
            <div className="text-5xl font-semibold mb-12">{reportData.level}</div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-12 mb-12 max-w-4xl">
              <p className="text-3xl leading-relaxed text-center">
                {reportData.sign}
              </p>
            </div>

            <div className="flex items-center gap-6 text-3xl">
              <div className="bg-white/30 rounded-full px-8 py-4">
                {reportData.bazi.user.element}命
              </div>
              <div className="text-5xl">❤️</div>
              <div className="bg-white/30 rounded-full px-8 py-4">
                {reportData.bazi.partner.element}命
              </div>
            </div>

            <div className="mt-16 text-2xl opacity-80">
              扫码测算你的缘分 ↓
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={() => {
              const remaining = parseInt(localStorage.getItem('codeRemaining') || '0');
              if (remaining > 0) {
                navigate('/input');
              } else {
                toast.info('使用次数已用完，请获取新的激活码');
                navigate('/activate');
              }
            }}
            variant="outline"
            className="flex-1"
          >
            再测一次
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            回到首页
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-8">
          <p className="mb-1">本报告基于传统八字命理文化</p>
          <p>仅供娱乐参考，不构成任何决策建议</p>
        </div>
      </div>
    </div>
  );
}
