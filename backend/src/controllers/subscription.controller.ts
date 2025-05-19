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

export const getSubscriptionStatusController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const companyId = parseInt(req.params.companyId);

        const companyData = await db.query.company.findFirst({
            where: eq(company.id, companyId),
        });

        if (!companyData) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (!companyData.stripeSubscriptionId || !companyData.subscriptionStatus) {
            return res.status(200).json(null);
        }

        return res.json({
            id: companyData.stripeSubscriptionId,
            status: companyData.subscriptionStatus,
            cancelAtPeriodEnd: companyData.subscriptionStatus === 'canceled',
            plan: {
                id: companyData.currentPlanId || '',
                name: companyData.currentPlanId || 'Unknown Plan',
                priceId: companyData.currentPlanId || '',
            },
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        return res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

export const createSubscriptionController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { companyId, priceId, paymentMethodId } = req.body;
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
            const subscription = await createSubscription({
                customerId: companyData.stripeCustomerId,
                priceId,
                paymentMethodId: null
            });
            return res.json({ clientSecret: subscription.clientSecret });
        }
        const subscription = await createSubscription({
            customerId: companyData.stripeCustomerId,
            priceId,
            paymentMethodId,
        });
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
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'No subscriptionId provided' });
        }

        const companyData = await db.query.company.findFirst({
            where: eq(company.stripeSubscriptionId, subscriptionId),
        });

        if (!companyData) {
            return res.status(400).json({ error: 'No active subscription found' });
        }

        const subscription = await cancelSubscription({
            subscriptionId,
        });

        await db.update(company)
            .set({
                subscriptionStatus: subscription.status,
                updatedAt: new Date(),
            })
            .where(eq(company.id, companyData.id));

        return res.json(subscription);
    } catch (error) {
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