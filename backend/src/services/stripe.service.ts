import { stripe } from '../config/stripe';
import { 
  CreateSubscriptionParams, 
  UpdateSubscriptionParams, 
  CancelSubscriptionParams,
  SubscriptionResponse 
} from '../types/stripe';


export async function createSubscription({ customerId, priceId, paymentMethodId }: CreateSubscriptionParams): Promise<SubscriptionResponse & { clientSecret?: string }> {
    console.log('Stripe service - Creating subscription with:', { customerId, priceId, paymentMethodId });

    if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });

        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            collection_method: 'charge_automatically',
            proration_behavior: 'create_prorations',
        });

        // Immediately pay the invoice to activate the subscription
        if (subscription.latest_invoice && typeof subscription.latest_invoice === 'string') {
            const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice);
            if (latestInvoice.status === 'open' && latestInvoice.id) {
                await stripe.invoices.pay(latestInvoice.id, {
                    payment_method: paymentMethodId
                });
            }
        }

        // Retrieve the updated subscription
        const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id);
        console.log('Stripe subscription created and activated:', updatedSubscription);

        const response = formatSubscriptionResponse(updatedSubscription);
        console.log('Formatted response:', response);
        return response;
    }

    // Initial subscription creation without payment method
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice'],
        collection_method: 'charge_automatically',
        proration_behavior: 'create_prorations',
    });
    console.log('Stripe subscription created:', subscription);

    const response = formatSubscriptionResponse(subscription);
    console.log('Formatted response:', response);
    
    const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
            subscriptionId: subscription.id
        }
    });
    
    if (setupIntent.client_secret) {
        console.log('Created setup intent with client secret:', setupIntent.client_secret);
        return {
            ...response,
            clientSecret: setupIntent.client_secret
        };
    }

    console.log('No client secret found in response');
    return response;
}

export async function updateSubscription({ subscriptionId, priceId }: UpdateSubscriptionParams): Promise<SubscriptionResponse> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
            id: subscription.items.data[0].id,
            price: priceId,
        }],
    });

    return formatSubscriptionResponse(updatedSubscription);
}

export async function cancelSubscription({ subscriptionId }: CancelSubscriptionParams): Promise<SubscriptionResponse> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });

    return formatSubscriptionResponse(subscription);
}

export function formatSubscriptionResponse(subscription: any): SubscriptionResponse {
    return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        plan: {
            id: subscription.items.data[0].price.id,
            name: subscription.items.data[0].price.nickname || 'Unknown Plan',
            priceId: subscription.items.data[0].price.id,
        },
    };
}