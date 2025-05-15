import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from '@/components/subscription/PaymentForm';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { useAuthStore } from '@/stores/auth-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSubscriptionPlans, createSubscription } from '@/services/subscriptionService';

interface Plan {
    name: string;
    priceId: string;
    features: string[];
}

interface PlansResponse {
    [key: string]: Plan;
}

export default function SubscriptionManagement() {
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<PlansResponse>({});
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const handleStartSubscription = async () => {
        if (!user?.companyId) {
            setError("You must be associated with a company to subscribe");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Fetching subscription plans...');
            const response = await getSubscriptionPlans();
            console.log('Plans response:', response);
            setPlans(response);
            const planId = Object.keys(response)[0];
            setSelectedPlanId(planId);

            console.log('Creating initial subscription...');
            const subscriptionResponse = await createSubscription(
                user.companyId.toString(),
                response[planId].priceId,
                '' // We'll get the payment method later
            );
            console.log('Subscription response:', subscriptionResponse);

            if (subscriptionResponse?.clientSecret) {
                console.log('Setting client secret and showing payment form');
                setClientSecret(subscriptionResponse.clientSecret);
                setShowPayment(true);
            } else {
                console.error('No client secret in response');
                setError("Failed to initialize payment");
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            setError("Failed to create subscription");
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
            console.log('Creating final subscription with payment method...');
            const response = await createSubscription(
                user.companyId.toString(),
                plans[selectedPlanId].priceId,
                paymentMethodId
            );
            console.log('Final subscription response:', response);
            
            if (response.status === 'active') {
                setSuccess("Your subscription has been activated successfully");
            } else {
                setError("Subscription is not active. Please contact support if this persists.");
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            setError("Failed to create subscription");
        } finally {
            setLoading(false);
            setShowPayment(false);
            setSelectedPlanId(null);
            setClientSecret(null);
        }
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setSelectedPlanId(null);
        setClientSecret(null);
        setError("Subscription process was cancelled");
    };

    return (
        <div className="container py-8">
            <Card>
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
                    <p className="text-sm text-muted-foreground mb-4">
                        Subscribe to access all features of our platform.
                    </p>
                    {!showPayment ? (
                        <Button
                            onClick={handleStartSubscription}
                            disabled={loading || !user?.companyId}
                        >
                            {loading ? 'Loading...' : 'Start Subscription'}
                        </Button>
                    ) : (
                        clientSecret && (
                            <StripeProvider clientSecret={clientSecret}>
                                <PaymentForm
                                    onSuccess={handlePaymentSuccess}
                                    onCancel={handlePaymentCancel}
                                />
                            </StripeProvider>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 