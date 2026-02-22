import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Sparkles, Heart, Calendar, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-red-800 text-8xl">❀</div>
        <div className="absolute top-40 right-20 text-pink-800 text-6xl">✿</div>
        <div className="absolute bottom-40 left-20 text-orange-800 text-7xl">❁</div>
        <div className="absolute bottom-20 right-10 text-red-800 text-9xl">✾</div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-700 via-pink-700 to-orange-700 bg-clip-text text-transparent mb-3">
            八字缘分测算
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            他是不是你命中注定的那个人？
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-2xl p-4 text-center">
                <Calendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">传统八字</p>
                <p className="text-xs text-gray-500 mt-1">天干地支推算</p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4 text-center">
                <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">五行相合</p>
                <p className="text-xs text-gray-500 mt-1">金木水火土</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">AI智能</p>
                <p className="text-xs text-gray-500 mt-1">个性化解读</p>
              </div>
              <div className="bg-rose-50 rounded-2xl p-4 text-center">
                <Sparkles className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">专属姻缘签</p>
                <p className="text-xs text-gray-500 mt-1">诗意文案</p>
              </div>
            </div>

            {/* What You Get */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">✨ 你将获得</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>缘分总分 + 八字等级评定</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>五行相合度深度分析</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>3-5条缘分亮点解读</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-2">•</span>
                  <span>实用恋爱相处建议</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>专属诗意姻缘签文</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => navigate('/activate')}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 hover:from-red-700 hover:via-pink-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              开始测算
            </Button>

            {/* Small Info */}
            <p className="text-xs text-gray-400 text-center">
              需要激活码才能使用 · 3分钟获取专属报告
            </p>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="max-w-md text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            本产品基于传统八字命理文化，结合AI智能生成个性化内容<br />
            仅供娱乐参考，不构成任何决策建议
          </p>
        </div>
      </div>
    </div>
  );
}
