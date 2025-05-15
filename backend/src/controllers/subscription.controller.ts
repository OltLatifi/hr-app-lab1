import { Request, Response } from 'express';
import db from '../db';
import { company } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
    createSubscription,
    updateSubscription,
    cancelSubscription
} from '../services/stripe.service';
import { STRIPE_PLANS } from '../config/stripe';

export const createSubscriptionController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId, priceId, paymentMethodId } = req.body;
        console.log('Creating subscription with:', { companyId, priceId, paymentMethodId });

        const companyData = await db.query.company.findFirst({
            where: eq(company.id, companyId),
        });

        if (!companyData) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (!companyData.stripeCustomerId) {
            return res.status(400).json({ error: 'Company has no Stripe customer ID' });
        }

        if (!paymentMethodId) {
            console.log('Creating initial subscription without payment method');
            const subscription = await createSubscription({
                customerId: companyData.stripeCustomerId,
                priceId,
                paymentMethodId: null
            });
            console.log('Initial subscription response:', subscription);

            return res.json({ clientSecret: subscription.clientSecret });
        }

        console.log('Creating final subscription with payment method');
        const subscription = await createSubscription({
            customerId: companyData.stripeCustomerId,
            priceId,
            paymentMethodId,
        });
        console.log('Final subscription response:', subscription);

        if (subscription.status === 'active') {
            await db.update(company)
                .set({
                    stripeSubscriptionId: subscription.id,
                    subscriptionStatus: subscription.status,
                    currentPlanId: subscription.plan.priceId,
                    updatedAt: new Date(),
                })
                .where(eq(company.id, companyId));
        }

        return res.json(subscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        return res.status(500).json({ error: 'Failed to create subscription' });
    }
};

export const updateSubscriptionController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId, priceId } = req.body;

        const companyData = await db.query.company.findFirst({
            where: eq(company.id, companyId),
        });

        if (!companyData?.stripeSubscriptionId) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        const subscription = await updateSubscription({
            subscriptionId: companyData.stripeSubscriptionId,
            priceId,
        });

        await db.update(company)
            .set({
                subscriptionStatus: subscription.status,
                currentPlanId: subscription.plan.priceId,
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyId));

        return res.json(subscription);
    } catch (error) {
        console.error('Error updating subscription:', error);
        return res.status(500).json({ error: 'Failed to update subscription' });
    }
};

export const cancelSubscriptionController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId } = req.body;

        const companyData = await db.query.company.findFirst({
            where: eq(company.id, companyId),
        });

        if (!companyData?.stripeSubscriptionId) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        const subscription = await cancelSubscription({
            subscriptionId: companyData.stripeSubscriptionId,
        });

        await db.update(company)
            .set({
                subscriptionStatus: subscription.status,
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyId));

        return res.json(subscription);
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

export const getPlans = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res.json(STRIPE_PLANS);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return res.status(500).json({ error: 'Failed to fetch plans' });
    }
}; 