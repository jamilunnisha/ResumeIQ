import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  iconClass = "bg-indigo-50 text-indigo-600",
}) {
  const hasTrend = trend !== undefined && trend !== null;

  const isPositive = Number(trend) > 0;
  const isNegative = Number(trend) < 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">

      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-50/50 blur-2xl transition-all duration-300 group-hover:bg-indigo-100/60" />


      {/* Top row */}

      <div className="relative flex items-start justify-between">

        {/* Icon */}

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>


        {/* Trend */}

        {hasTrend && (
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : isNegative
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={13} />
            ) : isNegative ? (
              <ArrowDownRight size={13} />
            ) : (
              <Minus size={13} />
            )}

            {Math.abs(Number(trend))}%
          </div>
        )}

      </div>


      {/* Main value */}

      <div className="relative mt-5">

        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {title}
        </p>

        <div className="mt-1 flex items-end gap-2">

          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

        </div>

      </div>


      {/* Bottom information */}

      <div className="relative mt-3">

        {trendLabel ? (
          <p className="text-xs text-slate-400">
            <span
              className={
                isPositive
                  ? "font-semibold text-emerald-600"
                  : isNegative
                    ? "font-semibold text-red-600"
                    : "font-semibold text-slate-500"
              }
            >
              {trendLabel}
            </span>
          </p>
        ) : subtitle ? (
          <p className="text-xs text-slate-400">
            {subtitle}
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Updated just now
          </p>
        )}

      </div>

    </div>
  );
}

export default StatCard;