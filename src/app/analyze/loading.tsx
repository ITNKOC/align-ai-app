import { PhaseIndicator } from "@/components/shared/phase-indicator";

export default function AnalyzeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="container-app">
        <PhaseIndicator currentPhase={2} />

        <div className="py-8">
          {/* Title skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-white/10 rounded-lg w-72 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-96 mx-auto animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input area skeleton */}
            <div className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-40 mb-4" />
              <div className="h-48 bg-white/10 rounded-xl mb-4" />
              <div className="h-12 bg-white/10 rounded-xl" />
            </div>

            {/* Results area skeleton */}
            <div className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-32 mb-6" />

              {/* Score gauge skeleton */}
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 bg-white/10 rounded-full" />
              </div>

              {/* Gap list skeleton */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/10 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
