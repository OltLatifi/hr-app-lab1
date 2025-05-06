import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createEmploymentStatus, CreateEmploymentStatusPayload } from '@/services/employmentstatusService';
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
    statusName: z.string().min(1, { message: "Employment status name is required." }).max(255, { message: "Employment status name cannot exceed 255 characters." }),
});

export type EmploymentStatusFormValues = z.infer<typeof formSchema>;

const EmploymentStatusCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<EmploymentStatusFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statusName: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: CreateEmploymentStatusPayload) => createEmploymentStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employmentstatuses'] });
            navigate('/employment-statuses');
        },
        onError: (error: any) => {
            console.error('Create employment status mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: EmploymentStatusFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Employment Status</CardTitle>
                    <CardDescription>Enter the name for the new employment status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="statusName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employment Status</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Full-Time" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/employment-statuses')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Employment Status'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmploymentStatusCreatePage; 