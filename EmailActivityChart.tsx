export function EmailActivityChart() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm animate-in fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Activity Chart
          </h3>
          <div className="text-sm text-neutral-500">
            Track your daily email activity and response rates
          </div>
        </div>
        <div className="text-neutral-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-neutral-600">Emails Sent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-neutral-600">Opens</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-neutral-600">Replies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-neutral-600">Response Rate</span>
        </div>
      </div>

      {/* Area Chart - Full Width */}
      <div className="h-80 w-full relative">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          
          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis labels */}
          <text x="15" y="25" className="text-xs fill-neutral-400">1</text>
          <text x="15" y="85" className="text-xs fill-neutral-400">0.75</text>
          <text x="15" y="145" className="text-xs fill-neutral-400">0.5</text>
          <text x="15" y="205" className="text-xs fill-neutral-400">0.25</text>
          <text x="15" y="265" className="text-xs fill-neutral-400">0</text>
          
          {/* Extended area chart path with more data points */}
          <path
            d="M 0,25 L 100,45 L 200,65 L 300,85 L 400,105 L 500,125 L 600,145 L 700,165 L 800,285 L 800,300 L 0,300 Z"
            fill="url(#areaGradient)"
            stroke="none"
          />
          
          {/* Line path */}
          <path
            d="M 0,25 L 100,45 L 200,65 L 300,85 L 400,105 L 500,125 L 600,145 L 700,165 L 800,285"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          
          {/* Data points */}
          <circle cx="0" cy="25" r="4" fill="#8b5cf6" />
          <circle cx="100" cy="45" r="4" fill="#8b5cf6" />
          <circle cx="200" cy="65" r="4" fill="#8b5cf6" />
          <circle cx="300" cy="85" r="4" fill="#8b5cf6" />
          <circle cx="400" cy="105" r="4" fill="#8b5cf6" />
          <circle cx="500" cy="125" r="4" fill="#8b5cf6" />
          <circle cx="600" cy="145" r="4" fill="#8b5cf6" />
          <circle cx="700" cy="165" r="4" fill="#8b5cf6" />
          <circle cx="800" cy="285" r="4" fill="#8b5cf6" />
        </svg>
      </div>
    </div>
  );
}
