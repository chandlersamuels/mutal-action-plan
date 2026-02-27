export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branded panel */}
      <div
        className="hidden lg:flex lg:w-120 xl:w-140 shrink-0 flex-col justify-between p-12"
        style={{ backgroundColor: "oklch(0.115 0.018 255)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ backgroundColor: "oklch(0.7248 0.2145 145.7)" }}
          >
            A
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Antistall</span>
        </div>

        {/* Tagline */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-snug">
              Close deals with
              <br />
              <span style={{ color: "oklch(0.7248 0.2145 145.7)" }}>clarity.</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Shared action plans that keep you and your clients aligned — from first call to signed contract.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Collaborative deal roadmaps",
              "Real-time client visibility",
              "Forecast milestone tracking",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "oklch(0.7248 0.2145 145.7)" }}
                />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Antistall. All rights reserved.
        </p>
      </div>

      {/* Right: Form area — always light */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
            style={{ backgroundColor: "oklch(0.7248 0.2145 145.7)" }}
          >
            A
          </div>
          <span className="font-semibold text-gray-900 text-base tracking-tight">Antistall</span>
        </div>

        {children}
      </div>
    </div>
  );
}
