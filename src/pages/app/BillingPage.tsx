import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  ArrowRight,
  Receipt,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_TIERS } from "@/lib/stripe";
import { toast } from "sonner";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["25 prompts", "5 test runs/month", "Basic export"],
    priceId: null,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$19",
    period: "/month",
    popular: true,
    features: ["Unlimited prompts", "100 test runs/month", "Full export", "Public sharing"],
    priceId: STRIPE_TIERS.pro.priceId,
  },
  {
    key: "team" as const,
    name: "Team",
    price: "$49",
    period: "/user/month",
    features: ["Everything in Pro", "Team workspaces", "Roles & permissions", "Audit log"],
    priceId: STRIPE_TIERS.team.priceId,
  },
];

const invoices = [
  { id: "1", date: "Dec 1, 2024", amount: "$0.00", status: "paid" },
  { id: "2", date: "Nov 1, 2024", amount: "$0.00", status: "paid" },
];

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const { subscribed, tier, subscriptionEnd, isLoading, refetch } = useSubscription();

  // Handle success/cancel redirects
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated successfully!");
      refetch();
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout was canceled.");
    }
  }, [searchParams, refetch]);

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start checkout";
      toast.error(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open customer portal";
      toast.error(errorMessage);
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlanName = tier ? STRIPE_TIERS[tier].name : "Free";
  const currentPlanPrice = tier ? `$${STRIPE_TIERS[tier].price}` : "$0";
  const currentPlanPeriod = tier ? "/month" : "forever";

  const isPlanCurrent = (planKey: string) => {
    if (planKey === "free" && !subscribed) return true;
    if (planKey === tier) return true;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current Plan */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge variant="secondary">
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : currentPlanName}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {subscribed
                ? `Your subscription renews on ${new Date(subscriptionEnd!).toLocaleDateString()}.`
                : `You're on the Free plan. Upgrade to unlock more features.`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{currentPlanPrice}</p>
            <p className="text-sm text-muted-foreground">{currentPlanPeriod}</p>
          </div>
        </div>
        {subscribed && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
            >
              {loadingPortal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage Subscription
            </Button>
          </div>
        )}
      </div>

      {/* Plans Comparison */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = isPlanCurrent(plan.key);
          const isUpgrade = plan.priceId && !isCurrent;
          const isLoading = loadingPlan === plan.name;

          return (
            <div
              key={plan.name}
              className={cn(
                "p-6 rounded-xl border bg-card",
                plan.popular && "border-amber-500 ring-1 ring-amber-500",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {plan.popular && (
                <Badge variant="accent" className="mb-3">Most Popular</Badge>
              )}
              {isCurrent && !plan.popular && (
                <Badge variant="secondary" className="mb-3">Your Plan</Badge>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="my-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current plan
                </Button>
              ) : isUpgrade ? (
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.priceId!, plan.name)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  —
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Usage This Month</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Prompts</span>
              <span className="text-sm font-medium">24 / 25</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[96%] rounded-full bg-amber-500" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Test Runs</span>
              <span className="text-sm font-medium">3 / 5</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Usage resets on the 1st of each month.
        </p>
      </div>

      {/* Payment Method */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Method</h2>
          {subscribed ? (
            <Button variant="outline" size="sm" onClick={handleManageSubscription}>
              <CreditCard className="mr-2 h-4 w-4" />
              Update Card
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          {subscribed
            ? "Manage your payment method via the Stripe Customer Portal."
            : "No payment method on file. Add one to upgrade your plan."}
        </p>
      </div>

      {/* Invoices */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-lg font-semibold">Billing History</h2>
        {invoices.length > 0 ? (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{invoice.date}</p>
                    <p className="text-xs text-muted-foreground">{invoice.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="capitalize">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
