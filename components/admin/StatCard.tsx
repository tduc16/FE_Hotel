import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_rgba(24,28,31,0.04)] border border-surface-container-highest">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-on-surface-variant text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-headline font-bold text-on-surface mt-2">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[16px]">
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
    </div>
  );
}
