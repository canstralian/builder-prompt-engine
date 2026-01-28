export function AuthBranding() {
  return (
    <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-16">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex h-20 w-20 bg-accent/20 items-center justify-center mb-6 border border-accent/30">
            <svg className="h-10 w-10 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-primary-foreground mb-4 tracking-tight">
          Craft prompts with precision.
        </h2>
        <p className="text-primary-foreground/70 text-lg leading-relaxed">
          Professional-grade tools for versioning, testing, and collaboration. Built for teams who demand reliability.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center border-t border-primary-foreground/10 pt-8">
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">10k+</p>
            <p className="text-sm text-primary-foreground/50 uppercase tracking-wider">Prompts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">2k+</p>
            <p className="text-sm text-primary-foreground/50 uppercase tracking-wider">Engineers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">50+</p>
            <p className="text-sm text-primary-foreground/50 uppercase tracking-wider">Teams</p>
          </div>
        </div>
      </div>
    </div>
  );
}
