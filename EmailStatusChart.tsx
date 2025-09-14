export function EmailStatusChart() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm animate-in fade-in">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">
        Email Status Distribution
      </h3>
      <div className="text-sm text-neutral-500 mb-2">
        Breakdown of your email delivery and engagement
      </div>
      <div className="h-64 grid place-items-center">
        <div className="relative h-40 w-40 rounded-full bg-neutral-100">
          <div
            className="absolute inset-0 rounded-full border-[18px] border-emerald-500"
            style={{ clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 100%)" }}
          />
          <div
            className="absolute inset-0 rounded-full border-[18px] border-indigo-500 opacity-80"
            style={{ clipPath: "polygon(50% 50%, 50% 0, 0 0, 0 100%)" }}
          />
          <div className="absolute inset-6 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
