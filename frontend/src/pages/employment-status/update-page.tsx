import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateEmploymentStatusPayload, EmploymentStatusResponse, updateEmploymentStatus } from '@/services/employmentstatusService';
import { getEmploymentStatusById } from '@/services/employmentstatusService';

const formSchema = z.object({
    statusName: z
        .string()
        .min(1, { message: 'Employment status name is required.' })
        .max(255, { message: 'Employment status name cannot exceed 255 characters.' }),
});

export type EmploymentStatusFormValues = z.infer<typeof formSchema>;

const EmploymentStatusUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const employmentStatusId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: employmentStatus,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<EmploymentStatusResponse, Error>({
        queryKey: ['employmentstatus', employmentStatusId],
        queryFn: () => getEmploymentStatusById(employmentStatusId),
        enabled: !!employmentStatusId,
    });

    const form = useForm<EmploymentStatusFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statusName: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (employmentStatus) {
            reset({ statusName: employmentStatus.statusName });
        }
    }, [employmentStatus, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateEmploymentStatusPayload) =>
            updateEmploymentStatus(employmentStatusId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employmentstatuses'] });
            queryClient.invalidateQueries({ queryKey: ['employmentstatus', employmentStatusId] });
            navigate('/employment-statuses');
        },
        onError: (error: any) => {
            console.error('Update employment status mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: EmploymentStatusFormValues) => {
        mutation.mutate(values);
    };

    const renderFormContent = () => {
        if (isQueryLoading) {
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="flex justify-end space-x-2">
                         <Skeleton className="h-10 w-20" />
                         <Skeleton className="h-10 w-24" />
                     </div>
                </div>
            );
        }

        if (isQueryError) {
            return (
                <p className="text-destructive">
                    Error loading employment status: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        return (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="statusName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employment Status</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Full-Time"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => navigate('/employment-statuses')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isMutationLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        );
    }

    return (
        <div className="flex justify-center items-start min-h-screen p-4 pt-10">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Update Employment Status</CardTitle>
                    <CardDescription>
                        Modify the details for the employment status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmploymentStatusUpdatePage; 