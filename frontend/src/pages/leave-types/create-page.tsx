import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createLeaveType, LeaveTypePayload } from '@/services/leavetypeService';
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
    typeName: z.string().min(1, { message: "Leave type name is required." }).max(255, { message: "Leave type name cannot exceed 255 characters." }),
});

export type LeaveTypeFormValues = z.infer<typeof formSchema>;

const LeaveTypeCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<LeaveTypeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            typeName: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: LeaveTypePayload) => createLeaveType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leavetypes'] });
            navigate('/leave-types');
        },
        onError: (error: any) => {
            console.error('Create leave type mutation error:', error);
        },
    });

    const isLoading = mutation.isPending;

    const onSubmit = (values: LeaveTypeFormValues) => {
        mutation.mutate(values);
    };

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Create New Leave Type</CardTitle>
                    <CardDescription>Enter the name for the new leave type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="typeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Leave Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Sick Leave" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/leave-types')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Leave Type'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveTypeCreatePage; 