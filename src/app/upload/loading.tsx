import { PhaseIndicator } from "@/components/shared/phase-indicator";

export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="container-app">
        <PhaseIndicator currentPhase={1} />

        <div className="flex flex-col items-center justify-center py-20">
          {/* Skeleton for upload area */}
          <div className="w-full max-w-2xl">
            <div className="glass rounded-2xl p-8 animate-pulse">
              {/* Title skeleton */}
              <div className="h-8 bg-white/10 rounded-lg w-64 mx-auto mb-4" />
              <div className="h-4 bg-white/10 rounded w-48 mx-auto mb-8" />

              {/* Upload zone skeleton */}
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full mb-4" />
                  <div className="h-4 bg-white/10 rounded w-40 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-32" />
                </div>
              </div>

              {/* Features skeleton */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full" />
                    <div className="h-3 bg-white/10 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
