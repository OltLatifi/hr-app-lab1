import apiClient from '@/lib/api-client';

export const getSubscriptionPlans = async () => {
    try {
        const response = await apiClient.get('/subscriptions/plans');
        return response.data;
    } catch (error) {
        console.error('API Error Creating Training:', error);
        throw error; 
    }
}; 

export const createSubscription = async (companyId: string, priceId: string, paymentMethodId: string) => {
    try {
        const response = await apiClient.post('/subscriptions/create', { 
            companyId, 
            priceId,
            paymentMethodId 
        });
        return response.data;
    } catch (error) {
        console.error('API Error Creating Subscription:', error);
        throw error;
    }
}; 

export const updateSubscription = async (subscriptionId: string, priceId: string) => {
    try {
        const response = await apiClient.post('/subscriptions/update', { subscriptionId, priceId });
        return response.data;
    } catch (error) {
        console.error('API Error Updating Subscription:', error);
        throw error;
    }
};  

export const cancelSubscription = async (subscriptionId: string) => {
    try {
        const response = await apiClient.post('/subscriptions/cancel', { subscriptionId });
        return response.data;
    } catch (error) {
        console.error('API Error Cancelling Subscription:', error);
        throw error;
    }
};  