import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkPattern } from "@/components/ui/network-pattern";

const plans = [
  {
    name: "Free",
    description: "For individuals getting started with prompt engineering.",
    price: "$0",
    period: "forever",
    cta: "Start free",
    ctaVariant: "outline" as const,
    features: [
      "1 personal workspace",
      "Up to 25 prompts",
      "5 test runs per month",
      "Basic export (Markdown)",
      "Community support",
    ],
    limits: [
      "No public sharing",
      "No team features",
    ],
  },
  {
    name: "Pro",
    description: "For serious prompt engineers and creators.",
    price: "$19",
    period: "per month",
    cta: "Start 14-day trial",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "1 personal workspace",
      "Unlimited prompts",
      "100 test runs per month",
      "Full export (JSON + Markdown)",
      "Public share links",
      "Version history & diffs",
      "Priority support",
    ],
    limits: [],
  },
  {
    name: "Team",
    description: "For teams that need collaboration and control.",
    price: "$49",
    period: "per user / month",
    cta: "Contact sales",
    ctaVariant: "outline" as const,
    features: [
      "Unlimited team workspaces",
      "Unlimited prompts",
      "Unlimited test runs",
      "All Pro features",
      "Team roles & permissions",
      "Review & approval workflows",
      "Audit log",
      "SSO (coming soon)",
      "Dedicated support",
    ],
    limits: [],
  },
];

const faqs = [
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What counts as a test run?",
    answer: "A test run is when you execute a prompt with sample inputs to evaluate its output. Each execution counts as one test run.",
  },
  {
    question: "Do you offer discounts for startups or non-profits?",
    answer: "Yes! We offer 50% off for eligible startups and non-profits. Contact us with details about your organization.",
  },
  {
    question: "What happens when I reach my limit?",
    answer: "You'll receive a notification as you approach your limits. You can upgrade anytime, or wait for your limits to reset monthly.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 md:py-32">
      {/* Header */}
      <div className="relative overflow-hidden pb-16">
        <NetworkPattern id="pricing-header-network" opacity={0.04} variant="sparse" />
        <div className="container relative z-10">
          <div className="text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="relative overflow-hidden py-8">
        <NetworkPattern id="pricing-plans-network" opacity={0.03} variant="default" />
        <div className="container relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-8 rounded-2xl border bg-card",
                plan.popular
                  ? "border-amber-500 shadow-lg shadow-amber-500/10"
                  : "border-border"
              )}
            >
              {plan.popular && (
                <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-2">{plan.period}</span>
              </div>
              <Button
                variant={plan.ctaVariant}
                className="w-full mb-8"
                asChild
              >
                <Link to="/auth?mode=signup">{plan.cta}</Link>
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="h-4 w-4 flex items-center justify-center mt-0.5 shrink-0">—</span>
                    <span>{limit}</span>
                  </li>
                ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="relative overflow-hidden py-20">
        <NetworkPattern id="pricing-faqs-network" opacity={0.025} variant="sparse" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden py-12">
        <NetworkPattern id="pricing-cta-network" opacity={0.05} variant="dense" />
        <div className="container relative z-10">
          <div className="text-center p-12 rounded-2xl bg-muted/50 border border-border">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            We're here to help. Reach out and we'll get back to you within 24 hours.
          </p>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
