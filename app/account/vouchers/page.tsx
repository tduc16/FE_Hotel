'use client';

import { useEffect, useState } from 'react';
import { customerService } from '@/services/customer.service';
import toast from 'react-hot-toast';
import { Ticket, Copy, Check, Info, Lock } from 'lucide-react';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchVouchers = async () => {
    try {
      const res = await customerService.getVouchers();
      // API response bọc trong { success: true, data: [...] }
      const data = (res as any).data || res || [];
      setVouchers(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Đã copy mã: ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Đang tải danh sách voucher...</p>
      </div>
    );
  }

  const eligibleVouchers = vouchers.filter((v: any) => v.isEligible);
  const ineligibleVouchers = vouchers.filter((v: any) => !v.isEligible);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vui lòng nhận ưu đãi của bạn</h1>
        <p className="text-sm text-slate-500 mt-1">
          Các mã giảm giá đặc quyền áp dụng khi bạn thực hiện đặt phòng tại Hoàng Minh Hotel.
        </p>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Không có voucher nào khả dụng</h3>
          <p className="text-sm text-slate-500 mt-1">
            Hãy tiếp tục đặt phòng và hoàn thành check-out để nhận thêm các ưu đãi đặc quyền!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Eligible Vouchers */}
          {eligibleVouchers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Đủ điều kiện áp dụng ({eligibleVouchers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {eligibleVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-white rounded-2xl border border-slate-150 flex shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all duration-200"
                  >
                    {/* Left tag side */}
                    <div className="w-4 bg-primary/5 border-r border-dashed border-primary/20 flex-shrink-0 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                    </div>

                    {/* Voucher Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl font-black text-primary">
                            {voucher.discountType === 'PERCENT'
                              ? `Giảm ${voucher.discountValue}%`
                              : `Giảm ${formatPrice(voucher.discountValue)}`}
                          </span>
                          <button
                            onClick={() => handleCopyCode(voucher.id, voucher.code)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                          >
                            {copiedId === voucher.id ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-700">Đã lưu</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy mã</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-wider">
                          MÃ: {voucher.code}
                        </p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {voucher.description || voucher.name}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                        <div className="flex flex-col gap-1">
                          {voucher.minBookingAmount && (
                            <span className="inline-flex items-center gap-1">
                              <Info size={10} />
                              Đơn tối thiểu {formatPrice(voucher.minBookingAmount)}
                            </span>
                          )}
                          {voucher.maxDiscountAmount && (
                            <span className="inline-flex items-center gap-1">
                              <Info size={10} />
                              Giảm tối đa {formatPrice(voucher.maxDiscountAmount)}
                            </span>
                          )}
                        </div>
                        <span className="sm:ml-auto">
                          Hạn dùng: {formatDate(voucher.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ineligible Vouchers */}
          {ineligibleVouchers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-400 flex items-center gap-2">
                Chưa đủ điều kiện ({ineligibleVouchers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ineligibleVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-white rounded-2xl border border-slate-100 flex shadow-xs relative overflow-hidden opacity-70 grayscale-xs"
                  >
                    {/* Left tag side */}
                    <div className="w-4 bg-slate-50 border-r border-dashed border-slate-200 flex-shrink-0 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                    </div>

                    {/* Voucher Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl font-black text-slate-400">
                            {voucher.discountType === 'PERCENT'
                              ? `Giảm ${voucher.discountValue}%`
                              : `Giảm ${formatPrice(voucher.discountValue)}`}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                            <Lock size={12} />
                            Khóa
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 tracking-wider">
                          MÃ: {voucher.code}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {voucher.description || voucher.name}
                        </p>
                        {voucher.reason && (
                          <div className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                            <Info size={12} className="flex-shrink-0" />
                            <span>{voucher.reason}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                        <div className="flex flex-col gap-1">
                          {voucher.minBookingAmount && (
                            <span>Đơn tối thiểu: {formatPrice(voucher.minBookingAmount)}</span>
                          )}
                          {voucher.maxDiscountAmount && (
                            <span>Giảm tối đa: {formatPrice(voucher.maxDiscountAmount)}</span>
                          )}
                        </div>
                        <span className="sm:ml-auto">
                          Hạn dùng: {formatDate(voucher.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
