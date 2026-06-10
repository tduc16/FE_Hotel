'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Hotel, Mail, Lock, X } from 'lucide-react';
import { customerAuthService } from '@/services/customer-auth.service';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

// ─── Forgot Password Dialog ──────────────────────────────────────────────────
function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast.success('Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} className="text-slate-500" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Quên mật khẩu</h2>
        <p className="text-sm text-slate-500 mb-6">
          Nhập email đăng ký và chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-500" />
            </div>
            <p className="text-slate-700 font-medium">Kiểm tra hộp thư của bạn</p>
            <p className="text-sm text-slate-500 mt-1">{email}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Gửi link đặt lại mật khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await customerAuthService.login({ email, password });
      const customer = data?.customer;
      login(customer, data?.access_token);
      toast.success(`Chào mừng, ${customer?.fullName ?? 'bạn'}!`);
      router.push('/account');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <div className="min-h-screen bg-gradient-to-br from-surface-container-low via-surface to-surface-container-low flex">
        {/* Left — Decorative */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Hotel size={22} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl">Hotel Hoang Minh</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Chào mừng<br />trở lại
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Đăng nhập để quản lý đặt phòng, theo dõi điểm thưởng và nhận các ưu đãi độc quyền.
            </p>
          </div>

          {/* Floating cards */}
          <div className="relative space-y-3">
            {[
              { icon: '🏆', title: 'Chương trình tích điểm', desc: 'Tích điểm mỗi đặt phòng' },
              { icon: '🎫', title: 'Voucher độc quyền', desc: 'Giảm đến 30% cho thành viên' },
              { icon: '⭐', title: 'Nâng hạng phòng', desc: 'Ưu tiên cho thành viên Platinum' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-white/60 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Hotel size={18} className="text-white" />
              </div>
              <span className="font-bold text-primary text-lg">Hotel Hoang Minh</span>
            </div>

            <h2 className="text-3xl font-bold text-on-surface mb-2">Đăng nhập</h2>
            <p className="text-on-surface-variant text-sm mb-8">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3.5 bg-surface-container-highest rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white text-sm transition-all ${errors.email ? 'ring-2 ring-error/50' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3.5 bg-surface-container-highest rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white text-sm transition-all ${errors.password ? 'ring-2 ring-error/50' : ''}`}
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

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a>{' '}
              và{' '}
              <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
