export function RecentActivity() {
  const items = [
    "New professor match found — Dr. Sarah Chen, MIT",
    "Email campaign sent — Stanford AI Research Group",
    "Profile view received — Dr. Michael Rodriguez, UCLA",
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 animate-in fade-in">
      <h3 className="text-lg font-semibold text-neutral-900">
        Recent Activity
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-neutral-600">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
