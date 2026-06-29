'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { customerAuthService } from '@/services/customer-auth.service';
import toast from 'react-hot-toast';

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không đúng định dạng');
      return;
    }

    setLoading(true);
    try {
      const response = await customerAuthService.forgotPassword(email);
      setSubmitted(true);
      toast.success(response.message || 'Yêu cầu đã được gửi thành công.');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      toast.error(err.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-stone-200/60 p-10 shadow-sm">
        {/* Logo */}
        <div className="flex flex-col leading-none mb-10 text-center">
          <span className="text-xl font-light tracking-widest text-stone-900" style={SERIF}>
            HOANG MINH
          </span>
          <span className="text-[8px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-1">
            Resort &amp; Hotel
          </span>
        </div>

        <h2 className="text-2xl font-light text-stone-950 mb-2 text-center" style={SERIF}>Quên mật khẩu</h2>
        <p className="text-stone-400 text-xs uppercase tracking-wider mb-8 text-center">
          Nhập email để nhận liên kết khôi phục tài khoản
        </p>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-6">
              <Mail size={28} className="text-[#C8A97E]" />
            </div>
            <p className="text-stone-800 font-medium text-sm">Kiểm tra hộp thư của bạn</p>
            <p className="text-xs text-stone-500 mt-2 px-4 leading-relaxed">
              Nếu email <strong className="text-stone-700">{email}</strong> tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến email của bạn.
            </p>
            <div className="mt-8 space-y-4">
              <Link
                href="/login"
                className="block w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                Email đã đăng ký
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-750 transition-colors ${error ? 'border-red-400' : ''}`}
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : 'Gửi yêu cầu khôi phục'}
            </button>

            {/* Back to Login Link */}
            <div className="pt-2 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-[#C8A97E] font-medium transition-colors">
                <ArrowLeft size={14} />
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
