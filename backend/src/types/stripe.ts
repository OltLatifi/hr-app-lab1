import { Stripe } from 'stripe';

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  features: string[];
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  paymentMethodId: string | null;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  priceId: string;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
}

export interface SubscriptionResponse {
  id: string;
  status: string;
  currentPeriodEnd: number | undefined;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    priceId: string;
  };
}

export type WebhookEvent = Stripe.Event & {
  data: {
    object: Stripe.Invoice | Stripe.Subscription;
  };
}

export type StripeWebhookEvent = Stripe.Event; 