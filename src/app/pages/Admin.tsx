import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Key, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Placeholder - Admin功能需要后端API支持
const projectId = 'your-project-id';
const publicAnonKey = 'your-anon-key';

interface Code {
  code: string;
  type: string;
  total_uses: number;
  used_count: number;
  created_at: string;
  expires_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  
  const [codeType, setCodeType] = useState('free');
  const [codeCount, setCodeCount] = useState('10');
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const handleLogin = () => {
    // Simple password check (in production, this should be more secure)
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAdminToken('admin123');
      toast.success('登录成功');
      loadCodes('admin123');
    } else {
      toast.error('密码错误');
    }
  };

  const loadCodes = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-661ddcd5/api/admin/codes/list`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || '获取失败');
        return;
      }

      setCodes(data.codes);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-661ddcd5/api/admin/codes/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            type: codeType,
            count: parseInt(codeCount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || '生成失败');
        return;
      }

      setGeneratedCodes(data.codes);
      toast.success(`成功生成 ${data.codes.length} 个激活码`);
      
      // Reload codes list
      loadCodes(adminToken);
    } catch (error) {
      console.error('Error generating codes:', error);
      toast.error('网络错误');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleCopyAll = () => {
    const allCodes = generatedCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast.success('已复制所有激活码');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">运营后台</h1>
            <p className="text-gray-600">请输入管理员密码</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>管理员密码</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="请输入密码"
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gray-800 hover:bg-gray-900"
            >
              登录
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">运营后台</h1>
          <p className="text-gray-600">激活码生成与管理</p>
        </div>

        {/* Generate Card */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">生成激活码</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="mb-2 block">激活码类型</Label>
              <Select value={codeType} onValueChange={setCodeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">体验码 (1次)</SelectItem>
                  <SelectItem value="full">完整码 (3次)</SelectItem>
                  <SelectItem value="unlimited">无限码 (9999次)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">生成数量</Label>
              <Input
                type="number"
                value={codeCount}
                onChange={(e) => setCodeCount(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成激活码'
                )}
              </Button>
            </div>
          </div>

          {generatedCodes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  新生成的激活码 ({generatedCodes.length}个)
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAll}
                >
                  复制全部
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {generatedCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm font-mono"
                  >
                    <span>{code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(code)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedCode === code ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Codes List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">所有激活码</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadCodes(adminToken)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                '刷新'
              )}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>激活码</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>使用情况</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.code}>
                      <TableCell className="font-mono font-semibold">
                        {code.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            code.type === 'free'
                              ? 'border-blue-500 text-blue-700'
                              : code.type === 'full'
                              ? 'border-purple-500 text-purple-700'
                              : 'border-orange-500 text-orange-700'
                          }
                        >
                          {code.type === 'free' ? '体验码' : code.type === 'full' ? '完整码' : '无限码'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={code.used_count >= code.total_uses ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {code.used_count} / {code.total_uses}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(code.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(code.expires_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(code.code)}
                        >
                          {copiedCode === code.code ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {codes.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  暂无激活码数据
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {codes.filter(c => c.type === 'free').length}
            </div>
            <div className="text-sm text-gray-600">体验码总数</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {codes.filter(c => c.type === 'full').length}
            </div>
            <div className="text-sm text-gray-600">完整码总数</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {codes.reduce((sum, c) => sum + c.used_count, 0)}
            </div>
            <div className="text-sm text-gray-600">总使用次数</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
