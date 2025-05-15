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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { getLeaveTypes } from '@/services/leavetypeService';
import { getLeaveRequestById, updateLeaveRequest } from '@/services/leaverequestService';

interface LeaveRequestResponse {
    id: number;
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    status: string;
}

const formSchema = z.object({
    leaveTypeId: z.number().min(1, { message: "Leave type is required." }),
    startDate: z.string().min(1, { message: "Start date is required." }),
    endDate: z.string().min(1, { message: "End date is required." }),
});

export type LeaveRequestFormValues = z.infer<typeof formSchema>;

const LeaveRequestUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const leaveRequestId = Number(id);
    const queryClient = useQueryClient();

    const {
        data: leaveRequest,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<LeaveRequestResponse, Error>({
        queryKey: ['leaveRequest', leaveRequestId],
        queryFn: () => getLeaveRequestById(leaveRequestId),
        enabled: !!leaveRequestId,
    });

    const { data: leaveTypes } = useQuery({
        queryKey: ['leaveTypes'],
        queryFn: () => getLeaveTypes(),
    });

    const form = useForm<LeaveRequestFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            leaveTypeId: undefined,
            startDate: '',
            endDate: '',
        }
    });

    const { reset } = form;

    useEffect(() => {
        if (leaveRequest) {
            reset({
                leaveTypeId: leaveRequest.leaveTypeId,
                startDate: leaveRequest.startDate,
                endDate: leaveRequest.endDate,
            });
        }
    }, [leaveRequest, reset]);

    const mutation = useMutation({
        mutationFn: (data: LeaveRequestFormValues) => updateLeaveRequest(leaveRequestId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['leaveRequest', leaveRequestId] });
            navigate('/leaves');
        },
        onError: (error: any) => {
            console.error('Update leave request mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading;
    const isNotPending = leaveRequest?.status.toLowerCase() !== 'pending';

    const onSubmit = (values: LeaveRequestFormValues) => {
        if (isNotPending) return;
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
                    Error loading leave request: {queryError?.message || 'Unknown error'}
                </p>
            );
        }

        if (isNotPending) {
            return (
                <Alert variant="destructive">
                    <AlertDescription>
                        This leave request cannot be updated because its status is {leaveRequest?.status}. Only pending requests can be modified.
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="leaveTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leave Type</FormLabel>
                                    <Select
                                        defaultValue={field.value?.toString()}
                                        value={field.value?.toString()}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a leave type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {leaveTypes?.map((leaveType) => (
                                                <SelectItem
                                                    key={leaveType.id}
                                                    value={leaveType.id.toString()}
                                                >
                                                    {leaveType.typeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => navigate('/leaves')} disabled={isLoading}>
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
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Update Leave Request</CardTitle>
                    <CardDescription>
                        Modify the details for the leave request.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderFormContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveRequestUpdatePage; 