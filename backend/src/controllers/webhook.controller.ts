import { Request, Response } from 'express';
import { stripe } from '../config/stripe';
import db from '../db';
import { company } from '../db/schema';
import { eq } from 'drizzle-orm';
import { WebhookEvent } from '../types/stripe';
import logging from '../config/logging';
import { Stripe } from 'stripe';

const handleFailedPayment = async (event: WebhookEvent): Promise<void> => {
    try {
        logging.info('Starting handleFailedPayment with event:', JSON.stringify(event, null, 2));
        
        const invoice = event.data.object as Stripe.Invoice;
        logging.info('Invoice object:', JSON.stringify(invoice, null, 2));
        
        const customerId = invoice.customer as string;
        logging.info('Customer ID from invoice:', customerId);

        const companyData = await db.query.company.findFirst({
            where: eq(company.stripeCustomerId, customerId),
        });
        logging.info('Found company data:', companyData ? JSON.stringify(companyData, null, 2) : 'No company found');

        if (!companyData) {
            logging.error('Company not found for customer:', customerId);
            return;
        }

        const updateResult = await db.update(company)
            .set({
                subscriptionStatus: 'past_due',
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyData.id));
        
        logging.info('Update result:', updateResult);
        logging.info('Successfully updated company subscription status to past_due:', companyData.id);
    } catch (error) {
        logging.error('Error in handleFailedPayment:', error);
        throw error;
    }
};

const handleSubscriptionUpdate = async (event: WebhookEvent): Promise<void> => {
    try {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logging.info('Handling subscription update for customer:', customerId);

        const companyData = await db.query.company.findFirst({
            where: eq(company.stripeCustomerId, customerId),
        });

        if (!companyData) {
            logging.error('Company not found for customer:', customerId);
            return;
        }

        await db.update(company)
            .set({
                subscriptionStatus: subscription.status,
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyData.id));

        logging.info('Updated company subscription status:', subscription.status);
    } catch (error) {
        logging.error('Error handling subscription update:', error);
        throw error;
    }
};

const handleSubscriptionDeletion = async (event: WebhookEvent): Promise<void> => {
    try {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logging.info('Handling subscription deletion for customer:', customerId);

        const companyData = await db.query.company.findFirst({
            where: eq(company.stripeCustomerId, customerId),
        });

        if (!companyData) {
            logging.error('Company not found for customer:', customerId);
            return;
        }

        await db.update(company)
            .set({
                subscriptionStatus: 'canceled',
                stripeSubscriptionId: null,
                currentPlanId: null,
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyData.id));

        logging.info('Updated company subscription status to canceled:', companyData.id);
    } catch (error) {
        logging.error('Error handling subscription deletion:', error);
        throw error;
    }
};

export const handleStripeWebhook = async (req: Request, res: Response): Promise<Response> => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_cc5ca01de41566d4ad7f776153bc47c312a3de0bc69fff41de6824ad838f2c5f';

    if (!sig) {
        logging.error('Missing stripe signature');
        return res.status(400).json({ error: 'Missing stripe signature' });
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        ) as WebhookEvent;

        logging.info('Processing webhook event:', event.type);

        switch (event.type) {
            case 'invoice.payment_failed':
                await handleFailedPayment(event);
                break;
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeletion(event);
                break;
            default:
                logging.info('Unhandled event type:', event.type);
        }

        return res.json({ received: true });
    } catch (err) {
        logging.error('Webhook error:', err);
        return res.status(400).json({ error: 'Webhook error' });
    }
}; 