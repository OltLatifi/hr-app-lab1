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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreatePayLimitPayload, PayLimitResponse, updatePayLimit, getPayLimitById } from '@/services/paylimitService';
import { getDepartments, DepartmentResponse } from '@/services/departmentService';

const formSchema = z.object({
    limit: z.number().min(1, { message: "Pay limit is required." }),
    departmentId: z.number().min(1, { message: "Department is required." }),
});

export type PayLimitFormValues = z.infer<typeof formSchema>;

const PayLimitUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const payLimitId = Number(id);
    const queryClient = useQueryClient();

    const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<DepartmentResponse[]>({
        queryKey: ['departments'],
        queryFn: getDepartments,
    });

    const {
        data: payLimit,
        isLoading: isQueryLoading,
        isError: isQueryError,
        error: queryError,
    } = useQuery<PayLimitResponse, Error>({
        queryKey: ['paylimit', payLimitId],
        queryFn: () => getPayLimitById(payLimitId),
        enabled: !!payLimitId,
    });

    const form = useForm<PayLimitFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            limit: 0,
            departmentId: 0,
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (payLimit) {
            reset({ 
                limit: payLimit.limit,
                departmentId: payLimit.departmentId
            });
        }
    }, [payLimit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreatePayLimitPayload) =>
            updatePayLimit(payLimitId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paylimits'] });
            queryClient.invalidateQueries({ queryKey: ['paylimit', payLimitId] });
            navigate('/paylimits');
        },
        onError: (error: any) => {
            console.error('Update pay limit mutation error:', error);
        },
    });

    const isMutationLoading = mutation.isPending;
    const isLoading = isQueryLoading || isMutationLoading || isLoadingDepartments;

    const onSubmit = (values: PayLimitFormValues) => {
        mutation.mutate(values);
    };

    if (isQueryLoading) {
        return (
            <div className="flex justify-center items-center p-4 mt-8">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Update Pay Limit</CardTitle>
                        <CardDescription>Loading pay limit data...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <div className="h-10 w-20 bg-muted animate-pulse rounded" />
                                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isQueryError) {
        return (
            <div className="flex justify-center items-center p-4 mt-8">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription className="text-destructive">
                            {queryError?.message || 'Failed to load pay limit data'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => navigate('/paylimits')}>
                                Back to Pay Limits
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-4 mt-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Update Pay Limit</CardTitle>
                    <CardDescription>Modify the pay limit for a department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pay Limit</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number"
                                                placeholder="e.g., 10000" 
                                                {...field} 
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={isLoading} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            defaultValue={field.value?.toString()}
                                            value={field.value?.toString()}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingDepartments ? (
                                                    <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                                                ) : departments.length === 0 ? (
                                                    <SelectItem value="empty" disabled>No departments found</SelectItem>
                                                ) : (
                                                    departments.map((department) => (
                                                        <SelectItem 
                                                            key={department.departmentId}
                                                            value={department.departmentId.toString()}
                                                        >
                                                            {department.departmentName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate('/paylimits')} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isMutationLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PayLimitUpdatePage; 