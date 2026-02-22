import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, ArrowRight, User, Users } from 'lucide-react';
import { toast } from 'sonner';

const hours = [
  { value: '0', label: '子时 (23-01点)' },
  { value: '2', label: '丑时 (01-03点)' },
  { value: '4', label: '寅时 (03-05点)' },
  { value: '6', label: '卯时 (05-07点)' },
  { value: '8', label: '辰时 (07-09点)' },
  { value: '10', label: '巳时 (09-11点)' },
  { value: '12', label: '午时 (11-13点)' },
  { value: '14', label: '未时 (13-15点)' },
  { value: '16', label: '申时 (15-17点)' },
  { value: '18', label: '酉时 (17-19点)' },
  { value: '20', label: '戌时 (19-21点)' },
  { value: '22', label: '亥时 (21-23点)' },
  { value: '-1', label: '不知道' },
];

const questionnaire = {
  q1: {
    question: '你们相识的方式是？',
    options: ['一见钟情', '慢慢走进', '网络相识', '朋友介绍']
  },
  q2: {
    question: '你感觉你们之间更像？',
    options: ['磁铁相吸', '相似灵魂', '互补拼图', '还没感觉到']
  },
  q3: {
    question: '你们有「同步心灵」的瞬间吗？',
    options: ['经常有', '偶尔有', '没有', '不确定']
  },
  q4: {
    question: '对方对你来说像？',
    options: ['太阳', '月亮', '北极星', '流星']
  },
  q5: {
    question: '你们认识多久了？',
    options: ['不到一个月', '1-6个月', '半年以上', '还没在一起']
  }
};

export default function Input() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('female');
  
  const [userBirth, setUserBirth] = useState({
    year: '',
    month: '',
    day: '',
    hour: '-1'
  });

  const [partnerBirth, setPartnerBirth] = useState({
    year: '',
    month: '',
    day: '',
    hour: '-1'
  });

  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });

  const currentYear = 2026;
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const validateStep1 = () => {
    if (!userBirth.year || !userBirth.month || !userBirth.day) {
      toast.error('请填写完整的生日信息');
      return false;
    }
    if (!partnerBirth.year || !partnerBirth.month || !partnerBirth.day) {
      toast.error('请填写对方完整的生日信息');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5) {
      toast.error('请完成所有问题');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    // Check activation code
    const code = localStorage.getItem('activationCode');
    if (!code) {
      toast.error('请先输入激活码');
      navigate('/activate');
      return;
    }

    // Save data to localStorage
    const data = {
      code,
      gender,
      user: {
        year: parseInt(userBirth.year),
        month: parseInt(userBirth.month),
        day: parseInt(userBirth.day),
        hour: parseInt(userBirth.hour) >= 0 ? parseInt(userBirth.hour) : undefined
      },
      partner: {
        year: parseInt(partnerBirth.year),
        month: parseInt(partnerBirth.month),
        day: parseInt(partnerBirth.day),
        hour: parseInt(partnerBirth.hour) >= 0 ? parseInt(partnerBirth.hour) : undefined
      },
      questionnaire: answers
    };

    localStorage.setItem('inputData', JSON.stringify(data));
    navigate('/loading');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-6 py-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => step === 1 ? navigate('/activate') : setStep(1)}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </Button>

        {/* Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-pink-200 text-pink-600'} font-semibold`}>
            1
          </div>
          <div className={`h-1 w-16 mx-2 ${step >= 2 ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-pink-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-pink-200 text-pink-600'} font-semibold`}>
            2
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {step === 1 ? '填写生日信息' : '玄学小问卷'}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? '请准确填写双方的出生日期' : '回答几个小问题，让测算更准确'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {step === 1 ? (
          <div className="space-y-8">
            {/* Gender Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block text-pink-700">我是</Label>
              <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="female" id="female" className="text-pink-500" />
                  <Label htmlFor="female" className="flex-1 text-center py-3 px-4 border-2 border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors text-pink-700 font-medium">
                    女生 👧
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="male" id="male" className="text-pink-500" />
                  <Label htmlFor="male" className="flex-1 text-center py-3 px-4 border-2 border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors text-pink-700 font-medium">
                    男生 👦
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* User Birth */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-800">我的生日</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Select value={userBirth.year} onValueChange={(v) => setUserBirth({ ...userBirth, year: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userBirth.month} onValueChange={(v) => setUserBirth({ ...userBirth, month: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userBirth.day} onValueChange={(v) => setUserBirth({ ...userBirth, day: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="日" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}日</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={userBirth.hour} onValueChange={(v) => setUserBirth({ ...userBirth, hour: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="出生时辰" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(hour => (
                    <SelectItem key={hour.value} value={hour.value}>{hour.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Partner Birth */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-800">对方的生日</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Select value={partnerBirth.year} onValueChange={(v) => setPartnerBirth({ ...partnerBirth, year: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={partnerBirth.month} onValueChange={(v) => setPartnerBirth({ ...partnerBirth, month: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month.toString()}>{month}月</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={partnerBirth.day} onValueChange={(v) => setPartnerBirth({ ...partnerBirth, day: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="日" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day.toString()}>{day}日</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={partnerBirth.hour} onValueChange={(v) => setPartnerBirth({ ...partnerBirth, hour: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="出生时辰" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(hour => (
                    <SelectItem key={hour.value} value={hour.value}>{hour.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleNext}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              下一步
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              {Object.keys(questionnaire).map((key, idx) => (
                <div
                  key={key}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    answers[key as keyof typeof answers] !== undefined
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-pink-100 text-pink-400'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Questions with beautiful cards */}
            {Object.entries(questionnaire).map(([key, q], idx) => (
              <div 
                key={key} 
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                  answers[key as keyof typeof answers] !== undefined
                    ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200'
                    : 'bg-white border-2 border-pink-100 hover:border-pink-300'
                }`}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-200 rounded-bl-full opacity-50" />
                
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-lg">{q.question}</h3>
                  </div>
                  
                  <RadioGroup
                    value={answers[key as keyof typeof answers]}
                    onValueChange={(v) => setAnswers({ ...answers, [key]: v })}
                    className="grid grid-cols-2 gap-3"
                  >
                    {q.options.map((option, optIdx) => (
                      <Label
                        key={optIdx}
                        htmlFor={`${key}-${optIdx}`}
                        className={`flex items-center justify-center py-4 px-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          answers[key as keyof typeof answers] === option
                            ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 font-semibold'
                            : 'border-pink-100 hover:border-pink-300 hover:bg-pink-50 text-gray-600'
                        }`}
                      >
                        <RadioGroupItem value={option} id={`${key}-${optIdx}`} className="sr-only" />
                        {option}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < Object.keys(questionnaire).length}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              测算我们的缘分 ✨
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
