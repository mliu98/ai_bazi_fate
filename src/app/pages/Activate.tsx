import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Activate() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCode = (value: string) => {
    // Remove non-alphanumeric characters
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Add hyphen after 4 characters
    if (clean.length <= 4) {
      return clean;
    }
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
  };

  // 纯前端模式：跳过验证，直接通过
  const handleVerify = async () => {
    if (!code || code.length !== 9) {
      toast.error('请输入完整的激活码');
      return;
    }

    setLoading(true);

    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    // 直接保存假的激活码数据（纯前端模式）
    localStorage.setItem('activationCode', code);
    localStorage.setItem('codeType', 'demo');
    localStorage.setItem('codeRemaining', '99');

    toast.success('激活成功！（演示模式）');
    
    // Navigate to input page
    setTimeout(() => {
      navigate('/input');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 px-6 py-8">
      {/* Header */}
      <div className="max-w-md mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </Button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">输入激活码</h1>
          <p className="text-gray-600">请输入你的8位激活码开始测算</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="space-y-6">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              激活码
            </label>
            <Input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="XXXX-XXXX"
              maxLength={9}
              className="h-14 text-center text-xl font-mono tracking-wider"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              格式：4位-4位，如 AB12-CD34
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || code.length !== 9}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 hover:from-red-700 hover:via-pink-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                验证中...
              </>
            ) : (
              '验证并开始'
            )}
          </Button>

          {/* Help Text */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">如何获取激活码？</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">1.</span>
                <span>关注小红书账号 @八字缘分测算</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">2.</span>
                <span>参与评论区抽奖活动获取体验码</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">3.</span>
                <span>私信「完整码」获取付费版激活码</span>
              </li>
            </ul>
          </div>

          {/* Code Types */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="font-semibold text-blue-700 mb-1">体验码</p>
              <p className="text-gray-600">1次测算</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="font-semibold text-purple-700 mb-1">完整码</p>
              <p className="text-gray-600">3次测算</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="font-semibold text-orange-700 mb-1">无限码</p>
              <p className="text-gray-600">不限次数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
