'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
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

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

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
    `w-full py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${error ? 'border-red-450' : ''}`;

  return (
    <div className="min-h-screen bg-[#F8F6F3] flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1A1A1A] p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')" }} />
        
        <div className="relative">
          <div className="flex flex-col leading-none mb-16">
            <span className="text-xl font-light tracking-widest text-white" style={SERIF}>
              HOANG MINH
            </span>
            <span className="text-[8px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-1">
              Resort &amp; Hotel
            </span>
          </div>

          <span className="block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium mb-4">
            Đăng ký thành viên
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-white leading-[1.15] mb-6" style={SERIF}>
            Khám phá đặc quyền<br />
            <em className="italic">dành riêng cho hội viên</em>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm font-light">
            Nhận ngay các ưu đãi đặc quyền khi trở thành hội viên của Hoang Minh Resort, tích lũy dặm nghỉ dưỡng thượng lưu và nhận hỗ trợ 24/7.
          </p>
        </div>

        <div className="relative">
          <span className="block text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium mb-4">Danh mục đặc quyền</span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🎁', text: 'Quà chào mừng' },
              { icon: '🏅', text: 'Tích lũy đêm nghỉ' },
              { icon: '💎', text: 'Ưu đãi Spa & Bar' },
              { icon: '🔔', text: 'Đặt phòng ưu tiên' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white text-xs font-semibold uppercase tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F6F3] overflow-y-auto">
        <div className="w-full max-w-md bg-white border border-stone-200/60 p-10 shadow-sm py-10 my-8">
          {/* Mobile logo */}
          <div className="flex flex-col leading-none mb-10 lg:hidden">
            <span className="text-xl font-light tracking-widest text-stone-900" style={SERIF}>
              HOANG MINH
            </span>
            <span className="text-[8px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-1">
              Resort &amp; Hotel
            </span>
          </div>

          <h2 className="text-3xl font-light text-stone-950 mb-2" style={SERIF}>Đăng ký</h2>
          <p className="text-stone-400 text-xs uppercase tracking-wider mb-8">
            Đã là hội viên?{' '}
            <Link href="/login" className="text-[#C8A97E] font-semibold hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Họ và tên *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="register-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className={`${inputClass(errors.fullName)} pl-10`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Email thành viên *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="name@example.com"
                  className={`${inputClass(errors.email)} pl-10`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="register-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="VD: 0912345678"
                  className={`${inputClass(errors.phone)} pl-10`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Mật khẩu thành viên *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirm_password}</p>}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng ký...
                </span>
              ) : 'Đăng ký thành viên'}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] text-stone-400 uppercase tracking-wider leading-relaxed">
            Bằng việc đăng ký, quý khách đồng ý với{' '}
            <a href="#" className="text-[#C8A97E] hover:underline">Quy chế hoạt động</a>{' '}
            &amp;{' '}
            <a href="#" className="text-[#C8A97E] hover:underline">Chính sách dịch vụ</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
