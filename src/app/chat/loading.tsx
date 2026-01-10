import { PhaseIndicator } from "@/components/shared/phase-indicator";

export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="container-app">
        <PhaseIndicator currentPhase={3} />

        <div className="py-8">
          <div className="max-w-4xl mx-auto">
            {/* Chat header skeleton */}
            <div className="glass rounded-2xl p-4 mb-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full" />
                  <div>
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-24" />
                  </div>
                </div>
                <div className="h-8 bg-white/10 rounded-full w-24" />
              </div>
            </div>

            {/* Messages area skeleton */}
            <div className="glass rounded-2xl p-6 min-h-[400px] animate-pulse">
              <div className="space-y-6">
                {/* AI message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>

                {/* User message */}
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-md">
                    <div className="h-12 bg-indigo-500/20 rounded-xl ml-auto w-48" />
                  </div>
                </div>

                {/* AI message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-4/5 mb-2" />
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Input area skeleton */}
            <div className="mt-4 animate-pulse">
              <div className="h-14 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
