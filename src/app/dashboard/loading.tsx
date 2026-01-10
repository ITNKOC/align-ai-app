import { PhaseIndicator } from "@/components/shared/phase-indicator";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="container-app">
        {/* Header skeleton */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-64 animate-pulse" />
            </div>
            <div className="h-12 bg-white/10 rounded-xl w-40 animate-pulse" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                  <div>
                    <div className="h-6 bg-white/10 rounded w-12 mb-1" />
                    <div className="h-3 bg-white/10 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Applications list skeleton */}
          <div className="glass rounded-2xl p-6">
            <div className="h-5 bg-white/10 rounded w-40 mb-6 animate-pulse" />

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg" />
                    <div>
                      <div className="h-4 bg-white/10 rounded w-48 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-white/10 rounded-full w-20" />
                    <div className="h-8 bg-white/10 rounded-lg w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
