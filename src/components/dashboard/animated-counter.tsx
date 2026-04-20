'use client';

// ============================================
// Animated Counter — CountUp effect for KPIs
// Smooth number animation with easing
// ============================================

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return Math.round(num).toLocaleString('fr-FR');
  };

  return (
    <span className={className}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
}

// ============================================
// Trend Indicator — Up/Down arrow with color
// ============================================

interface TrendIndicatorProps {
  value: number;
  className?: string;
}

export function TrendIndicator({ value, className = '' }: TrendIndicatorProps) {
  const isPositive = value >= 0;
  const isZero = value === 0;

  if (isZero) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
        <span className="text-sm">—</span>
        <span>0%</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
      } ${className}`}
    >
      <svg
        className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span>{Math.abs(value).toFixed(1)}%</span>
    </span>
  );
}

// ============================================
// KPI Card — Premium glassmorphism card with counter
// ============================================

import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: LucideIcon;
  trend?: number;
  description?: string;
  delay?: number;
  variant?: 'default' | 'amber' | 'blue' | 'emerald' | 'rose';
}

const variantStyles = {
  default: 'bg-card',
  amber: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20',
  blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20',
  emerald: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
  rose: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20',
};

const variantIconStyles = {
  default: 'bg-primary/10 text-primary',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
};

export function KPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon: Icon,
  trend,
  description,
  delay = 0,
  variant = 'default',
}: KPICardProps) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${variantStyles[variant]} animate-fade-in-up ${
        delay > 0 ? `animate-delay-${delay}` : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variantIconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-2xl font-bold tracking-tight font-[family-name:var(--font-plus-jakarta)]"
        />
        {trend !== undefined && <TrendIndicator value={trend} />}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
      )}
    </div>
  );
}
