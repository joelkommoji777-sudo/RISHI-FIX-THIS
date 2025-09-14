import { useState } from "react";

export default function Professors() {
  const [university, setUniversity] = useState("");
  const [research, setResearch] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const search = () => {
    setResults([
      "Dr. Sarah Chen — Professor of Computer Science — MIT",
      "Dr. Michael Rodriguez — Associate Professor — Stanford University",
      "Dr. Alice Johnson — Assistant Professor — UC Berkeley",
    ]);
  };

  return (
    <div className="min-h-screen space-bg relative py-10">
      {/* Enhanced Cosmic Background Layers */}
      <div className="absolute inset-0 nebula-glow opacity-40"></div>
      <div className="absolute inset-0 cosmic-depth opacity-30"></div>
      <div className="absolute inset-0 nebula-band opacity-20"></div>
      <div className="absolute inset-0 cosmic-glow opacity-15"></div>
      
      <div className="container mx-auto relative z-10">
        <h1 className="text-2xl font-semibold mb-2 text-white">Find Professors</h1>
        <p className="text-sm text-[#CAF0F8] mb-6">
          Connect with faculty who align with your research interests
        </p>

        <div className="rounded-lg bg-[#001D3D]/30 backdrop-blur-sm border border-[#003566]/30 p-4 shadow-md mb-6 electric-glow">
          <h4 className="font-semibold mb-3 text-white">Search Criteria</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="University"
              className="rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
            />
            <input
              value={research}
              onChange={(e) => setResearch(e.target.value)}
              placeholder="Research interests"
              className="rounded border border-[#003566]/50 bg-[#000814]/50 text-white placeholder-[#90E0EF] px-3 py-2 text-sm focus:border-[#0077B6] focus:outline-none"
            />
            <button
              onClick={search}
              className="rounded bg-[#0077B6] hover:bg-[#00B4D8] px-4 py-2 text-sm font-semibold text-white transition-colors electric-glow"
            >
              Search Professors
            </button>
          </div>
        </div>

        <div className="text-sm text-[#CAF0F8] mb-3">
          Search Results ({results.length} found)
        </div>

        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="rounded-lg bg-[#001D3D]/30 backdrop-blur-sm border border-[#003566]/30 p-6 shadow-md text-[#CAF0F8]">
              No results — try searching
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="rounded-lg bg-[#001D3D]/30 backdrop-blur-sm border border-[#003566]/30 p-4 shadow-md flex items-start gap-4 cyan-glow"
              >
                <div className="h-12 w-12 shrink-0 rounded-full cosmic-gradient flex items-center justify-center text-white font-semibold sky-glow">
                  P
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{r.split(" — ")[0]}</div>
                      <div className="text-sm text-[#90E0EF]">
                        {r.split(" — ")[1]}
                      </div>
                    </div>
                    <div className="text-sm text-[#00B4D8] font-semibold">
                      {Math.floor(Math.random() * 100)}% Match
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-[#CAF0F8]">
                    Research Areas: Machine Learning, Natural Language
                    Processing, AI Ethics
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button className="rounded bg-[#0077B6] hover:bg-[#00B4D8] px-3 py-1 text-sm font-semibold text-white transition-colors electric-glow">
                      Send Message
                    </button>
                    <button className="rounded border border-[#003566] text-[#CAF0F8] hover:text-[#00B4D8] hover:border-[#0077B6] px-3 py-1 text-sm transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
