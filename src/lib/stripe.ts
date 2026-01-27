// Stripe product and price configuration
// Maps internal tier names to Stripe IDs

export const STRIPE_TIERS = {
  pro: {
    name: "Pro",
    priceId: "price_1SuFk3JT3gPuFObcPigWYOvT",
    productId: "prod_TrzjjcjJgXqLub",
    price: 19,
    period: "month",
  },
  team: {
    name: "Team",
    priceId: "price_1SuI5dJT3gPuFObcVLU0sHH1",
    productId: "prod_Ts29Vk9nidZioa",
    price: 49,
    period: "month",
  },
} as const;

export type StripeTier = keyof typeof STRIPE_TIERS;

export function getTierByProductId(productId: string): StripeTier | null {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.productId === productId) {
      return tier as StripeTier;
    }
  }
  return null;
}

export function getTierDisplayName(productId: string | null): string {
  if (!productId) return "Free";
  const tier = getTierByProductId(productId);
  if (!tier) return "Free";
  return STRIPE_TIERS[tier].name;
}
