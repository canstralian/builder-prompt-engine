export function AuthBranding() {
  return (
    <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-16">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex h-20 w-20 rounded-2xl bg-amber-500/20 items-center justify-center mb-6">
            <svg className="h-10 w-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Design prompts you can trust.
        </h2>
        <p className="text-white/70 text-lg">
          Join thousands of builders crafting better prompts with professional tools for versioning, testing, and collaboration.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-white">10k+</p>
            <p className="text-sm text-white/50">Prompts created</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">2k+</p>
            <p className="text-sm text-white/50">Builders</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">50+</p>
            <p className="text-sm text-white/50">Teams</p>
          </div>
        </div>
      </div>
    </div>
  );
}
