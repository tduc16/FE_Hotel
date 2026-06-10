'use client';

interface CancelBookingModalProps {
  isOpen: boolean;
  isCancelling: boolean;
  onKeep: () => void;
  onConfirm: () => void;
}

export function CancelBookingModal({
  isOpen,
  isCancelling,
  onKeep,
  onConfirm,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onKeep}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto p-8 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-red-500 text-3xl">cancel</span>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h2
            id="cancel-modal-title"
            className="text-xl font-bold text-on-surface"
          >
            Huỷ đặt phòng
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Bạn có chắc chắn muốn huỷ đặt phòng này không?
            <br />
            <span className="font-medium text-red-600">Hành động này không thể hoàn tác.</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            id="confirm-cancel-btn"
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCancelling ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                Đang huỷ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">cancel</span>
                Xác nhận huỷ
              </>
            )}
          </button>

          <button
            onClick={onKeep}
            disabled={isCancelling}
            id="keep-booking-btn"
            className="w-full h-12 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Giữ đặt phòng
          </button>
        </div>
      </div>
    </div>
  );
}
