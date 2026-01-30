import logoImage from "@/assets/logo.png";

// Subtle neural network background pattern
function NetworkPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-network" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="2" fill="currentColor" />
            <circle cx="0" cy="0" r="1" fill="currentColor" />
            <circle cx="80" cy="0" r="1" fill="currentColor" />
            <circle cx="0" cy="80" r="1" fill="currentColor" />
            <circle cx="80" cy="80" r="1" fill="currentColor" />
            <line x1="0" y1="0" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
            <line x1="80" y1="0" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
            <line x1="80" y1="80" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-network)" />
      </svg>
    </div>
  );
}

export function AuthBranding() {
  return (
    <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 items-center justify-center p-16 relative overflow-hidden">
      <NetworkPattern />
      <div className="max-w-md text-center relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="PromptCrafting" 
              className="h-24 w-24 drop-shadow-lg"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-primary-foreground mb-4 tracking-tight">
          Craft prompts with precision.
        </h2>
        <p className="text-primary-foreground/80 text-lg leading-relaxed">
          Professional-grade tools for versioning, testing, and collaboration. Built for teams who demand reliability.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center border-t border-primary-foreground/20 pt-8">
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">10k+</p>
            <p className="text-sm text-primary-foreground/60 uppercase tracking-wider font-medium">Prompts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">2k+</p>
            <p className="text-sm text-primary-foreground/60 uppercase tracking-wider font-medium">Engineers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground tabular-nums">50+</p>
            <p className="text-sm text-primary-foreground/60 uppercase tracking-wider font-medium">Teams</p>
          </div>
        </div>
      </div>
    </div>
  );
}
