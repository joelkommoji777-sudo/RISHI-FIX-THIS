import { cn } from "@/lib/utils";

export function CampaignCard({
  campaign,
}: {
  campaign: {
    id: string;
    name: string;
    university: string;
    professorsContacted: number;
    status: "active" | "pending" | "paused";
  };
}) {
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700",
    pending: "bg-yellow-50 text-yellow-700",
    paused: "bg-neutral-100 text-neutral-700",
  } as const;

  return (
    <div className="rounded-lg border border-neutral-200 p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-neutral-900">{campaign.name}</div>
          <div className="text-sm text-neutral-500">
            {campaign.university} • {campaign.professorsContacted} professors
            contacted
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm",
            statusStyles[campaign.status],
          )}
        >
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </span>
      </div>
    </div>
  );
}
