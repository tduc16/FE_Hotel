'use client';

/** Skeleton cho Booking Summary Card */
export function BookingSummarySkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Card header skeleton */}
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-surface-container-high flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container-high rounded-full" />
          <div className="h-6 bg-surface-container-high rounded w-44" />
        </div>

        <div className="p-8 space-y-6">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-surface-container-high rounded w-28" />
            <div className="h-7 bg-surface-container-high rounded-full w-32" />
          </div>

          <div className="border-t border-surface-container-high" />

          {/* Grid rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-4 bg-surface-container-highest rounded w-32" />
            </div>
          ))}

          <div className="border-t border-surface-container-high pt-4">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-surface-container-high rounded w-28" />
              <div className="h-7 bg-primary/10 rounded w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Cancel button skeleton */}
      <div className="h-12 bg-surface-container-high rounded-xl w-full" />
    </div>
  );
}

/** Skeleton cho Booking Lookup card */
export function BookingLookupSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-8 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-surface-container-high rounded-full" />
        <div className="h-6 bg-surface-container-high rounded w-40" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-surface-container-high rounded-lg" />
        <div className="h-12 bg-surface-container-high rounded-lg" />
      </div>
      <div className="h-12 bg-primary/20 rounded-xl" />
    </div>
  );
}
