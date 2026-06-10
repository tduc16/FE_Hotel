'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Hotel, Mail, Lock, User, Phone } from 'lucide-react';
import { customerAuthService } from '@/services/customer-auth.service';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm_password?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof FormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    else if (form.fullName.trim().length < 2) e.fullName = 'Họ tên quá ngắn';

    if (!form.email) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';

    if (form.phone && !/^(0[3-9]\d{8}|0[2]\d{9})$/.test(form.phone.replace(/\s/g, ''))) {
      e.phone = 'Số điện thoại không hợp lệ';
    }

    if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';

    if (!form.confirm_password) e.confirm_password = 'Vui lòng xác nhận mật khẩu';
    else if (form.password !== form.confirm_password) e.confirm_password = 'Mật khẩu không khớp';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        fullName: form.fullName.trim(),
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      };
      const payload = data;
      console.log('Form Data:', data);
      console.log('Request Payload:', payload);

      await customerAuthService.register(payload);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (error?: string) =>
    `w-full pr-4 py-3.5 bg-surface-container-highest rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white text-sm transition-all ${error ? 'ring-2 ring-error/50' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-container-low via-surface to-surface-container-low flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary to-secondary p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Hotel size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">Hotel Hoang Minh</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Tham gia cùng<br />chúng tôi
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Tạo tài khoản để bắt đầu hành trình nghỉ dưỡng đẳng cấp và tận hưởng những đặc quyền thành viên.
          </p>
        </div>

        <div className="relative">
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">Quyền lợi thành viên</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🎁', text: 'Quà chào mừng' },
              { icon: '🏅', text: 'Điểm tích lũy' },
              { icon: '💎', text: 'Ưu đãi độc quyền' },
              { icon: '🔔', text: 'Thông báo sớm' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Hotel size={18} className="text-white" />
            </div>
            <span className="font-bold text-primary text-lg">Hotel Hoang Minh</span>
          </div>

          <h2 className="text-3xl font-bold text-on-surface mb-2">Tạo tài khoản</h2>
          <p className="text-on-surface-variant text-sm mb-8">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Họ và tên <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`${inputClass(errors.fullName)} pl-10`}
                />
              </div>
              {errors.fullName && <p className="mt-1.5 text-xs text-error">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`${inputClass(errors.email)} pl-10`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="0912 345 678"
                  className={`${inputClass(errors.phone)} pl-10`}
                />
              </div>
              {errors.phone && <p className="mt-1.5 text-xs text-error">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass(errors.password)} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Xác nhận mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={(e) => setField('confirm_password', e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass(errors.confirm_password)} pl-10 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1.5 text-xs text-error">{errors.confirm_password}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a>{' '}
            và{' '}
            <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
