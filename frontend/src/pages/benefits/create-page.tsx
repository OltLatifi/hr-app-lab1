import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBenefit, CreateBenefitPayload } from '@/services/benefitService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    name: z.string().min(1, { message: "Benefit name is required." }).max(255, { message: "Benefit name cannot exceed 255 characters." }),
});

export type BenefitFormValues = z.infer<typeof formSchema>;

const BenefitCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<BenefitFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateBenefitPayload) => createBenefit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['benefits'] });
            navigate('/benefits');
        },
        onError: (error: any) => {
            console.error('Create benefit mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: BenefitFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Benefit</CardTitle>
                    <CardDescription>Enter the name for the new benefit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Benefit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Health Insurance" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/benefits')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Benefit'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default BenefitCreatePage; 