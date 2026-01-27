import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTierByProductId, type StripeTier } from "@/lib/stripe";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  tier: StripeTier | null;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    tier: null,
    isLoading: false,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        tier: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        throw new Error(error.message);
      }

      const tier = data.productId ? getTierByProductId(data.productId) : null;

      setState({
        subscribed: data.subscribed,
        productId: data.productId,
        subscriptionEnd: data.subscriptionEnd,
        tier,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check subscription";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    ...state,
    refetch: checkSubscription,
  };
}
