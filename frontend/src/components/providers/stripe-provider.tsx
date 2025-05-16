import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise} options={{
      clientSecret,
      appearance: {
        theme: 'stripe',
      },
    }}>
      {children}
    </Elements>
  );
} 