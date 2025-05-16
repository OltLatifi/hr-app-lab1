import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from '@/components/subscription/payment-form';
import { StripeProvider } from '@/components/providers/stripe-provider';
import { useAuthStore } from '@/stores/auth-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getSubscriptionPlans, createSubscription, cancelSubscription, getCurrentSubscription } from '@/services/subscriptionService';

interface Plan {
    name: string;
    priceId: string;
    features: string[];
}

interface PlansResponse {
    [key: string]: Plan;
}

interface SubscriptionStatus {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number;
    plan: {
        id?: string;
        name: string;
        priceId?: string;
    };
    clientSecret?: string;
}

export default function SubscriptionManagement() {
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<PlansResponse>({});
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

    const fetchSubscriptionStatus = async () => {
        if (!user?.companyId) {
            setError("You must be associated with a company to manage subscription");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [plansResponse, subscriptionResponse] = await Promise.all([
                getSubscriptionPlans(),
                getCurrentSubscription(user.companyId.toString())
            ]);
            setPlans(plansResponse);
            if (subscriptionResponse?.status === 'active') {
                setSubscriptionStatus(subscriptionResponse);
                setClientSecret(null);
            } else if (subscriptionResponse?.status === 'incomplete' && subscriptionResponse.clientSecret) {
                setClientSecret(subscriptionResponse.clientSecret);
                setSubscriptionStatus(subscriptionResponse);
            } else {
                const firstPlanId = Object.keys(plansResponse)[0];
                setSelectedPlanId(firstPlanId);
                setSubscriptionStatus(null);
                setClientSecret(null);
            }
        } catch (error) {
            setError("Failed to fetch subscription status");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!subscriptionStatus?.id) {
            setError("No active subscription to cancel");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await cancelSubscription(subscriptionStatus.id);
            setSubscriptionStatus(response);
            setSuccess("Your subscription will be cancelled at the end of the current billing period");
        } catch (error) {
            setError("Failed to cancel subscription");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionStatus();
    }, [user?.companyId]);

    const handleStartSubscription = async () => {
        if (!user?.companyId || !selectedPlanId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await createSubscription(
                user.companyId.toString(),
                plans[selectedPlanId].priceId,
                ''
            );
            if (response?.clientSecret) {
                setClientSecret(response.clientSecret);
                setSubscriptionStatus({ id: '', status: 'incomplete', cancelAtPeriodEnd: false, currentPeriodEnd: 0, plan: { name: plans[selectedPlanId].name, id: selectedPlanId, priceId: plans[selectedPlanId].priceId }, clientSecret: response.clientSecret });
            } else {
                setError('Failed to initialize payment');
            }
        } catch (error) {
            setError('Failed to start subscription');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentMethodId: string) => {
        if (!selectedPlanId || !user?.companyId) {
            setError("Missing required information for subscription");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await createSubscription(
                user.companyId.toString(),
                plans[selectedPlanId].priceId,
                paymentMethodId
            );
            if (response.status === 'active') {
                setSuccess("Your subscription has been activated successfully");
                setSubscriptionStatus(response);
                setClientSecret(null);
            } else if (response.status === 'incomplete' && response.clientSecret) {
                setClientSecret(response.clientSecret);
                setSubscriptionStatus(response);
                setError("Payment incomplete. Please try again.");
            } else {
                setError("Subscription is not active. Please contact support if this persists.");
            }
        } catch (error) {
            setError("Failed to create subscription");
        } finally {
            setLoading(false);
            setSelectedPlanId(null);
        }
    };

    const handlePaymentCancel = () => {
        setSelectedPlanId(null);
        setClientSecret(null);
        setError("Subscription process was cancelled");
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return null;
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <div className="container py-8">
            <Card className="w-full max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>
                        Manage your subscription plan and billing details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mb-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                    {loading ? (
                        <div>Loading subscription details...</div>
                    ) : subscriptionStatus && subscriptionStatus.status === 'active' ? (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2">Current Subscription</h3>
                                <p className="text-sm text-muted-foreground capitalize">
                                    Status: {subscriptionStatus.status}
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    Plan: Pro
                                </p>
                                {subscriptionStatus.currentPeriodEnd && (
                                    <p className="text-sm text-muted-foreground">
                                        Current Period Ends: {formatDate(subscriptionStatus.currentPeriodEnd)}
                                    </p>
                                )}
                                {subscriptionStatus.cancelAtPeriodEnd && (
                                    <p className="text-sm text-red-500 mt-2">
                                        Your subscription will end soon
                                    </p>
                                )}
                            </div>
                            {!subscriptionStatus.cancelAtPeriodEnd && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelSubscription}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Cancel Subscription'}
                                </Button>
                            )}
                        </div>
                    ) : clientSecret ? (
                        <StripeProvider clientSecret={clientSecret}>
                            <PaymentForm
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                            />
                        </StripeProvider>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-4">
                                Subscribe to access all features of our platform.
                            </p>
                            <Button onClick={handleStartSubscription} disabled={loading || !selectedPlanId}>
                                {loading ? 'Loading...' : 'Start Subscription'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 