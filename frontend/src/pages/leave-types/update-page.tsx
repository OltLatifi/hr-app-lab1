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
import { LeaveTypePayload, LeaveTypeResponse, updateLeaveType } from '@/services/leavetypeService';
import { getLeaveTypeById } from '@/services/leavetypeService';

const formSchema = z.object({
    typeName: z
        .string()
        .min(1, { message: 'Leave type name is required.' })
        .max(255, { message: 'Leave type name cannot exceed 255 characters.' }),
});

export type LeaveTypeFormValues = z.infer<typeof formSchema>;

const LeaveTypeUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const leaveTypeId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: leaveType,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<LeaveTypeResponse, Error>({
        queryKey: ['leaveType', leaveTypeId],
        queryFn: () => getLeaveTypeById(leaveTypeId),
        enabled: !!leaveTypeId,
    });

    const form = useForm<LeaveTypeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            typeName: '',
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (leaveType) {
            reset({ typeName: leaveType.typeName });
        }
    }, [leaveType, reset]);

    const mutation = useMutation({
        mutationFn: (data: LeaveTypePayload) =>
            updateLeaveType(leaveTypeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leavetypes'] });
            queryClient.invalidateQueries({ queryKey: ['leaveType', leaveTypeId] });
            navigate('/leave-types');
        },
        onError: (error: any) => {
            console.error('Update leave type mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;

    const onSubmit = (values: LeaveTypeFormValues) => {
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
                    Error loading leave type: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        return (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="typeName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Leave Type</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Sick Leave"
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
                            onClick={() => navigate('/leave-types')}
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
                    <CardTitle>Update Leave Type</CardTitle>
                    <CardDescription>
                        Modify the details for the leave type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveTypeUpdatePage; 