'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react';
import { customerAuthService } from '@/services/customer-auth.service';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-stone-200/60 shadow-2xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X size={18} />
        </button>
        <h2 className="text-xl font-light text-stone-900 mb-2" style={SERIF}>Quên mật khẩu</h2>
        <p className="text-xs text-stone-500 mb-6 uppercase tracking-wider">
          Nhập email đăng ký để nhận liên kết khôi phục.
        </p>
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-4">
              <Mail size={22} className="text-[#C8A97E]" />
            </div>
            <p className="text-stone-800 font-medium text-sm">Kiểm tra hộp thư của bạn</p>
            <p className="text-xs text-stone-500 mt-1">{email}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-widest transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-700 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-widest transition-colors"
            >
              Gửi yêu cầu
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

      <div className="min-h-screen bg-[#F8F6F3] flex">
        {/* Left — Decorative */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#1A1A1A] p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80')" }} />
          
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
              Chào mừng quý khách
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-white leading-[1.15] mb-6" style={SERIF}>
              Không gian nghỉ dưỡng<br />
              <em className="italic">thượng lưu &amp; đẳng cấp</em>
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm font-light">
              Đăng nhập tài khoản để nhận đặc quyền dành riêng cho khách hàng VIP và dễ dàng theo dõi hành trình trải nghiệm tại Hoang Minh Resort.
            </p>
          </div>

          {/* Special Cards */}
          <div className="relative space-y-4">
            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium mb-2">Đặc quyền thành viên</span>
            {[
              { icon: '🏆', title: 'Tích lũy dặm thưởng', desc: 'Quy đổi đêm nghỉ miễn phí và quà tặng.' },
              { icon: '💎', title: 'Ưu đãi đặc quyền VIP', desc: 'Nâng hạng phòng tự động và check-in sớm.' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-white font-medium text-xs uppercase tracking-wider">{item.title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#F8F6F3]">
          <div className="w-full max-w-md bg-white border border-stone-200/60 p-10 shadow-sm">
            {/* Mobile logo */}
            <div className="flex flex-col leading-none mb-10 lg:hidden">
              <span className="text-xl font-light tracking-widest text-stone-900" style={SERIF}>
                HOANG MINH
              </span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-1">
                Resort &amp; Hotel
              </span>
            </div>

            <h2 className="text-3xl font-light text-stone-950 mb-2" style={SERIF}>Đăng nhập</h2>
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-8">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-[#C8A97E] font-semibold hover:underline">
                Đăng ký thành viên
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                  Email thành viên
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${errors.email ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                    Mật khẩu bảo mật
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-xs text-stone-400 hover:text-[#C8A97E] font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${errors.password ? 'border-red-400' : ''}`}
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

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] text-stone-400 uppercase tracking-wider leading-relaxed">
              Bằng việc tiếp tục, quý khách đồng ý với{' '}
              <a href="#" className="text-[#C8A97E] hover:underline">Quy chế hoạt động</a>{' '}
              &amp;{' '}
              <a href="#" className="text-[#C8A97E] hover:underline">Chính sách dịch vụ</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
