import { PhaseIndicator } from "@/components/shared/phase-indicator";

export default function GenerateLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="container-app">
        <PhaseIndicator currentPhase={4} />

        <div className="py-8">
          {/* Title skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-white/10 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-80 mx-auto animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* CV Preview skeleton */}
            <div className="glass rounded-2xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-white/10 rounded w-24" />
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                </div>
              </div>
              <div className="aspect-[8.5/11] bg-white/5 rounded-xl border border-white/10" />
            </div>

            {/* Cover Letter Preview skeleton */}
            <div className="glass rounded-2xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-white/10 rounded w-36" />
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                </div>
              </div>
              <div className="aspect-[8.5/11] bg-white/5 rounded-xl border border-white/10" />
            </div>
          </div>

          {/* Follow-up email skeleton */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-40 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="h-4 bg-white/10 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
