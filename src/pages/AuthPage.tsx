import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthBranding } from "@/components/auth/AuthBranding";
import { NetworkPattern } from "@/components/ui/network-pattern";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/app/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden">
        <NetworkPattern 
          id="auth-form-network" 
          opacity={0.03} 
          variant="sparse" 
        />
        <div className="relative z-10">
          <div className="mb-8">
            <Logo size="md" />
          </div>
          <AuthForm mode={mode} onModeChange={setMode} />
        </div>
      </div>

      {/* Right side - Branding */}
      <AuthBranding />
    </div>
  );
}
