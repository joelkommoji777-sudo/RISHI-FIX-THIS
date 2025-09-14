import { cn } from "@/lib/utils";
import { ComponentType } from "react";

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  subtitle,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  value: number | string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  delay?: number;
}) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-neutral-500";

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm",
        "animate-in fade-in slide-in-from-bottom-2",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-neutral-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">
            {value}
          </div>
          <div className="mt-1 text-xs text-neutral-500">{subtitle}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="rounded-md bg-neutral-50 p-2">
            <Icon className="h-5 w-5 text-neutral-700" />
          </div>
          {change && (
            <div className={cn("mt-2 text-sm font-semibold", changeColor)}>
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
