'use client';

import { useEffect, useState } from 'react';
import { customerService } from '@/services/customer.service';
import type { CustomerVoucher } from '@/types/customer';
import toast from 'react-hot-toast';
import { Ticket, Copy, Check, Info } from 'lucide-react';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchVouchers = async () => {
    try {
      const data = await customerService.getVouchers();
      console.log('Voucher API Response:', data);
      console.log('Vouchers:', data);
      console.log('Is Array:', Array.isArray(data));
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

  const voucherList =
    Array.isArray(vouchers)
      ? vouchers
      : Array.isArray(vouchers?.data)
        ? vouchers.data
        : Array.isArray(vouchers?.data?.vouchers)
          ? vouchers.data.vouchers
          : [];

  if (!Array.isArray(voucherList)) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket size={28} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Không có voucher nào</h3>
        <p className="text-sm text-slate-500 mt-1">
          Hiện tại bạn chưa nhận được voucher nào. Hãy tham gia tích điểm để nhận quà.
        </p>
      </div>
    );
  }

  const activeVouchers = voucherList.filter((v: any) => v.status === 'active');
  const inactiveVouchers = voucherList.filter((v: any) => v.status !== 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Voucher của tôi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lưu trữ các mã giảm giá đặc quyền áp dụng khi bạn thực hiện đặt phòng.
        </p>
      </div>

      {voucherList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Không có voucher nào</h3>
          <p className="text-sm text-slate-500 mt-1">
            Hiện tại bạn chưa nhận được voucher nào. Hãy tham gia tích điểm để nhận quà.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Vouchers */}
          {activeVouchers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Có thể sử dụng ({activeVouchers.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-white rounded-2xl border border-slate-100 flex shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-200"
                  >
                    {/* Left dashed tag border */}
                    <div className="w-4 bg-primary/5 border-r border-dashed border-primary/20 flex-shrink-0 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                    </div>

                    {/* Voucher Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl font-black text-primary">
                            Giảm {voucher.discount_percent}%
                          </span>
                          <button
                            onClick={() => handleCopyCode(voucher.id, voucher.code)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
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
                        {voucher.description && (
                          <p className="text-xs text-slate-500 font-medium">
                            {voucher.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                        {voucher.min_order_amount && (
                          <span className="inline-flex items-center gap-1">
                            <Info size={10} />
                            Đơn tối thiểu {formatPrice(voucher.min_order_amount)}
                          </span>
                        )}
                        <span className="sm:ml-auto">
                          Hạn dùng: {formatDate(voucher.expiry_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used/Expired Vouchers */}
          {inactiveVouchers.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-500">Hết hạn hoặc đã dùng ({inactiveVouchers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-60">
                {inactiveVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-white rounded-2xl border border-slate-100 flex shadow-sm relative overflow-hidden"
                  >
                    <div className="w-4 bg-slate-100/50 border-r border-dashed border-slate-200 flex-shrink-0 relative">
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-4 h-4 bg-slate-50 rounded-full border border-slate-100" />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl font-black text-slate-400">
                            Giảm {voucher.discount_percent}%
                          </span>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                            {voucher.status === 'used' ? 'Đã dùng' : 'Hết hạn'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-550 tracking-wider">
                          MÃ: {voucher.code}
                        </p>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                        <span>Hạn dùng: {formatDate(voucher.expiry_date)}</span>
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
