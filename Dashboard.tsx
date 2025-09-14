import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmailActivityChart } from "@/components/dashboard/EmailActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Mail, Users, TrendingUp, Handshake } from "lucide-react";

const recentHistory = [
  {
    id: "p1",
    name: "Dr. Alice Smith",
    university: "Stanford University",
    email: "alice@stanford.edu",
    lastContacted: "2 days ago",
  },
  {
    id: "p2",
    name: "Dr. Bob Johnson",
    university: "MIT",
    email: "bob@mit.edu",
    lastContacted: "5 days ago",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen space-bg relative">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow opacity-40"></div>
      <div className="absolute inset-0 cosmic-depth opacity-30"></div>
      <div className="absolute inset-0 nebula-band opacity-20"></div>
      <div className="absolute inset-0 cosmic-glow opacity-15"></div>
      
      <header className="sticky top-0 z-30 bg-[#000814]/90 backdrop-blur border-b border-[#003566]/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="animate-in fade-in">
              <h1 className="text-2xl font-bold text-white">
                Welcome Back, Joel! 🚀
              </h1>
              <p className="text-[#CAF0F8]">
                Here's your research outreach summary
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Emails Sent"
            value={47}
            change="+23%"
            changeType="positive"
            subtitle="This month"
            icon={Mail}
            delay={0}
          />
          <MetricCard
            title="Professors Found"
            value={156}
            change="+8%"
            changeType="positive"
            subtitle="Active matches"
            icon={Users}
            delay={100}
          />
          <MetricCard
            title="Response Rate"
            value={"24.5%"}
            change="+5.2%"
            changeType="positive"
            subtitle="Above average"
            icon={TrendingUp}
            delay={200}
          />
          <MetricCard
            title="Collaborations"
            value={8}
            change="0%"
            changeType="neutral"
            subtitle="In progress"
            icon={Handshake}
            delay={300}
          />
        </div>

        <div className="mb-8">
          <EmailActivityChart />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#003566]/30 bg-[#001D3D]/30 backdrop-blur-sm p-6 shadow-sm electric-glow">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Recent History
                </h3>
                <p className="text-sm text-[#CAF0F8]">
                  Recent professor interactions
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-[#00B4D8] hover:text-[#90E0EF]">
                View all
              </Button>
            </div>
            <div className="space-y-4">
              {recentHistory.map((prof, index) => (
                <div
                  key={prof.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-in fade-in p-4 rounded-md border border-[#003566]/20 bg-[#000814]/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {prof.name}
                      </div>
                      <div className="text-sm text-[#00B4D8] font-medium">
                        {prof.university}
                      </div>
                      <div className="text-sm text-[#90E0EF] mt-1">
                        {prof.email}
                      </div>
                    </div>
                    <div className="text-sm text-[#CAF0F8]">
                      {prof.lastContacted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
