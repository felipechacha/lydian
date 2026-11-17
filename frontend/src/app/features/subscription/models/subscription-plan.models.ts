export type SubscriptionPlanId = 'free' | 'starter' | 'full';
export type SubscriptionPlanTone = 'neutral' | 'primary' | 'secondary';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  eyebrow: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  annualEquivalent: string;
  annualBenefit: string;
  features: readonly string[];
  ctaLabel: string;
  icon: string;
  tone: SubscriptionPlanTone;
  isRecommended?: boolean;
}

export interface CurrentSubscriptionSummary {
  planName: string;
  statusLabel: string;
  priceLabel: string;
  description: string;
  usageLabel: string;
}
